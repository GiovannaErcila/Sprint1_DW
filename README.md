# ByteNova — Proyecto integrador de Desarrollo Web

## Nombre del estudiante
Giovanna Ercila

## Descripción del proyecto
ByteNova es una tienda de tecnología (e-commerce) desarrollada como proyecto integrador
de la asignatura Desarrollo Web, a lo largo de varios sprints. El proyecto combina HTML,
CSS (con Bootstrap 5) y JavaScript, e incorporará progresivamente LocalStorage, Cloud
Firestore y Firebase Authentication en los siguientes sprints.

## Instrucciones de ejecución
1. Cloná o descargá este repositorio.
2. Abrí la carpeta del proyecto en VS Code.
3. Con la extensión Live Server instalada, hacé clic derecho sobre `index.html` (o
   cualquier otra página) → "Open with Live Server", o abrilo directamente en el
   navegador.
4. No requiere instalación de dependencias: Bootstrap y las fuentes se cargan desde CDN.

---

## Funcionalidades desarrolladas en el Sprint 1
- Identidad visual propia (nombre, logotipo textual, paleta de colores, tipografía).
- Página de inicio (`index.html`) con encabezado, hero, productos destacados,
  sección de beneficios y pie de página.
- Barra de navegación responsive con menú hamburguesa, indicador de carrito y botón
  de inicio de sesión (con aviso de funcionalidad pendiente).
- Todas las páginas del sitio (`catalogo.html`, `producto.html`, `carrito.html`,
  `perfil.html`, `admin.html`) creadas, enlazadas y con aviso de "Funcionalidad en
  desarrollo" indicando el sprint correspondiente.
- HTML semántico (`header`, `nav`, `main`, `section`, `footer`) y jerarquía correcta
  de encabezados.
- Diseño responsive probado en teléfono, tablet y escritorio mediante Bootstrap Grid
  y Flexbox.
- Accesibilidad básica: textos alternativos en imágenes, foco visible, etiquetas
  `aria-label`, navegación por teclado.

### Correcciones aplicadas tras la revisión del Sprint 1
- Se agregó la etiqueta `<header>` envolviendo la barra de navegación en todas las
  páginas del sitio (antes el `<nav>` colgaba directo de `<body>`).
- Se agregó `<main>` envolviendo el contenido principal de `index.html` (ya estaba
  presente en el resto de las páginas).
- Se corrigieron rutas de la hoja de estilos que apuntaban mal (`css/styles.css` en
  vez de `CSS/estilos.css`) en varias páginas.

---

## Funcionalidades incorporadas en el Sprint 2
Durante este sprint se le dio comportamiento dinámico a la tienda usando JavaScript
y LocalStorage, sin utilizar todavía Firebase:

- **Catálogo dinámico**: los productos ya no están escritos a mano en el HTML — se
  generan desde un arreglo de JavaScript y se insertan como tarjetas en `catalogo.html`.
- **Búsqueda y filtros**: buscador por nombre y filtro por categoría (generado
  dinámicamente a partir de las categorías existentes), combinables entre sí, con
  mensaje cuando no hay coincidencias y botón para limpiar los filtros.
- **Detalle dinámico de producto**: una única página (`producto.html`) muestra el
  detalle de cualquier producto según el parámetro `id` recibido por la URL
  (`producto.html?id=p1`), leído con `URLSearchParams`. Si el id no existe, se
  muestra un mensaje de "Producto no encontrado".
- **Carrito de compras con LocalStorage**: permite agregar productos desde el
  catálogo o el detalle, aumentar y disminuir cantidades, eliminar productos,
  calcular subtotales y el total de la compra, y evita agregar más unidades que el
  stock disponible. El carrito se conserva al recargar la página gracias a
  LocalStorage. Si está vacío, se muestra un mensaje claro. El botón "Confirmar
  compra" todavía no realiza una compra real (queda para un próximo sprint).
- Ajuste visual de las imágenes del catálogo y el detalle para que todas mantengan
  el mismo tamaño y proporción (`object-fit` / `object-position` en CSS).

## Cómo están representados los productos
Cada producto es un objeto dentro de un arreglo (`productos`), con los campos:
`id`, `nombre`, `descripcion`, `categoria`, `precio`, `stock` e `imagen`. Este
arreglo es la única fuente de datos del catálogo por ahora (en el Sprint 3 se
reemplazará por Cloud Firestore).

## Organización de los archivos JavaScript
```
js/
  productos.js   → arreglo con los datos de los productos
  catalogo.js    → genera el catálogo, maneja búsqueda, filtro y agregar al carrito
  producto.js    → lee el id de la URL y muestra el detalle dinámico del producto
  carrito.js     → lógica del carrito: agregar, modificar cantidad, eliminar,
                   calcular totales y persistir en LocalStorage
```
`productos.js` y `carrito.js` se cargan en las tres páginas (`catalogo.html`,
`producto.html`, `carrito.html`) porque tanto el catálogo como el detalle necesitan
poder agregar productos al carrito, y las tres páginas muestran el contador de
artículos en el ícono del carrito del navbar.

## Información que se guarda en LocalStorage
Se guarda un único valor bajo la clave `bytenova_carrito`, con un arreglo de
objetos `{ id, cantidad }` (JSON, mediante `JSON.stringify()` / `JSON.parse()`).
Solo se guarda el id del producto y la cantidad elegida; el resto de los datos
del producto (nombre, precio, imagen, stock) se buscan en el arreglo `productos`
al momento de mostrarlos, para no duplicar información.

## Funcionalidades pendientes
- Registro e inicio de sesión con Firebase Authentication (Sprint 3).
- Persistencia de datos en Cloud Firestore, reemplazando el arreglo local de
  productos (Sprint 3).
- Compra real desde el carrito (el botón "Confirmar compra" es un aviso por ahora).
- Panel administrativo con operaciones CRUD (Sprint 4).
- Roles de usuario y reglas de seguridad (Sprint 4).

---

## Decisiones de diseño adoptadas
- Paleta de color basada en un azul noche (`#0F172A`) como color principal,
  celeste eléctrico (`#38BDF8`) como acento y ámbar (`#FACC15`) para los
  botones de llamada a la acción, buscando transmitir confianza y modernidad.
- Tipografía **Poppins** para títulos y **Inter** para texto, priorizando
  legibilidad en pantallas pequeñas.
- Botones redondeados y tarjetas con sombra suave para reforzar una estética
  limpia y coherente en todas las páginas.
- Se mantuvo la misma barra de navegación y el mismo pie de página en todas
  las páginas del sitio para que se perciba como un único producto.