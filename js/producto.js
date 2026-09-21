// producto.js 

const contenedorDetalle = document.getElementById("detalle-producto");

function obtenerIdDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function buscarProductoPorId(id) {
  return productos.find((p) => p.id === id);
}

const idProducto = obtenerIdDesdeURL();
const producto = idProducto ? buscarProductoPorId(idProducto) : null;


const mensajeNoEncontrado = document.getElementById("producto-no-encontrado");

function mostrarNoEncontrado() {
  contenedorDetalle.classList.add("d-none");
  mensajeNoEncontrado.classList.remove("d-none");
}

if (producto) {
  renderizarDetalle(producto);
} else {
  mostrarNoEncontrado();
}


function renderizarDetalle(producto) {
  contenedorDetalle.innerHTML = `
    <div class="row">
      <div class="col-md-5">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid rounded">
      </div>
      <div class="col-md-7">
        <h2>${producto.nombre}</h2>
        <p class="text-muted">${producto.categoria}</p>
        <p>${producto.descripcion}</p>
        <p class="fs-4 fw-bold">$${producto.precio.toLocaleString("es-UY")}</p>
        <p><small>Stock disponible: ${producto.stock}</small></p>
        <button id="btn-agregar-detalle" class="btn btn-primary">Agregar al carrito</button>
      </div>
    </div>
  `;

document.getElementById("btn-agregar-detalle").addEventListener("click", () => {
  const agregado = agregarAlCarrito(producto.id, 1);
  if (agregado) {
    alert(`${producto.nombre} se agregó al carrito.`);
  } else {
    alert(`Ya tenés el stock máximo de "${producto.nombre}" en el carrito.`);
  }
});
}
