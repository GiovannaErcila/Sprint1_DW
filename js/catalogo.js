// catalogo.js

// Commit: "Agrega array de productos con datos base"
console.log("Productos cargados:", productos.length, productos);

// Commit: "Genera catálogo dinámico desde JavaScript"
const contenedorCatalogo = document.getElementById("catalogo");


const inputBusqueda = document.getElementById("buscador");

function aplicarFiltros() {
  const texto = inputBusqueda.value.trim().toLowerCase();
  const resultado = productos.filter((p) => p.nombre.toLowerCase().includes(texto));
  renderizarCatalogo(resultado);
}

inputBusqueda.addEventListener("input", aplicarFiltros);


const selectCategoria = document.getElementById("filtro-categoria");

function cargarCategorias() {
  const categorias = [...new Set(productos.map((p) => p.categoria))];
  categorias.forEach((categoria) => {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    opcion.textContent = categoria;
    selectCategoria.appendChild(opcion);
  });
}

function aplicarFiltros() {
  const texto = inputBusqueda.value.trim().toLowerCase();
  const categoria = selectCategoria.value;
  const resultado = productos.filter((p) => {
    const coincideTexto = p.nombre.toLowerCase().includes(texto);
    const coincideCategoria = categoria === "" || p.categoria === categoria;
    return coincideTexto && coincideCategoria;
  });
  renderizarCatalogo(resultado);
}

cargarCategorias();
selectCategoria.addEventListener("change", aplicarFiltros);

const mensajeSinResultados = document.getElementById("sin-resultados");

function renderizarCatalogo(lista) {
  contenedorCatalogo.innerHTML = "";
  if (lista.length === 0) {
    mensajeSinResultados.classList.remove("d-none");
    return;
  }
  mensajeSinResultados.classList.add("d-none");
  lista.forEach((producto) => {
    contenedorCatalogo.appendChild(crearTarjetaProducto(producto));
  });
}

const btnLimpiar = document.getElementById("limpiar-filtros");

function limpiarFiltros() {
  inputBusqueda.value = "";
  selectCategoria.value = "";
  renderizarCatalogo(productos);
}

btnLimpiar.addEventListener("click", limpiarFiltros);
renderizarCatalogo(productos);
function posicionImagen(id) {
  const posiciones = {
    p1: "top",     // Auriculares - se corta arriba, mostramos más de la parte de arriba
    p6: "bottom",  // Mochila - no sale entera, probamos con la parte de abajo
    p8: "center",  // Webcam - probamos centrado primero
    p9: "top"      // Silla Gamer - probamos con la parte de arriba
  };
  return posiciones[id] || "center";
}

function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("div");
  tarjeta.classList.add("col-md-4", "mb-4");
  tarjeta.innerHTML = `
    <div class="card h-100">
      <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="${producto.id === 'p4' || producto.id === 'p1' || producto.id === 'p6' || producto.id === 'p8' || producto.id === 'p9' ? 'object-position: top;' : ''}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${producto.nombre}</h5>
        <p class="card-text text-muted mb-1">${producto.categoria}</p>
        <p class="card-text fw-bold">$${producto.precio.toLocaleString("es-UY")}</p>
        <p class="card-text"><small>Stock: ${producto.stock}</small></p>
        <div class="mt-auto d-flex gap-2">
          <a href="producto.html?id=${producto.id}" class="btn btn-outline-primary btn-sm">Ver detalle</a>
          <button class="btn btn-primary btn-sm" data-id="${producto.id}">Agregar</button>
        </div>
      </div>
    </div>
  `;

  const botonAgregar = tarjeta.querySelector("button[data-id]");
  botonAgregar.addEventListener("click", () => {
    agregarAlCarrito(producto.id, 1);
    botonAgregar.textContent = "Agregado";
    setTimeout(() => (botonAgregar.textContent = "Agregar"), 1000);
  });

  return tarjeta;
}

