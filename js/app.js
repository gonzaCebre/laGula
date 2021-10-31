//Creando la clase para los menus
class Menu {
    constructor(id, nombre, descripcion, precio, categoria, stock, foto) {
        this.id = parseInt(id);
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = parseInt(precio);
        this.categoria = categoria;
        this.stock = parseInt(stock);
        this.foto = foto;
    }

}


//VARIABLES GLOBALES
let index = 0; //Para modificar texto del boton del carrito
let total = 0; //Para modificar el total de la compra
const carritoArray = []; //Array donde va a ir todo lo del carrito
const carritoLocal = localStorage.getItem("carrito"); //Carrito almacenado en localStorage
let botonCarrito = $("#botonCarrito"); //Boton del carrito

//Agrega cartel de "agregado al carrito"
const cartelAgregado = (producto) => { //Ingresa el producto por parametro
    let cartelCarrito = document.createElement("p"); //Crea la nueva etiqueta
    cartelCarrito.innerHTML = `${producto.nombre} <br> agregado a tu compra`; //Agrega el nombre del producto a la etiqueta creada
    cartelCarrito.classList.add("cartel");

    let seccionEventos = $("#seccionEventos");
    $(seccionEventos).append(cartelCarrito) //Pinta en pantalla la nueva etiqueta
        .show(1000); //Con una animacion

    $(cartelCarrito).fadeOut(1500, function () { alCarrito(producto) }); //El cartel desaparece y llama a la funcion

    enviarAStorage(producto); //Llama a la funcion

}


//Envia el nuevo carrito hacia el localStorage
const enviarAStorage = (producto) => {
    carritoArray.push(producto); //Guarda ese producto en el array
    localStorage.setItem("carrito", JSON.stringify(carritoArray)); //Convierte el array del carrito en JSON y lo guarda en el localStorage
}


//Funcion que se activa cuando se presiona el boton de "agregar al carrito"
const alCarrito = (producto) => {
    index++; //Modifica en uno la cantidad del carrito mostrada en el boton del carrito
    total = total + producto.precio; //Agrega el costo del producto agregado al carrito al total ya existente

    $(botonCarrito).show(500) //El boton del carrito estaba oculto hasta que se le hizo click
        .html(`Tu compra (${index})`); //El texto del boton va a incluir la cantidad de productos del carrito
}


//Funcion que se va a ejecutar cuando se presione el boton de "cancelar compra" en el carritto
const cancelar = () => {

    //Limpia la pantalla
    $("#seccionCarrito").slideUp(1000)
        .html(" ");

    carritoArray.length = 0; //Se vacia completamente el carrito
    total = 0; //Se resetea el total
    index = 0; //Se resetea la cantidad de productos

    localStorage.setItem("carrito", JSON.stringify(carritoArray)); //Vacia el localStorage

}

//Metiendo los productos almacenados en el storage en nuestro array 
const convertirCarritoEnStorage = () => {

    if (carritoLocal != null) { // Si el carrito tiene elementos en localStorage 
        const carritoLocalObject = JSON.parse(carritoLocal); //Parsea los datos y los guarda en una nueva variable

        for (const producto of carritoLocalObject) { //Carga cada uno de los articulos del localStorage en el carrito
            carritoArray.push(new Menu(producto.id, producto.nombre, producto.descripcion, producto.precio, producto.categoria, producto.stock, producto.foto)) //Agregamos los productos al array del Carrito
            alCarrito(producto); //Muestra el boton del carrito
            $("#seccionEventos").removeClass("noDisplay"); //Muestra la seccion eventos
        }
    }
}

//Si el carrito esta vacio...
const carritoVacio = () => {
    if (carritoArray.length != 0) { //Si el carrito tiene algo
        mostrarCarrito(); //Mostrarlo
    } else { //Si el carrito esta vacio
        let carritoCard = document.getElementById("carritoCard");
        carritoCard.parentNode.removeChild(carritoCard); //Eliminar el div
        localStorage.removeItem("carrito"); //Remover los elementos del localStorage
    }
}


//Se ejecuta al presionar el boton de eliminar un elemento del carrito
const quitarElemento = (elemento) => {

    if (carritoArray.length != 1) { //Si el carrito tiene mas de un elemento
        let indexElemento = carritoArray.indexOf(elemento); //Conocer el index del elemento dentro del array
        carritoArray.splice(indexElemento, 1); //Eliminar ese elemento

        $("#carritoCard").remove();//Elimina el nodo del elemento
        total = total - elemento.precio; //Modificar el total del carrito, restandole el costo del elemento

        localStorage.setItem("carrito", JSON.stringify(carritoArray)); //Setear nuevamente el localStorage 

        carritoVacio();
    }
}

