// js/producto.js
import { obtenerProductosFirestore } from "./firebase/productos.js";
import { agregarAlCarrito, establecerProductosCarrito } from "./carrito.js";

// Elementos del DOM
const mensajeCargando = document.getElementById("cargando-producto");
const mensajeError = document.getElementById("error-producto");
const contenedorDetalle = document.getElementById("detalle-producto");
const mensajeNoEncontrado = document.getElementById("producto-no-encontrado");

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

  // Evento para agregar al carrito
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
}

// Carga inicial del producto
async function cargarProducto() {
  const idProducto = obtenerIdDesdeUrl();

  if (!idProducto) {
    mensajeCargando.classList.add("d-none");
    mensajeNoEncontrado.classList.remove("d-none");
    return;
  }

  try {
    const productos = await obtenerProductosFirestore();
    
    // Sincronizamos con el carrito
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
