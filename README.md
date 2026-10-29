# ByteNova — Proyecto integrador de Desarrollo Web

## Nombre del estudiante
Giovanna Ercila

## De qué trata
ByteNova es una tienda de tecnología en línea (e-commerce) desarrollada como proyecto
integrador de la asignatura Desarrollo Web a lo largo de cuatro sprints. Permite
recorrer un catálogo de productos, ver el detalle de cada uno, armar un carrito,
registrarse, iniciar sesión, confirmar una compra (simulada, sin pagos reales),
consultar los pedidos propios y valorar productos. Además incluye un panel de
administración sencillo para gestionar los productos.

## Sitio publicado
**https://giovannaercila.github.io/Sprint1_DW/**

## Cuentas de evaluación
Cuentas creadas exclusivamente para evaluar el proyecto (no son personales ni
contienen datos reales):

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | prueba1@bytenova.com | Prueba2026 |
| Administradora | prueba2@bytenova.com | Prueba2026 |

También se puede registrar una cuenta nueva desde "Mi perfil" (siempre queda con
rol cliente).

## Funcionalidades principales
- **Catálogo:** productos obtenidos desde Cloud Firestore, con búsqueda por nombre y
  filtro por categoría combinables, mensaje cuando no hay resultados y estados de
  carga y de error.
- **Detalle de producto:** una única página (`producto.html?id=...`) que muestra
  cualquier producto según el identificador de la dirección, con mensaje si el
  producto no existe.
- **Carrito:** agregar, aumentar, disminuir y eliminar productos, con subtotales,
  total y tope de stock. Se conserva al recargar gracias a LocalStorage.
- **Disponibilidad:** un producto marcado como no disponible o sin stock no se puede
  agregar al carrito ni comprar.
- **Cuentas de usuario:** registro, inicio y cierre de sesión con Firebase
  Authentication, validación de campos y mensajes de error en español. La sesión se
  mantiene entre páginas y al recargar.
- **Compra y pedidos:** "Confirmar compra" exige sesión iniciada, vuelve a comprobar
  el stock real y registra el pedido en Firestore mediante una transacción que
  también descuenta el stock (nunca queda negativo). Al completarse, el carrito se
  vacía. Cada usuario ve únicamente sus propios pedidos en "Mi perfil".
- **Valoraciones:** cada producto muestra las valoraciones de otras personas. Solo
  los usuarios con sesión pueden publicar una (puntuación de 1 a 5 y comentario no
  vacío), y queda asociada a su cuenta.
- **Diseño:** responsive con Bootstrap 5, probado en teléfono, tablet y escritorio;
  HTML semántico y accesibilidad básica.

## Tecnologías y servicios
- HTML5, CSS3 y JavaScript (módulos ES, sin frameworks)
- Bootstrap 5 y Bootstrap Icons (por CDN)
- LocalStorage, para el carrito
- Firebase Authentication, para las cuentas de usuario
- Cloud Firestore, para productos, usuarios, pedidos y valoraciones
- Git y GitHub; publicación con GitHub Pages

## Roles de usuario
- **Cliente:** recorre el catálogo, compra, consulta sus pedidos y publica
  valoraciones. No ve el enlace de Administración y, si escribe `admin.html` en la
  dirección, el sitio lo redirige al inicio con un aviso.
- **Administrador:** puede hacer todo lo anterior y además ve el enlace
  "Administración" y utiliza el panel.

Al registrarse, todo usuario nuevo queda con el rol `cliente`, guardado en el
documento `usuarios/{uid}` de Firestore. El formulario de registro no permite elegir
otro rol: el de administrador se asigna manualmente desde la consola de Firestore
a una cuenta de prueba.

## Operaciones del administrador
En la página "Administración" (`admin.html`), accesible solo con sesión iniciada y
rol de administrador:
- Consultar la lista de productos (nombre, categoría, precio, stock y disponibilidad).
- Crear un producto, con validación de nombre, categoría, precio y stock.
- Seleccionar un producto, editar sus datos y guardar los cambios.
- Los cambios se reflejan en el catálogo y en el detalle. Durante cada operación el
  botón se deshabilita y se muestra un mensaje de éxito o de error.

