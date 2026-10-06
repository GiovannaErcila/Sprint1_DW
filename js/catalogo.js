import { obtenerProductosFirestore } from "./firebase/productos.js";
import { agregarAlCarrito, establecerProductosCarrito } from "./carrito.js";

let productosGlobales = [];

const contenedorCatalogo = document.getElementById("catalogo");
const buscadorInput = document.getElementById("buscador");
const filtroCategoria = document.getElementById("filtro-categoria");
const btnLimpiar = document.getElementById("limpiar-filtros");

const mensajeCargando = document.getElementById("cargando-catalogo");
const mensajeError = document.getElementById("error-catalogo");
const mensajeSinResultados = document.getElementById("sin-resultados");

async function iniciarCatalogo() {
  try {
    productosGlobales = await obtenerProductosFirestore();

    if (mensajeCargando) mensajeCargando.classList.add("d-none");

    if (!productosGlobales || productosGlobales.length === 0) {
      if (mensajeSinResultados) mensajeSinResultados.classList.remove("d-none");
      return;
    }

    establecerProductosCarrito(productosGlobales);
    poblarCategorias(productosGlobales);
    aplicarFiltros();
  } catch (error) {
    console.error("Error al iniciar el catálogo:", error);
    if (mensajeCargando) mensajeCargando.classList.add("d-none");
    if (mensajeError) {
      mensajeError.textContent = "Ocurrió un error al cargar los productos.";
      mensajeError.classList.remove("d-none");
    }
  }
}

// Carga las categorías en el <select> sin duplicados
function poblarCategorias(productos) {
  if (!filtroCategoria) return;

  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];
  filtroCategoria.innerHTML = `<option value="">Todas las categorías</option>`;

  categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filtroCategoria.appendChild(option);
  });
}

// Aplica búsqueda y categoría en memoria
function aplicarFiltros() {
  const texto = buscadorInput ? buscadorInput.value.toLowerCase().trim() : "";
  const categoriaSeleccionada = filtroCategoria ? filtroCategoria.value : "";

  const filtrados = productosGlobales.filter((producto) => {
    const coincideNombre = producto.nombre ? producto.nombre.toLowerCase().includes(texto) : true;
    const coincideCategoria = categoriaSeleccionada ? producto.categoria === categoriaSeleccionada : true;
    return coincideNombre && coincideCategoria;
  });

  renderizarCatalogo(filtrados);
}

// Renderiza las tarjetas de productos
function renderizarCatalogo(lista) {
  if (!contenedorCatalogo) return;

  contenedorCatalogo.innerHTML = "";

  if (lista.length === 0) {
    if (mensajeSinResultados) mensajeSinResultados.classList.remove("d-none");
    return;
  }

  if (mensajeSinResultados) mensajeSinResultados.classList.add("d-none");

  lista.forEach((prod) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 mb-4";

    const tieneStock = prod.stock > 0;

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${prod.imagen || 'assets/placeholder.jpg'}" class="card-img-top" alt="${prod.nombre}" style="height: 200px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text text-muted small mb-2">${prod.categoria || 'Sin categoría'}</p>
          <p class="fw-bold fs-5 text-primary">$${prod.precio}</p>
          <p class="small ${tieneStock ? 'text-success' : 'text-danger'} mb-3">
            ${tieneStock ? `Stock disponible: ${prod.stock}` : 'Sin stock disponible'}
          </p>
          <div class="mt-auto d-flex gap-2">
            <a href="producto.html?id=${prod.id}" class="btn btn-outline-secondary btn-sm flex-fill">Ver detalle</a>
            <button 
              class="btn btn-bn-primary btn-sm flex-fill btn-agregar" 
              data-id="${prod.id}"
              ${!tieneStock ? 'disabled' : ''}>
              ${tieneStock ? 'Agregar' : 'Agotado'}
            </button>
          </div>
        </div>
      </div>
    `;

    contenedorCatalogo.appendChild(col);
  });

  // Evento para agregar al carrito
  document.querySelectorAll(".btn-agregar").forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const idProd = e.target.getAttribute("data-id");
      const prodSeleccionado = productosGlobales.find((p) => p.id === idProd);

      if (prodSeleccionado && prodSeleccionado.stock > 0) {
        const agregado = agregarAlCarrito(prodSeleccionado.id, 1);
         if (!agregado) {
           alert(`Ya tenés el stock máximo de "${prodSeleccionado.nombre}" en el carrito.`);
  }
        agregarAlCarrito(prodSeleccionado);
      } else {
        alert("El producto no tiene stock disponible.");
      }
    });
  });
}

// Event Listeners
if (buscadorInput) buscadorInput.addEventListener("input", aplicarFiltros);
if (filtroCategoria) filtroCategoria.addEventListener("change", aplicarFiltros);
if (btnLimpiar) {
  btnLimpiar.addEventListener("click", () => {
    if (buscadorInput) buscadorInput.value = "";
    if (filtroCategoria) filtroCategoria.value = "";
    aplicarFiltros();
  });
}

iniciarCatalogo();