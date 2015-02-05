    // Trabajamos con un objeto (modelo), que contiene un array (barcos), que a su vez contiene objetos con dos atributos: localizaciones y impactos (ambos arrays) 
    // modelo tiene los métodos: fuego, estaHundido, generaLocalizacionesBarcos, generaBarco y colision

    function iniciarBarcos() {
        var arrayBarcos = [];
        for (var i = 0; i < numBarcos; i++) {
            arrayBarcos.push({
                localizaciones: longitud(),
                impactos: impacto()
            });
        }
        return arrayBarcos;
    }

    function longitud() {
        var longitud = [];
        for (var j = 0; j < tamBarco; j++) {
            longitud.push(0);
        }
        return longitud;
    }

    function impacto() {
        var longitud = [];
        for (var j = 0; j < tamBarco; j++) {
            longitud.push("");
        }
        return longitud;
    }

    var modelo = {
        tamanioPanel: 7,
        numeroBarcos: numBarcos,
        longitudBarco: tamBarco,
        barcosHundidos: 0,
        barcos: iniciarBarcos(),
        fuego: function (id) {
            for (var i = 0; i < this.numeroBarcos; i++) {
                var barco = this.barcos[i];

                var indice = barco.localizaciones.indexOf(id); //devuelve -1 si no encuentra la cadena buscada en las localizaciones

                //Miramos si el barco ya está tocado 
                if (barco.impactos[indice] === "tocado") {
                    vista.visualizarMensaje("Este ya está tocado");
                    return false;
                } else if ($("#" + id).hasClass("agua")) {
                    vista.visualizarMensaje("Ya has disparado aquí");
                    return false;
                } else if (indice >= 0) {
                    barco.impactos[indice] = "tocado";
                    vista.visualizarTocado(id); //Dibuja el barquito en el lugar del impacto (usando class y css)
                    vista.visualizarMensaje("¡TOCADO!");
                    sonido("tocado");

                    if (this.estaHundido(barco)) {
                        vista.visualizarMensaje("¡HUNDIDO!");
                        $.each(barco.localizaciones, function (key, value) {
                            $("#" + value).effect("pulsate", {}, 500, null);
                            $('#' + value).removeClass("tocado");
                            $('#' + value).addClass("hundido");
                        });
                        this.barcosHundidos++;
                    } else {
                        $('#' + id).effect("pulsate", {}, 500, null);
                        var audio = {};
                    }
                    return true;
                }
            }
            vista.visualizarAgua(id);
            vista.visualizarMensaje("¡Agua!");
            sonido("agua");
            return true;
        },
        reiniciar: function () {
            this.barcos = iniciarBarcos();
        },
        estaHundido: function (barco) {
            for (var i = 0; i < this.longitudBarco; i++) {
                if (barco.impactos[i] !== "tocado") {
                    return false;
                }
            }
            return true;
        },

        generaLocalizacionesBarcos: function () {
            var localizaciones;
            for (var i = 0; i < this.numeroBarcos; i++) { //genera la localización de cada barco
                do {
                    localizaciones = this.generaBarco();
                } while (this.colision(localizaciones)); //repetimos generaBarco() mientras que el método colision devuelva true
                this.barcos[i].localizaciones = localizaciones;
            }
        },

        generaBarco: function () { // Sitúa el barco aleatoriamente (en vertical u horizontal)
            var direccion = Math.floor(Math.random() * 2); //genera un número entre 0 y 1
            var fila, columna;
            // se generan aleatoriamente las filas y columnas donde se va a colocar el primer trozo del barco (cada barco tiene una longitud que puede ocupar varias celdas)
            if (direccion === 1) { // horizontal
                fila = Math.floor(Math.random() * this.tamanioPanel); //genera un número entre 0 y  el tamaño del panel (empieza en cualquier fila)
                columna = Math.floor(Math.random() * (this.tamanioPanel - this.longitudBarco));
                //genera un número entre 0 y el tamaño panel -longitud barco (para que no se salga del panel por la derecha) 
            } else { // vertical
                fila = Math.floor(Math.random() * (this.tamanioPanel - this.longitudBarco)); //puede empezar desde la columna 0 hasta tamañopanel-longitud barco (para que no se salga por abajo)
                columna = Math.floor(Math.random() * this.tamanioPanel); //Puede empezar en cualquier columna
            }

            var nuevasLocalizacionesBarco = [];
            for (var i = 0; i < this.longitudBarco; i++) { //Da los siguientes trozos del barco 
                if (direccion === 1) { //horizontal
                    nuevasLocalizacionesBarco.push(fila + "" + (columna + i)); // Ponemos "" para que lo convierta en un string y no sume los valores numéricos
                } else {
                    nuevasLocalizacionesBarco.push((fila + i) + "" + columna); //vertical
                }
            }
            //alert(nuevasLocalizacionesBarco);
            return nuevasLocalizacionesBarco; //devuelve un array con contenido parecido a : 04,14,24
        },

        colision: function (localizaciones) { //localizaciones es un array con la localización de cada trozo del barco (ej: 04,14,24)
            for (var i = 0; i < this.numeroBarcos; i++) { //Busca cada una de las localizaciones generadas en todos los barcos y si encuentra una colisión devuelve true
                var barco = this.barcos[i];
                for (var j = 0; j < localizaciones.length; j++) {
                    if (barco.localizaciones.indexOf(localizaciones[j]) >= 0) { //Si hay colisión 
                        return true;
                    }
                }
            }
            return false;
        }
    };

    // Objeto para procesar y contar los intentos de tocado y hundido
    var controlador = {
        intentos: 0,
        procesarIntento: function (id) { //Intento contiene un string del tipo "60"
            if (modelo.fuego(id)) { //true si es un acierto o fallo, false si ya has disparado hay
                this.intentos++;
            }
            if (modelo.barcosHundidos === modelo.numeroBarcos) {
                vista.visualizarMensaje("Has hundido todos los barcos en " + this.intentos + " intentos");
                sonido("final");
                //guardar partida
                var fecha = new Date();
                var clave = "bar_" + fecha.getTime();
                localStorage.setItem(clave, this.intentos);
                mensajePartida();
                $("td").off("click");
                var reset = $("<input/>", {
                    type: "button",
                    value: "Reiniciar"
                });
                $("#areaMensaje").append(reset);
                mensajePartida();
                reset.button();
                reset.on("click", function () {
                    $("td").removeClass("tocado");
                    $("td").removeClass("hundido");
                    $("td").removeClass("agua");
                    modelo.barcosHundidos = 0;
                    modelo.reiniciar();
                    controlador.intentos = 0;
                    $("#areaMensaje").text("");
                    inicio();
                });
            }
        }
    }

    var vista = {
        visualizarMensaje: function (mensaje) {
            $("#areaMensaje").text(mensaje);
        },
        visualizarTocado: function (localizacion) {
            $('#' + localizacion).addClass("tocado");
        },
        visualizarAgua: function (localizacion) {
            $('#' + localizacion).addClass("agua");
        }
    };

    function mensajePartida() {
        var min = 50,
            max = 0,
            total = 0,
            cont = 0;
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.substring(0, 4) == "bar_") {
                var value = localStorage.getItem(key);
                total += parseInt(value);
                cont++;
                if (value < parseInt(min)) {
                    min = value;
                }
                if (value > parseInt(max)) {
                    max = value;
                }
            }
        }
        var texto = "";
        if (cont > 0) {
            texto = "Has jugado " + cont + " partida(s), en " + total + " intentos.";
        }
        if (cont > 1) {
            texto += "Mejor: " + min + " intentos.Peor: " + max + " intentos";
        }
        $("#partidas").text(texto);
        var resetPart = $("<input/>", {
            type: "button",
            value: "Reset",
            id: "resetPartida"
        });
        if (cont > 0) {
            $("#partidas").append(resetPart);
        }
        resetPart.button();
        resetPart.on("click", function () {
            $("#dialog-confirm").dialog({
                resizable: false,
                height: 250,
                width: 300,
                modal: true,
                buttons: {
                    "Si": function () {
                        for (var i = 0; i < localStorage.length; i++) {
                            var key = localStorage.key(i);
                            if (key.substring(0, 4) === "bar_") {
                                localStorage.removeItem(localStorage.key(i));
                            }
                        }
                        mensajePartida();
                        $(this).dialog("close");
                    },
                    "No": function () {
                        $(this).dialog("close");
                    }
                }
            });
        });
    }

    function sonido(tipo) {
        var audioElement = document.createElement('audio');
        $(audioElement).attr('src', "mp3/" + tipo + ".mp3");
        $(audioElement).attr('autoplay', 'autoplay');
    }

    function comenzar(array) {
        function imp(longitud) {
            var salida = [];
            for (var j = 0; j < longitud; j++) {
                salida.push("");
            }
            return salida;
        }
        var arrayBarcos = new Array;
        for (var i = 0; i < numBarcos; i++) {
            for (var x = 0; x < array.length; x++) {
                arrayBarcos.push({
                    localizaciones: array[x],
                    impactos: imp(array[x].length)
                });
            }
        }
        modelo.barcos = arrayBarcos;
        $("td").removeClass("colocado");
        $("td").removeClass("ancla");
        $("td").on("click", function () {
            controlador.procesarIntento($(this).attr("id"));
        });
    }

    function cercanos(id, longitud, esteBarco) {
        if (longitud < 2) {
            if ((id > 10 && id < 16) || (id > 20 && id < 26) || (id > 30 && id < 36) || (id > 40 && id < 46) || (id > 50 && id < 56)) {
                // centro
                if (!$("#" + (id - 10)).hasClass("colocado")) {
                    $("#" + (id - 10)).addClass("posible");
                }
                if (!$("#" + (id + 10)).hasClass("colocado")) {
                    $("#" + (id + 10)).addClass("posible");
                }
                if (!$("#" + (id - 1)).hasClass("colocado")) {
                    $("#" + (id - 1)).addClass("posible");
                }
                if (!$("#" + (id + 1)).hasClass("colocado")) {
                    $("#" + (id + 1)).addClass("posible");
                }
            }
            
            if (id > 0 && id < 5) {
                // superior
                if (!$("#" + (id + 10)).hasClass("colocado")) {
                    $("#" + (id + 10)).addClass("posible");
                }
                if (!$("#" + (id - 1)).hasClass("colocado")) {
                    $("#" + (id - 1)).addClass("posible");
                }
                if (!$("#" + (id + 1)).hasClass("colocado")) {
                    $("#" + (id + 1)).addClass("posible");
                }
            }
            if (id > 50 && id < 56) {
                // inferior
                if (!$("#" + (id - 10)).hasClass("colocado")) {
                    $("#" + (id - 10)).addClass("posible");
                }
                if (!$("#" + (id - 1)).hasClass("colocado")) {
                    $("#" + (id - 1)).addClass("posible");
                }
                if (!$("#" + (id + 1)).hasClass("colocado")) {
                    $("#" + (id + 1)).addClass("posible");
                }
            }
            if (id === 10 || id === 20 || id === 30 || id === 40 || id === 50) {
                // izquierda
                if (!$("#" + (id - 10)).hasClass("colocado")) {
                    $("#" + (id - 10)).addClass("posible");
                }
                if (!$("#" + (id + 10)).hasClass("colocado")) {
                    $("#" + (id + 10)).addClass("posible");
                }
                if (!$("#" + (id + 1)).hasClass("colocado")) {
                    $("#" + (id + 1)).addClass("posible");
                }
            }            
            if (id === 60 || id === 16 || id === 26 || id === 36 || id === 46) {
                // derecha
                if (!$("#" + (id - 10)).hasClass("colocado")) {
                    $("#" + (id - 10)).addClass("posible");
                }
                if (!$("#" + (id + 10)).hasClass("colocado")) {
                    $("#" + (id + 10)).addClass("posible");
                }
                if (!$("#" + (id - 1)).hasClass("colocado")) {
                    $("#" + (id - 1)).addClass("posible");
                }
            }
        }
        $(".posible").on("click", function () {
            $(this).addClass("colocado");
            $("td").removeClass("posible");
            esteBarco.push($(this).attr("id"));
            if (longitud < tamBarco) {
                cercanos($(this).attr("id"), longitud++, esteBarco);
            } else {
                //
            }
        });
    }



    function colocarBarcos() {
        console.log(numBarcos);
        console.log(tamBarco);
        //guardar un array de numBarcos elementos con tamBarcos cada elemento
        var array = new Array();
        $("td").on("click", function () {
            if ($(".colocado").size() < numBarcos) {
                $(this).addClass("colocado");
                var esteBarco = new Array();
                esteBarco.push($(this).attr("id"));
                if (tamBarco > 1) {
                    //cercanos($(this).attr("id"), esteBarco.length, esteBarco);
                    cercanos($(this).attr("id"), 1, esteBarco);
                }
                array.push(esteBarco);
            } else {
                $("td").off("click");
                console.log(array);
                comenzar(array);
            }
        });

    }

    function init() {
        mensajePartida();
        $("#dialog-form-ancla").dialog({
            autoOpen: true,
            dialogClass: "no-close",
            closeOnEscape: false,
            height: 250,
            width: 300,
            modal: true,
            open: function (event, ui) {
                $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
            },
            buttons: {
                "Manual": function () {
                    $("#dialog-form-ancla").dialog("close");
                    $("td").addClass("ancla");
                    colocarBarcos();
                    //$("td").off("click");
                    //pasar el array al modelo
                    /* $("td").on("click", function () {
                         controlador.procesarIntento($(this).attr("id"));
                     });*/
                },
                "Al azar": function () {
                    modelo.generaLocalizacionesBarcos();
                    $("td").on("click", function () {
                        controlador.procesarIntento($(this).attr("id"));
                    });
                    $("#dialog-form-ancla").dialog("close");
                }
            }
        });


    }

    var numBarcos = 3;
    var tamBarco = 3;
    var imagenes = "agua.png, panel.jpg, barco.png".split(",");
    var tempImg = [];
    for (var i = 0; i < imagenes.length; i++) {
        tempImg[i] = $("img");
        tempImg[i].src = imagenes[i];
    }

    function inicio() {
        $("#dialog-form").dialog({
            autoOpen: true,
            dialogClass: "no-close",
            closeOnEscape: false,
            height: 250,
            width: 300,
            modal: true,
            open: function (event, ui) {
                $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
            },
            buttons: {
                "Empezar": function () {
                    numBarcos = $("#num").select().val();
                    modelo.numeroBarcos = parseInt(numBarcos);
                    tamBarco = $("#long").select().val();
                    modelo.longitudBarco = parseInt(tamBarco);
                    modelo.reiniciar();
                    $("#dialog-form").dialog("close");
                    init();
                }
            }
        });
    }
    $(function () {
        inicio();
    });