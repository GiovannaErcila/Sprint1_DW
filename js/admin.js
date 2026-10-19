// js/admin.js

import { auth } from "./firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerRol } from "./firebase/roles.js";
import { obtenerProductosFirestore } from "./firebase/productos.js";

const verificando = document.getElementById("admin-verificando");
const contenido = document.getElementById("admin-contenido");

const productosCargando = document.getElementById("admin-productos-cargando");
const productosError = document.getElementById("admin-productos-error");
const tabla = document.getElementById("tabla-productos");
const tablaCuerpo = document.getElementById("tabla-productos-cuerpo");

// --- Listado de productos ---------------------------------------

// Crea una celda con texto plano (textContent): los datos de Firestore nunca
// se interpretan como HTML.
function crearCelda(texto, clase) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  if (clase) celda.className = clase;
  return celda;
}

function crearCeldaDisponibilidad(disponible) {
  const celda = document.createElement("td");
  const etiqueta = document.createElement("span");
  etiqueta.className = disponible
    ? "badge bg-success-subtle text-success"
    : "badge bg-secondary-subtle text-secondary";
  etiqueta.textContent = disponible ? "Disponible" : "No disponible";
  celda.appendChild(etiqueta);
  return celda;
}

function renderizarTabla(productos) {
  tablaCuerpo.innerHTML = "";

  productos.forEach((producto) => {
    const fila = document.createElement("tr");
    fila.appendChild(crearCelda(producto.nombre));
    fila.appendChild(crearCelda(producto.categoria));
    fila.appendChild(crearCelda(`$${Number(producto.precio).toLocaleString("es-UY")}`, "text-end"));
    fila.appendChild(crearCelda(producto.stock, "text-end"));
    fila.appendChild(crearCeldaDisponibilidad(Boolean(producto.disponibilidad)));
    tablaCuerpo.appendChild(fila);
  });
}

async function cargarListaProductos() {
  productosCargando.classList.remove("d-none");
  productosError.classList.add("d-none");
  tabla.classList.add("d-none");

  try {
    const productos = await obtenerProductosFirestore();
    productosCargando.classList.add("d-none");

    if (!productos || productos.length === 0) {
      productosError.textContent = "Todavía no hay productos cargados.";
      productosError.classList.remove("d-none");
      return;
    }

    productos.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    renderizarTabla(productos);
    tabla.classList.remove("d-none");
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    productosCargando.classList.add("d-none");
    productosError.textContent = "No se pudieron cargar los productos. Intentá de nuevo más tarde.";
    productosError.classList.remove("d-none");
  }
}

// --- Protección de la página -----

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.replace("index.html?aviso=sin-sesion");
    return;
  }

  const rol = await obtenerRol(usuario.uid);
  if (rol !== "administrador") {
    window.location.replace("index.html?aviso=sin-permisos");
    return;
  }

  verificando.classList.add("d-none");
  contenido.classList.remove("d-none");
  cargarListaProductos();
});