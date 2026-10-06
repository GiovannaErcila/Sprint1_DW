// carrito.js
import { obtenerProductosFirestore } from "./firebase/productos.js";
import { auth, db } from "./firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const CLAVE_CARRITO = "bytenova_carrito";

// Almacena localmente los productos descargados de Firestore para este módulo
let productosCache = [];

// Se mantiene actualizado con el usuario autenticado (o null si no hay sesión)
let usuarioActual = null;
onAuthStateChanged(auth, (usuario) => {
  usuarioActual = usuario;
});

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

// Recibe el listado de productos directamente desde catalogo.js / producto.js
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

// --- Confirmar compra: valida sesión y stock real en Firestore (Día 9) -----

// Consulta Firestore DE NUEVO para cada producto del carrito (no confía en
// productosCache, que pudo quedar desactualizado desde que se agregó).
async function verificarStockActual(carrito) {
  const problemas = [];

  for (const item of carrito) {
    const snap = await getDoc(doc(db, "productos", item.id));

    if (!snap.exists()) {
      problemas.push({ id: item.id, nombre: item.id, stockActual: 0, cantidadEnCarrito: item.cantidad });
      continue;
    }

    const datos = snap.data();
    if (item.cantidad > datos.stock) {
      problemas.push({
        id: item.id,
        nombre: datos.nombre,
        stockActual: datos.stock,
        cantidadEnCarrito: item.cantidad,
      });
    }
  }

  return problemas;
}

// Si algún producto ya no tiene el stock que el carrito suponía, ajusta las
// cantidades (o lo elimina si quedó en 0) para que el carrito sea honesto.
function ajustarCarritoAStockReal(problemas) {
  let carrito = obtenerCarrito();

  problemas.forEach((p) => {
    if (p.stockActual <= 0) {
      carrito = carrito.filter((i) => i.id !== p.id);
    } else {
      const item = carrito.find((i) => i.id === p.id);
      if (item) item.cantidad = p.stockActual;
    }
  });

  guardarCarrito(carrito);
}

if (btnConfirmarCompra) {
  btnConfirmarCompra.addEventListener("click", async () => {
    if (!usuarioActual) {
      alert("Tenés que iniciar sesión para confirmar la compra.");
      window.location.href = "perfil.html";
      return;
    }

    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    btnConfirmarCompra.disabled = true;
    const textoOriginal = btnConfirmarCompra.textContent;
    btnConfirmarCompra.textContent = "Verificando stock...";

    try {
      const problemas = await verificarStockActual(carrito);

      if (problemas.length > 0) {
        const detalle = problemas
          .map((p) => `- ${p.nombre}: quedan ${p.stockActual} (tenías ${p.cantidadEnCarrito})`)
          .join("\n");
        alert(
          "Algunos productos cambiaron de stock desde que los agregaste al carrito:\n" + detalle
        );
        ajustarCarritoAStockReal(problemas);
        renderizarCarrito();
        return;
      }

      // El stock está confirmado. El registro del pedido en Firestore y el
      // descuento real de stock se implementan en el próximo paso del sprint.
      alert("¡Compra confirmada! (El registro del pedido se implementa en el próximo paso del sprint.)");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al verificar el stock. Intentá de nuevo.");
    } finally {
      btnConfirmarCompra.disabled = false;
      btnConfirmarCompra.textContent = textoOriginal;
    }
  });
}

// --- Inicialización automática al cargar el script -----------------------

actualizarBadgeCarrito();

if (contenedorCarrito) {
  renderizarCarrito();
}