//Funcion que simula enviar la compra al backend
const confirmarCompra = () => {

    const URLGET = "https://jsonplaceholder.typicode.com/posts"; //Declaramos la url que vamos a usar para el GET
    const infoPost = { texto: "Compra finalizada" }; //Texto que va a devolver

    $.post(URLGET, infoPost, (respuesta, estado) => {
        if (estado === "success") {
            //Crea un aviso
            $("#seccionCarrito").prepend($(document.createElement("p"))
                .html(`${respuesta.texto}`)
                .addClass("cartelExitoso")
            );
        }
    });


    setTimeout(function () {
        cancelar();
        location.reload();
    }, 3000); //Actualiza la pagina luego de 3 segundos
}

//Se va a ejecutar cuando se presione el boton del carrito 
const mostrarCarrito = () => {

    $(botonCarrito).hide(); //Se deja de mostrar el boton
    $("#seccionMenus").html(" ");

    //Se crea el contenedor de los elementos
    let carritoCard = document.createElement("div");
    $(carritoCard).addClass("carritoCard");
    carritoCard.id = "carritoCard";
    $(carritoCard).html("Tu compra es: ");

    //Se crea un div para detallar cada uno de los menus seleccionados
    let menusSeleccionados = document.createElement("div");
    menusSeleccionados.classList.add("menusSeleccionados");
    carritoCard.append(menusSeleccionados);

    //Se crea un elemento para cada uno de los menus seleccionados
    for (const elemento of carritoArray) {

        let seleccionado = document.createElement("div");
        $(seleccionado).addClass("seleccionado")
            .html(`
                <div class="menuEnCarrito">
                    <span class="negrita titulo">${elemento.nombre}</span>
                    <span>$${elemento.precio}</span>
                </div>
            `);

        //Se crea el boton de eliminar el elemento
        let botonQuitar = $(document.createElement("button"))
            .html("X")
            .addClass("botonQuitar")
            .on("click", () => quitarElemento(elemento));

        $(seleccionado).append(botonQuitar);
        menusSeleccionados.appendChild(seleccionado);
    }

    let tituloTotal = $(document.createElement("p"))
        .html(`TOTAL: $${total}`)
        .addClass("negrita, precio");

    //Boton finalizar compra
    let finalizarCompra = $(document.createElement("button"))
        .html("Confirmar compra")
        .addClass("botonConfirmarCompra")
        .on("click", () => confirmarCompra());

    //Boton cancelar compra
    let cancelarCompra = $(document.createElement("button"))
        .html("Cancelar")
        .addClass("botonCancelarCompra")
        .on("click", () => cancelar())

    $(carritoCard).append(tituloTotal, finalizarCompra, cancelarCompra);


    //Se anida el carrito a la seccion correspondiente del html
    $("#seccionCarrito").append(carritoCard);

    //Se muestra el carrito
    $("#seccionCarrito").slideDown(1000);
}




//                                      PINTANDO LOS MENUS EN PANTALLA                                      //

//Declaramos la url que vamos a usar para el GET
let URLGET = ""


$("#desayunos").click(() => {
    URLGET = "https://my-json-server.typicode.com/gonzacebre/laGula/desayunos";
    llamarMenus();
});
$("#brunch").click(() => {
    URLGET = "https://my-json-server.typicode.com/gonzacebre/laGula/brunchs";
    llamarMenus();
});
$("#almuerzos").click(() => {
    URLGET = "https://my-json-server.typicode.com/gonzacebre/laGula/almuerzos";
    llamarMenus();
});

$("#tortas").click(() => {
    URLGET = "https://my-json-server.typicode.com/gonzacebre/laGula/tortas";
    llamarMenus();
});

//Escuchamos el evento click del botón agregado
const llamarMenus = () => {
    $.get(URLGET, function (respuesta, estado) {
        if (estado === "success") {
            let menus = respuesta;
            mostrarMenus(menus);
        }
    });
}

const mostrarMenus = (menus) => {

    $(seccionMenus).html(" "); //Limpia lo mostrado en pantalla

    for (const elemento of menus) {

        let menu = document.createElement("article");
        $(menu).addClass("cardMenu");

        let botonAgregarAlCarrito = $(document.createElement("button"))
            .html("Agregar al carrito")
            .addClass("botonAlCarrito")
            .on('click', () => cartelAgregado(elemento));

        $(menu).append(
            `
                <p class="negrita titulo">${elemento.nombre}</p>
                <img class="foto" src="${elemento.foto}">
                <p class="descripcion">${elemento.descripcion}</p>
                <p class="negrita precio">$${elemento.precio}</p>
                `
        );

        $(menu).append(botonAgregarAlCarrito);

        $("#seccionMenus").append(menu);
    }

    $("#seccionMenus").addClass("seccionMenus");

}


//Cuando se cargue la pagina
$(window).on('load', function () {
    convertirCarritoEnStorage();
});
