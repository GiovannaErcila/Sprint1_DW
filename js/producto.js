// js/producto.js
import { obtenerProductosFirestore } from "./firebase/productos.js";
import { agregarAlCarrito, establecerProductosCarrito } from "./carrito.js";
import { auth, db } from "./firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Elementos del DOM — detalle del producto
const mensajeCargando = document.getElementById("cargando-producto");
const mensajeError = document.getElementById("error-producto");
const contenedorDetalle = document.getElementById("detalle-producto");
const mensajeNoEncontrado = document.getElementById("producto-no-encontrado");

// Elementos del DOM — valoraciones (Día 11)
const seccionValoraciones = document.getElementById("seccion-valoraciones");
const formValoracionWrapper = document.getElementById("form-valoracion-wrapper");
const formValoracion = document.getElementById("form-valoracion");
const mensajeValoracion = document.getElementById("mensaje-valoracion");
const avisoLoginValoracion = document.getElementById("valoracion-login-aviso");
const valoracionesCargando = document.getElementById("valoraciones-cargando");
const valoracionesVacio = document.getElementById("valoraciones-vacio");
const listaValoraciones = document.getElementById("lista-valoraciones");

let usuarioActual = null;
let productoActual = null;

onAuthStateChanged(auth, (usuario) => {
  usuarioActual = usuario;
  if (productoActual) {
    actualizarVistaFormularioValoracion();
  }
});

// Obtener el parámetro 'id' desde la URL (ej: producto.html?id=p1)
function obtenerIdDesdeUrl() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("id");
}

// Renderizar la información detallada del producto
function renderizarDetalleProducto(producto) {
  contenedorDetalle.innerHTML = `
    <div class="row align-items-center g-4">
      <div class="col-md-6 text-center">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid rounded shadow-sm" style="max-height: 400px; object-fit: contain;">
      </div>
      <div class="col-md-6">
        <span class="badge bg-secondary mb-2">${producto.categoria}</span>
        <h1 class="h2 fw-bold mb-3">${producto.nombre}</h1>
        <p class="text-muted mb-4">${producto.descripcion || "Sin descripción disponible."}</p>
        <h3 class="fw-bold text-primary mb-3">$${producto.precio.toLocaleString("es-UY")}</h3>
        <p class="mb-4"><small class="text-muted">Stock disponible: ${producto.stock} unidades</small></p>

        <div class="d-flex align-items-center gap-3">
          <button id="btn-agregar-detalle" class="btn btn-bn-primary btn-lg">
            <i class="bi bi-cart-plus me-1"></i> Agregar al carrito
          </button>
          <a href="catalogo.html" class="btn btn-outline-secondary btn-lg">Volver al catálogo</a>
        </div>
      </div>
    </div>
  `;

  contenedorDetalle.classList.remove("d-none");

  const btnAgregar = document.getElementById("btn-agregar-detalle");
  btnAgregar.addEventListener("click", () => {
    const agregado = agregarAlCarrito(producto.id, 1);
    if (agregado) {
      btnAgregar.textContent = "¡Agregado!";
      btnAgregar.classList.replace("btn-bn-primary", "btn-success");
      setTimeout(() => {
        btnAgregar.innerHTML = `<i class="bi bi-cart-plus me-1"></i> Agregar al carrito`;
        btnAgregar.classList.replace("btn-success", "btn-bn-primary");
      }, 1500);
    } else {
      alert(`Ya tenés la cantidad máxima en stock (${producto.stock}) de "${producto.nombre}" en tu carrito.`);
    }
  });

  // --- Valoraciones (Día 11) ---
  productoActual = producto;
  seccionValoraciones.classList.remove("d-none");
  actualizarVistaFormularioValoracion();
  cargarValoraciones(producto.id);
}

function mostrarNoEncontrado() {
  contenedorDetalle.classList.add("d-none");
  mensajeNoEncontrado.classList.remove("d-none");
}

// --- Valoraciones y comentarios (Día 11) ----------------------------------

