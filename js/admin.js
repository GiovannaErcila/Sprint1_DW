// js/admin.js

import { auth, db } from "./firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { obtenerRol } from "./firebase/roles.js";
import { obtenerProductosFirestore } from "./firebase/productos.js";

const verificando = document.getElementById("admin-verificando");
const contenido = document.getElementById("admin-contenido");

const productosCargando = document.getElementById("admin-productos-cargando");
const productosError = document.getElementById("admin-productos-error");
const tabla = document.getElementById("tabla-productos");
const tablaCuerpo = document.getElementById("tabla-productos-cuerpo");

const tituloFormulario = document.getElementById("titulo-formulario");
const formProducto = document.getElementById("form-producto");
const botonGuardar = formProducto.querySelector("button[type='submit']");
const botonCancelar = document.getElementById("btn-cancelar-edicion");
const mensajeProducto = document.getElementById("mensaje-producto");
const listaCategorias = document.getElementById("lista-categorias");

const IMAGEN_POR_DEFECTO = "assets/placeholder.jpg";

// Productos cargados en pantalla y, si se está editando uno, su ID.
let productosActuales = [];
let idEnEdicion = null;

// --- Listado de productos  ---------------------------------------

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

function crearCeldaAcciones(producto) {
  const celda = document.createElement("td");
  celda.className = "text-end";

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn btn-sm btn-outline-primary";
  boton.textContent = "Editar";
  boton.setAttribute("aria-label", `Editar ${producto.nombre}`);
  boton.addEventListener("click", () => iniciarEdicion(producto));

  celda.appendChild(boton);
  return celda;
}

function renderizarTabla() {
  tablaCuerpo.innerHTML = "";

  productosActuales.forEach((producto) => {
    const fila = document.createElement("tr");
    if (producto.id === idEnEdicion) fila.classList.add("table-active");

    fila.appendChild(crearCelda(producto.nombre));
    fila.appendChild(crearCelda(producto.categoria));
    fila.appendChild(crearCelda(`$${Number(producto.precio).toLocaleString("es-UY")}`, "text-end"));
    fila.appendChild(crearCelda(producto.stock, "text-end"));
    fila.appendChild(crearCeldaDisponibilidad(Boolean(producto.disponibilidad)));
    fila.appendChild(crearCeldaAcciones(producto));
    tablaCuerpo.appendChild(fila);
  });
}

// Ofrece las categorías que ya existen como sugerencia en el formulario.
function actualizarCategorias(productos) {
  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];
  listaCategorias.innerHTML = "";
  categorias.forEach((categoria) => {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    listaCategorias.appendChild(opcion);
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
      productosActuales = [];
      productosError.textContent = "Todavía no hay productos cargados.";
      productosError.classList.remove("d-none");
      return;
    }

    productos.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    productosActuales = productos;
    renderizarTabla();
    actualizarCategorias(productos);
    tabla.classList.remove("d-none");
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    productosCargando.classList.add("d-none");
    productosError.textContent = "No se pudieron cargar los productos. Intentá de nuevo más tarde.";
    productosError.classList.remove("d-none");
  }
}

// --- Formulario: crear  y editar --------------------------

function mostrarMensaje(texto, tipo) {
  mensajeProducto.textContent = texto;
  mensajeProducto.classList.remove("text-danger", "text-success");
  if (texto) mensajeProducto.classList.add(tipo === "error" ? "text-danger" : "text-success");
}

// Ajusta el título y los botones según se esté creando o editando.
function actualizarTextosFormulario() {
  const editando = idEnEdicion !== null;
  tituloFormulario.textContent = editando ? "Editar producto" : "Nuevo producto";
  botonGuardar.textContent = editando ? "Guardar cambios" : "Crear producto";
  botonCancelar.classList.toggle("d-none", !editando);
}

function leerFormulario() {
  return {
    nombre: document.getElementById("prod-nombre").value.trim(),
    categoria: document.getElementById("prod-categoria").value.trim(),
    precioTexto: document.getElementById("prod-precio").value.trim(),
    stockTexto: document.getElementById("prod-stock").value.trim(),
    descripcion: document.getElementById("prod-descripcion").value.trim(),
    imagen: document.getElementById("prod-imagen").value.trim(),
    disponibilidad: document.getElementById("prod-disponibilidad").checked,
  };
}

