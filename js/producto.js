// producto.js 

const contenedorDetalle = document.getElementById("detalle-producto");

function obtenerIdDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function buscarProductoPorId(id) {
  return productos.find((p) => p.id === id);
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
      </div>
    </div>
  `;
}

const idProducto = obtenerIdDesdeURL();
const producto = idProducto ? buscarProductoPorId(idProducto) : null;

if (producto) {
  renderizarDetalle(producto);
}


// ============================================================
// DÍA 10 (8/9) — Mensaje "producto no encontrado"
// Commit: "Agrega mensaje de producto no encontrado"
// ============================================================
/*
const mensajeNoEncontrado = document.getElementById("producto-no-encontrado");

function mostrarNoEncontrado() {
  contenedorDetalle.classList.add("d-none");
  mensajeNoEncontrado.classList.remove("d-none");
}

// Reemplazá el bloque final del Día 9 (el "if (producto) {...}") por este:
if (producto) {
  renderizarDetalle(producto);
} else {
  mostrarNoEncontrado();
}
*/


// ============================================================
// DÍA 11 (9/9) — Botón "Agregar al carrito" en el detalle
// (Ese día también agregás <script src="js/carrito.js"></script> en producto.html,
//  ANTES del script de producto.js)
// Commit: "Implementa agregar productos al carrito con LocalStorage"
// ============================================================
/*
// Reemplazá renderizarDetalle del Día 9 por esta versión con botón:
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
    agregarAlCarrito(producto.id, 1);
    alert(`${producto.nombre} se agregó al carrito.`);
  });
}
*/
