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

## Funcionalidades desarrolladas en el Sprint 3
### Autenticación (Firebase Authentication)
- Registro con correo y contraseña, con validación de campos (vacíos, formato de
  correo, contraseña de al menos 6 caracteres).
- Inicio y cierre de sesión, con mensajes de error en español (cuenta inexistente,
  contraseña incorrecta, demasiados intentos, etc.).
- La sesión se mantiene al recargar y entre páginas mediante `onAuthStateChanged()`.
- El navbar de todas las páginas muestra el correo del usuario y el botón
  "Cerrar sesión" cuando hay sesión iniciada.
- En "Mi perfil", el panel de la cuenta solo se muestra con sesión iniciada.

### Productos en Cloud Firestore
- Los productos se leen desde la colección `productos` de Firestore (ya no desde un
  arreglo local) en el catálogo, el detalle y el carrito.
- Se muestran estados de carga y mensajes de error o de ausencia de productos.
- La búsqueda y el filtro trabajan sobre los datos ya obtenidos de Firestore.
- Se valida la disponibilidad y el stock antes de agregar al carrito.

### Compra y pedidos
- "Confirmar compra" exige tener sesión iniciada; si no, redirige a "Mi perfil".
- Antes de confirmar se consulta de nuevo el stock real en Firestore (no se confía
  solo en lo validado al agregar al carrito). Si cambió, se avisa y se ajusta el
  carrito.
- La compra se registra mediante una **transacción de Firestore**: se lee el stock,
  se valida, se descuenta el stock de cada producto (sin permitir valores negativos)
  y se guarda el pedido en la colección `pedidos`, todo junto. Si algo falla, no se
  aplica ningún cambio.
- Si la compra se completa sin errores, el carrito (LocalStorage) se vacía.
- En "Mi perfil" cada usuario ve únicamente sus propios pedidos (consulta filtrada
  por `usuarioId`).

  ### Valoraciones y comentarios
- En el detalle de cada producto se pueden ver las valoraciones existentes.
- Solo los usuarios con sesión iniciada pueden publicar una; se valida que la
  puntuación esté entre 1 y 5 y que el comentario no esté vacío.
- Cada valoración queda asociada al usuario autenticado que la publicó.

## Modelo de datos en Firestore
 
**`productos`** (el ID del documento coincide con el campo `id`, por ejemplo `p1`)
`id`, `nombre`, `descripcion`, `categoria`, `precio`, `stock`, `disponibilidad`, `imagen`
 
**`pedidos`**
`usuarioId`, `usuarioCorreo`, `productos` (arreglo con `id`, `nombre`, `precio`,
`cantidad`, `subtotal`), `total`, `fecha`, `estado`
 
**`valoraciones`**
`productoId`, `usuarioId`, `usuarioCorreo`, `puntuacion`, `comentario`, `fecha`
 
## Qué información se guarda en LocalStorage
Una única clave, `bytenova_carrito`, con un arreglo de objetos `{ id, cantidad }`
(JSON). Solo se guarda el identificador del producto y la cantidad; el resto de los
datos se obtiene de Firestore al mostrarlos. El carrito se vacía al completar una
compra.

## Organización de archivos
index.html, catalogo.html, producto.html, carrito.html, perfil.html, admin.html
CSS/
  estilos.css
assets/
  productos/           → imágenes de los productos
js/
  firebase/
    config.js          → inicialización de Firebase (app, auth, db)
    productos.js       → obtiene los productos desde Firestore
  sesion.js            → mantiene la sesión y actualiza el navbar (todas las páginas)
  perfil.js            → registro, inicio/cierre de sesión y "Mis pedidos"
  catalogo.js          → catálogo, búsqueda y filtros
  producto.js          → detalle del producto y valoraciones
  carrito.js           → carrito, confirmación de compra, pedidos y stock
## Roles de usuario
- **Cliente:** puede recorrer el catálogo, comprar, ver sus pedidos y publicar
  valoraciones. No ve el enlace de Administración y, si escribe `admin.html` en la
  dirección, el sitio lo redirige al inicio con un aviso.
- **Administrador:** además de lo anterior, ve el enlace "Administración" y puede
  usar el panel para consultar, crear y editar productos.

Al registrarse, todo usuario nuevo queda con el rol `cliente`, guardado en el
documento `usuarios/{uid}`. El formulario de registro no permite elegir otro rol:
el rol de administrador se asigna manualmente desde la consola de Firestore.

## Reglas de seguridad de Firestore
El modo de prueba fue reemplazado por reglas propias. El texto completo está en el
archivo `firestore.rules` de este repositorio. En resumen:

- `usuarios`: cada persona crea y lee solo su propio documento, y el campo `rol`
  nunca puede modificarse desde la web.
- `productos`: lectura pública. Solo el administrador puede crear y editar
  productos. Cualquier otro usuario con sesión únicamente puede bajar el stock al
  comprar. No se pueden eliminar desde la web.
- `pedidos`: cada usuario crea pedidos a su nombre y solo puede leer los suyos.
- `valoraciones`: lectura pública. Solo se crean con el usuario autenticado como
  autor, con puntuación de 1 a 5 y comentario no vacío.


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