// Devuelve { campo, mensaje } con el primer problema, o null si todo está bien.
function validarProducto(datos) {
  if (!datos.nombre) {
    return { campo: "prod-nombre", mensaje: "Ingresá el nombre del producto." };
  }

  if (!datos.categoria) {
    return { campo: "prod-categoria", mensaje: "Ingresá la categoría del producto." };
  }

  // Se controla el texto vacío aparte porque Number("") da 0.
  const precio = Number(datos.precioTexto);
  if (datos.precioTexto === "" || !Number.isFinite(precio)) {
    return { campo: "prod-precio", mensaje: "Ingresá un precio válido (un número)." };
  }
  if (precio < 0) {
    return { campo: "prod-precio", mensaje: "El precio no puede ser negativo." };
  }

  const stock = Number(datos.stockTexto);
  if (datos.stockTexto === "" || !Number.isFinite(stock)) {
    return { campo: "prod-stock", mensaje: "Ingresá el stock (un número)." };
  }
  if (!Number.isInteger(stock)) {
    return { campo: "prod-stock", mensaje: "El stock tiene que ser un número entero." };
  }
  if (stock < 0) {
    return { campo: "prod-stock", mensaje: "El stock no puede ser negativo." };
  }

  return null;
}

// Carga los datos de un producto en el formulario para editarlo.
function iniciarEdicion(producto) {
  idEnEdicion = producto.id;

  document.getElementById("prod-nombre").value = producto.nombre ?? "";
  document.getElementById("prod-categoria").value = producto.categoria ?? "";
  document.getElementById("prod-precio").value = producto.precio ?? "";
  document.getElementById("prod-stock").value = producto.stock ?? "";
  document.getElementById("prod-descripcion").value = producto.descripcion ?? "";
  document.getElementById("prod-imagen").value = producto.imagen ?? "";
  document.getElementById("prod-disponibilidad").checked = Boolean(producto.disponibilidad);

  mostrarMensaje("", "exito");
  actualizarTextosFormulario();
  renderizarTabla();

  // En el teléfono el formulario queda debajo de la tabla: se lo acerca a la vista.
  formProducto.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("prod-nombre").focus();
}

// Vuelve el formulario al modo "crear".
function salirDeEdicion() {
  idEnEdicion = null;
  formProducto.reset();
  actualizarTextosFormulario();
  renderizarTabla();
}

botonCancelar.addEventListener("click", () => {
  mostrarMensaje("", "exito");
  salirDeEdicion();
});

formProducto.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarMensaje("", "exito");

  const datos = leerFormulario();
  const problema = validarProducto(datos);
  if (problema) {
    mostrarMensaje(problema.mensaje, "error");
    document.getElementById(problema.campo).focus();
    return;
  }

  const editando = idEnEdicion !== null;
  botonGuardar.disabled = true;
  botonCancelar.disabled = true;
  botonGuardar.textContent = "Guardando...";

  try {
    const campos = {
      nombre: datos.nombre,
      categoria: datos.categoria,
      precio: Number(datos.precioTexto),
      stock: Number(datos.stockTexto),
      descripcion: datos.descripcion,
      imagen: datos.imagen || IMAGEN_POR_DEFECTO,
      disponibilidad: datos.disponibilidad,
    };

    if (editando) {
      // El campo "id" no se toca: sigue igual al ID del documento.
      await updateDoc(doc(db, "productos", idEnEdicion), campos);
      salirDeEdicion();
      mostrarMensaje(`Producto "${datos.nombre}" actualizado correctamente.`, "exito");
    } else {
      // Se genera primero la referencia para conocer el ID del documento y
      // guardarlo también en el campo "id" (el catálogo y el detalle usan ese campo).
      const referencia = doc(collection(db, "productos"));
      await setDoc(referencia, { id: referencia.id, ...campos });
      formProducto.reset();
      mostrarMensaje(`Producto "${datos.nombre}" creado correctamente.`, "exito");
    }

    await cargarListaProductos();
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    mostrarMensaje("No se pudo guardar el producto. Revisá tu conexión y tus permisos.", "error");
  } finally {
    botonGuardar.disabled = false;
    botonCancelar.disabled = false;
    actualizarTextosFormulario();
  }
});

// --- Protección de la página -------------------------------------

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