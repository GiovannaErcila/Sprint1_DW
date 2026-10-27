// carrito.js
import { obtenerProductosFirestore } from "./firebase/productos.js";
import { auth, db } from "./firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  runTransaction,
  serverTimestamp,
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

  // Un producto marcado como no disponible por el administrador no se agrega.
  if (!producto.disponibilidad) return false;

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
    // En pantallas chicas la fila se apila (nombre / precio y cantidad /
    // subtotal y eliminar); desde "md" vuelve a ser una sola línea.
    fila.classList.add("row", "align-items-center", "border-bottom", "py-3", "g-2");
    fila.innerHTML = `
      <div class="col-12 col-md-4 fw-semibold text-break">${producto.nombre}</div>
      <div class="col-6 col-md-2">
        <span class="d-md-none text-muted small">Precio: </span>$${producto.precio.toLocaleString("es-UY")}
      </div>
      <div class="col-6 col-md-3 d-flex align-items-center gap-2 justify-content-end justify-content-md-start">
        <button class="btn btn-sm btn-outline-secondary px-3" data-accion="restar" aria-label="Quitar una unidad">-</button>
        <span>${item.cantidad}</span>
        <button class="btn btn-sm btn-outline-secondary px-3" data-accion="sumar" aria-label="Agregar una unidad">+</button>
      </div>
      <div class="col-6 col-md-2">
        <span class="d-md-none text-muted small">Subtotal: </span>$${subtotal.toLocaleString("es-UY")}
      </div>
      <div class="col-6 col-md-1 text-end">
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

// --- Confirmar compra: valida sesión y stock real en Firestore -----

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

    // El administrador pudo marcarlo como no disponible después de que se agregó.
    if (!datos.disponibilidad) {
      problemas.push({
        id: item.id,
        nombre: datos.nombre,
        stockActual: 0,
        cantidadEnCarrito: item.cantidad,
        noDisponible: true,
      });
      continue;
    }

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
// cantidades (o lo elimina si quedó en 0).
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

// --- Registrar el pedido y descontar stock, todo junto -----------
// Usamos una transacción: primero lee el stock real de cada producto, valida
// que alcance, y recién ahí escribe el pedido y descuenta el stock. Si algo
// falla en el medio, Firestore no aplica ninguno de los cambios.
async function registrarPedido(carrito, usuario) {
  const pedidoRef = doc(collection(db, "pedidos"));

  await runTransaction(db, async (transaction) => {
    const lecturas = [];

    // 1. Leer el stock actual de cada producto (todas las lecturas antes de escribir)
    for (const item of carrito) {
      const productoRef = doc(db, "productos", item.id);
      const snap = await transaction.get(productoRef);
      if (!snap.exists()) {
        throw new Error(`El producto "${item.id}" ya no existe.`);
      }
      lecturas.push({ item, productoRef, datos: snap.data() });
    }

    // 2. Validar que haya stock suficiente para TODOS antes de escribir nada
    for (const { item, datos } of lecturas) {
      if (!datos.disponibilidad) {
        throw new Error(`"${datos.nombre}" ya no está disponible.`);
      }
      if (item.cantidad > datos.stock) {
        throw new Error(`No hay stock suficiente de "${datos.nombre}".`);
      }
    }

    // 3. Armar el detalle del pedido y descontar el stock (nunca negativo)
    const itemsPedido = [];
    let total = 0;

    for (const { item, productoRef, datos } of lecturas) {
      const subtotal = datos.precio * item.cantidad;
      total += subtotal;

      itemsPedido.push({
        id: item.id,
        nombre: datos.nombre,
        precio: datos.precio,
        cantidad: item.cantidad,
        subtotal,
      });

      const nuevoStock = Math.max(datos.stock - item.cantidad, 0);
      transaction.update(productoRef, { stock: nuevoStock });
    }

    // 4. Registrar el pedido
    transaction.set(pedidoRef, {
      usuarioId: usuario.uid,
      usuarioCorreo: usuario.email,
      productos: itemsPedido,
      total,
      fecha: serverTimestamp(),
      estado: "confirmado",
    });
  });

  return pedidoRef.id;
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
          .map((p) =>
            p.noDisponible
              ? `- ${p.nombre}: ya no está disponible`
              : `- ${p.nombre}: quedan ${p.stockActual} (tenías ${p.cantidadEnCarrito})`
          )
          .join("\n");
        alert(
          "Algunos productos cambiaron desde que los agregaste al carrito:\n" + detalle
        );
        ajustarCarritoAStockReal(problemas);
        renderizarCarrito();
        return;
      }

      btnConfirmarCompra.textContent = "Registrando pedido...";
      const idPedido = await registrarPedido(carrito, usuarioActual);

      guardarCarrito([]);
      renderizarCarrito();

      alert(`¡Compra confirmada! Número de pedido: ${idPedido}`);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al confirmar la compra: " + error.message);
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
