// carrito.js
import { obtenerProductosFirestore } from "./firebase/productos.js";
const CLAVE_CARRITO = "bytenova_carrito";

// Almacena localmente los productos descargados de Firestore para este módulo
let productosCache = [];

// --- Persistencia en LocalStorage --------------------------------------

export function obtenerCarrito() {
  const datos = localStorage.getItem(CLAVE_CARRITO);
  return datos ? JSON.parse(datos) : [];
}

export function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  actualizarBadgeCarrito();
}

// Actualiza el número del carrito en el ícono del navbar
export function actualizarBadgeCarrito() {
  const carrito = obtenerCarrito();
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  document.querySelectorAll(".cart-indicator .badge").forEach((badge) => {
    badge.textContent = totalItems;
  });
}

// Asegura que los productos estén cargados desde Firestore si la página los necesita
async function asegurarProductos() {
  if (productosCache.length === 0) {
    productosCache = await obtenerProductosFirestore();
  }
  return productosCache;
}

// Recibe el listado de productos directamente desde catalogo.js
export function establecerProductosCarrito(productos) {
  productosCache = productos;
}

// --- Operaciones sobre el carrito ---------------------------------------

export function agregarAlCarrito(idProducto, cantidad = 1) {
  const carrito = obtenerCarrito();
  const producto = productosCache.find((p) => p.id === idProducto);
  if (!producto) return false;

  const item = carrito.find((i) => i.id === idProducto);
  const cantidadActual = item ? item.cantidad : 0;

  if (cantidadActual >= producto.stock) {
    return false;
  }

  const nuevaCantidad = Math.min(cantidadActual + cantidad, producto.stock);

  if (item) {
    item.cantidad = nuevaCantidad;
  } else {
    carrito.push({ id: idProducto, cantidad: nuevaCantidad });
  }

  guardarCarrito(carrito);
  renderizarCarrito();
  return true;
}

export function cambiarCantidad(idProducto, delta) {
  const carrito = obtenerCarrito();
  const producto = productosCache.find((p) => p.id === idProducto);
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

export function eliminarDelCarrito(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter((i) => i.id !== idProducto);
  guardarCarrito(carrito);
  renderizarCarrito();
}

// --- Render (Solo ejecuta en carrito.html) --------------------------------

const contenedorCarrito = document.getElementById("carrito-items");
const mensajeCarritoVacio = document.getElementById("carrito-vacio");
const totalCarritoEl = document.getElementById("carrito-total");
const btnConfirmarCompra = document.getElementById("confirmar-compra");

export async function renderizarCarrito() {
  if (!contenedorCarrito) return; // Si no está el contenedor, no hace nada (ej: en el catálogo)

  await asegurarProductos();
  const carrito = obtenerCarrito();
  contenedorCarrito.innerHTML = "";

  if (carrito.length === 0) {
    if (mensajeCarritoVacio) mensajeCarritoVacio.classList.remove("d-none");
    if (totalCarritoEl) totalCarritoEl.textContent = "$0";
    return;
  }

  if (mensajeCarritoVacio) mensajeCarritoVacio.classList.add("d-none");

  let total = 0;

  carrito.forEach((item) => {
    const producto = productosCache.find((p) => p.id === item.id);
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

  if (totalCarritoEl) {
    totalCarritoEl.textContent = `$${total.toLocaleString("es-UY")}`;
  }
}

if (btnConfirmarCompra) {
  btnConfirmarCompra.addEventListener("click", () => {
    alert("Esta funcionalidad todavía no está disponible. Se implementará en un próximo sprint.");
  });
}

// --- Inicialización automática al cargar el script -----------------------

actualizarBadgeCarrito();

if (contenedorCarrito) {
  renderizarCarrito();
}