function actualizarVistaFormularioValoracion() {
  if (usuarioActual) {
    formValoracionWrapper.classList.remove("d-none");
    avisoLoginValoracion.classList.add("d-none");
  } else {
    formValoracionWrapper.classList.add("d-none");
    avisoLoginValoracion.classList.remove("d-none");
  }
}

function estrellas(puntuacion) {
  return "★".repeat(puntuacion) + "☆".repeat(5 - puntuacion);
}

function mostrarMensajeValoracion(texto, tipo) {
  mensajeValoracion.textContent = texto;
  mensajeValoracion.classList.remove("text-danger", "text-success");
  if (texto) mensajeValoracion.classList.add(tipo === "error" ? "text-danger" : "text-success");
}

async function cargarValoraciones(idProducto) {
  valoracionesCargando.classList.remove("d-none");
  valoracionesVacio.classList.add("d-none");
  listaValoraciones.innerHTML = "";

  try {
    const consulta = query(
      collection(db, "valoraciones"),
      where("productoId", "==", idProducto),
      orderBy("fecha", "desc")
    );
    const snapshot = await getDocs(consulta);

    valoracionesCargando.classList.add("d-none");

    if (snapshot.empty) {
      valoracionesVacio.classList.remove("d-none");
      return;
    }

    snapshot.forEach((docSnap) => {
      const val = docSnap.data();
      const fecha = val.fecha ? val.fecha.toDate().toLocaleDateString("es-UY") : "";

      const item = document.createElement("div");
      item.classList.add("border-bottom", "py-2");
      item.innerHTML = `
        <p class="mb-1"><strong>${estrellas(val.puntuacion)}</strong> — ${val.usuarioCorreo}</p>
        <p class="mb-1">${val.comentario}</p>
        <p class="small text-muted mb-0">${fecha}</p>
      `;
      listaValoraciones.appendChild(item);
    });
  } catch (error) {
    console.error(error);
    valoracionesCargando.classList.add("d-none");
    listaValoraciones.innerHTML = `<p class="text-danger">No se pudieron cargar las valoraciones.</p>`;
  }
}

formValoracion.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (!usuarioActual || !productoActual) return;

  const puntuacion = Number(document.getElementById("valoracion-puntuacion").value);
  const comentario = document.getElementById("valoracion-comentario").value.trim();

  if (!comentario) {
    mostrarMensajeValoracion("Escribí un comentario antes de publicar.", "error");
    return;
  }

  if (puntuacion < 1 || puntuacion > 5) {
    mostrarMensajeValoracion("La puntuación debe ser entre 1 y 5.", "error");
    return;
  }

  const boton = formValoracion.querySelector("button[type='submit']");
  boton.disabled = true;

  try {
    await addDoc(collection(db, "valoraciones"), {
      productoId: productoActual.id,
      usuarioId: usuarioActual.uid,
      usuarioCorreo: usuarioActual.email,
      puntuacion,
      comentario,
      fecha: serverTimestamp(),
    });

    formValoracion.reset();
    mostrarMensajeValoracion("¡Gracias por tu valoración!", "exito");
    cargarValoraciones(productoActual.id);
  } catch (error) {
    console.error(error);
    mostrarMensajeValoracion("Ocurrió un error al publicar tu valoración.", "error");
  } finally {
    boton.disabled = false;
  }
});

// --- Carga inicial del producto -------------------------------------------

async function cargarProducto() {
  const idProducto = obtenerIdDesdeUrl();

  if (!idProducto) {
    mensajeCargando.classList.add("d-none");
    mensajeNoEncontrado.classList.remove("d-none");
    return;
  }

  try {
    const productos = await obtenerProductosFirestore();
    establecerProductosCarrito(productos);

    const productoEncontrado = productos.find((p) => p.id === idProducto);

    mensajeCargando.classList.add("d-none");

    if (!productoEncontrado) {
      mensajeNoEncontrado.classList.remove("d-none");
      return;
    }

    renderizarDetalleProducto(productoEncontrado);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    mensajeCargando.classList.add("d-none");
    mensajeError.textContent = "Ocurrió un error al cargar la información del producto.";
    mensajeError.classList.remove("d-none");
  }
}

cargarProducto();