## Modelo de datos en Firestore

**`usuarios`** (el ID del documento es el UID de la cuenta)
`nombre`, `email`, `rol`

**`productos`** (el ID del documento coincide con el campo `id`)
`id`, `nombre`, `descripcion`, `categoria`, `precio`, `stock`, `disponibilidad`, `imagen`

**`pedidos`**
`usuarioId`, `usuarioCorreo`, `productos` (arreglo con `id`, `nombre`, `precio`,
`cantidad`, `subtotal`), `total`, `fecha`, `estado`

**`valoraciones`**
`productoId`, `usuarioId`, `usuarioCorreo`, `puntuacion`, `comentario`, `fecha`

Las consultas de "Mis pedidos" y de valoraciones usan índices compuestos
(`pedidos`: `usuarioId` + `fecha`; `valoraciones`: `productoId` + `fecha`), ya
creados en el proyecto de Firebase.

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

## Qué información se guarda en LocalStorage
Una única clave, `bytenova_carrito`, con un arreglo de objetos `{ id, cantidad }`
(JSON). Solo se guarda el identificador del producto y la cantidad; el resto de los
datos se obtiene de Firestore al mostrarlos. El carrito se vacía al completar una
compra.

## Organización de archivos
```
index.html, catalogo.html, producto.html, carrito.html, perfil.html, admin.html
firestore.rules              → reglas de seguridad de Firestore
CSS/
  estilos.css
assets/
  productos/                 → imágenes de los productos
js/
  firebase/
    config.js                → inicialización de Firebase (app, auth, db)
    productos.js             → obtiene los productos desde Firestore
    roles.js                 → consulta el rol del usuario
  sesion.js                  → sesión y navbar (todas las páginas), enlace de administración
  perfil.js                  → registro, inicio/cierre de sesión y "Mis pedidos"
  catalogo.js                → catálogo, búsqueda y filtros
  producto.js                → detalle del producto y valoraciones
  carrito.js                 → carrito, confirmación de compra, pedidos y stock
  admin.js                   → protección del panel y gestión de productos
```


## Limitaciones conocidas
- **Compra simulada:** no hay pagos reales. El navegador calcula el total del pedido
  y descuenta el stock (con una transacción y reglas que lo limitan). En un entorno
  real esto se resolvería en un servidor o con Cloud Functions, para que ningún
  usuario pueda alterar precios o stock por su cuenta.
- **Panel acotado:** solo gestiona productos. No permite eliminarlos ni administrar
  usuarios, pedidos o comentarios, y el administrador no ve los pedidos de otras
  personas.
- **Rol de administrador manual:** se asigna a mano desde Firestore; no hay pantalla
  para gestionar roles.
- **Imágenes:** cada producto guarda la ruta de una imagen del proyecto
  (`assets/productos/...`); el panel no sube archivos.
- **Carrito por dispositivo:** se guarda en el navegador, por lo que no se comparte
  entre dispositivos.
- **Sin recuperación de contraseña ni verificación de correo**, como indica el
  alcance del sprint.

## Funcionalidades desarrolladas por sprint
- **Sprint 1:** identidad visual, página de inicio, navegación responsive, páginas
  del sitio enlazadas, HTML semántico y accesibilidad básica.
- **Sprint 2:** catálogo dinámico con búsqueda y filtros, detalle por identificador
  en la dirección y carrito con LocalStorage.
- **Sprint 3:** Firebase Authentication, productos en Cloud Firestore, compra con
  pedidos y descuento de stock, "Mis pedidos" y valoraciones asociadas al usuario.
- **Sprint 4:** roles de cliente y administrador, panel de administración de
  productos, reglas de seguridad de Firestore, revisión general y publicación.

---

## Decisiones de diseño adoptadas
- Paleta de color basada en un azul noche (`#0F172A`) como color principal, con
  acentos en celeste para transmitir una identidad tecnológica y confiable.