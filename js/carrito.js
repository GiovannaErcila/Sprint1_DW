// carrito.js
// Requiere productos.js cargado antes.
// Se incluye en catalogo.html, producto.html y carrito.html porque las tres páginas
// necesitan agregarAlCarrito() o leer/mostrar el carrito.

const CLAVE_CARRITO = "bytenova_carrito";

// --- Persistencia en LocalStorage --------------------------------------

function obtenerCarrito() {
  const datos = localStorage.getItem(CLAVE_CARRITO);
  return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  actualizarBadgeCarrito();
}

// Actualiza el número del carrito en el ícono del navbar (presente en todas las páginas)
function actualizarBadgeCarrito() {
  const carrito = obtenerCarrito();
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  document.querySelectorAll(".cart-indicator .badge").forEach((badge) => {
    badge.textContent = totalItems;
  });
}

// --- Operaciones sobre el carrito ---------------------------------------

function agregarAlCarrito(idProducto, cantidad) {
  const carrito = obtenerCarrito();
  const producto = productos.find((p) => p.id === idProducto);
  if (!producto) return;

  const item = carrito.find((i) => i.id === idProducto);

  if (item) {
    const nuevaCantidad = item.cantidad + cantidad;
    item.cantidad = Math.min(nuevaCantidad, producto.stock);
  } else {
    carrito.push({ id: idProducto, cantidad: Math.min(cantidad, producto.stock) });
  }

  guardarCarrito(carrito);
  if (typeof renderizarCarrito === "function") renderizarCarrito();
}

function cambiarCantidad(idProducto, delta) {
  const carrito = obtenerCarrito();
  const producto = productos.find((p) => p.id === idProducto);
  const item = carrito.find((i) => i.id === idProducto);
  if (!item || !producto) return;

  item.cantidad += delta;

  if (item.cantidad <= 0) {
    eliminarDelCarrito(idProducto);
    return;
  }

  if (item.cantidad > producto.stock) {
    item.cantidad = producto.stock;
  }

  guardarCarrito(carrito);
  renderizarCarrito();
}

function eliminarDelCarrito(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter((i) => i.id !== idProducto);
  guardarCarrito(carrito);
  renderizarCarrito();
}

// --- Render (solo aplica en carrito.html) --------------------------------

const contenedorCarrito = document.getElementById("carrito-items");
const mensajeCarritoVacio = document.getElementById("carrito-vacio");
const totalCarritoEl = document.getElementById("carrito-total");
const btnConfirmarCompra = document.getElementById("confirmar-compra");

function renderizarCarrito() {
  if (!contenedorCarrito) return; // esta función solo corre en carrito.html

  const carrito = obtenerCarrito();
  contenedorCarrito.innerHTML = "";

  if (carrito.length === 0) {
    mensajeCarritoVacio.classList.remove("d-none");
    totalCarritoEl.textContent = "$0";
    return;
  }

  mensajeCarritoVacio.classList.add("d-none");

  let total = 0;

  carrito.forEach((item) => {
    const producto = productos.find((p) => p.id === item.id);
    if (!producto) return;

    const subtotal = producto.precio * item.cantidad;
    total += subtotal;

    const fila = document.createElement("div");
    fila.classList.add("row", "align-items-center", "border-bottom", "py-2");
    fila.innerHTML = `
      <div class="col-4">${producto.nombre}</div>
      <div class="col-2">$${producto.precio.toLocaleString("es-UY")}</div>
      <div class="col-3 d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" data-accion="restar">-</button>
        <span>${item.cantidad}</span>
        <button class="btn btn-sm btn-outline-secondary" data-accion="sumar">+</button>
      </div>
      <div class="col-2">$${subtotal.toLocaleString("es-UY")}</div>
      <div class="col-1">
        <button class="btn btn-sm btn-danger" data-accion="eliminar" aria-label="Eliminar producto">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;

    fila.querySelector('[data-accion="restar"]').addEventListener("click", () =>
      cambiarCantidad(item.id, -1)
    );
    fila.querySelector('[data-accion="sumar"]').addEventListener("click", () =>
      cambiarCantidad(item.id, 1)
    );
    fila.querySelector('[data-accion="eliminar"]').addEventListener("click", () =>
      eliminarDelCarrito(item.id)
    );

    contenedorCarrito.appendChild(fila);
  });

  totalCarritoEl.textContent = `$${total.toLocaleString("es-UY")}`;
}

if (btnConfirmarCompra) {
  btnConfirmarCompra.addEventListener("click", () => {
    alert("Esta funcionalidad todavía no está disponible. Se implementará en un próximo sprint.");
  });
}

// Si estamos en carrito.html, renderizar apenas carga la página
if (contenedorCarrito) {
  renderizarCarrito();
}

// El badge se actualiza en cualquier página que incluya carrito.js
actualizarBadgeCarrito();
