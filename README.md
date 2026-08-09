# ByteNova — Proyecto integrador de Desarrollo Web

## Nombre del proyecto
ByteNova — tienda de comercio electrónico de tecnología.

## Nombre del estudiante
Giovanna

## Descripción del e-commerce
ByteNova es una tienda online especializada en la venta de productos tecnológicos:
notebooks, smartphones, auriculares, accesorios, componentes y periféricos gamer.
El proyecto se desarrolla de forma incremental a lo largo de 4 sprints, ampliando en
cada etapa las funcionalidades del sitio sin eliminar lo construido anteriormente.

## Público objetivo
Personas jóvenes y adultas, usuarias habituales de tecnología, que buscan productos
de calidad con buena relación precio-rendimiento, envío rápido y soporte confiable.

## Categorías de productos
- Notebooks
- Smartphones
- Auriculares
- Gaming
- Accesorios
- Componentes

## Tecnologías utilizadas
- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript
- **Persistencia local temporal:** LocalStorage (a partir del Sprint 2)
- **Persistencia definitiva:** Cloud Firestore (a partir del Sprint 3)
- **Autenticación:** Firebase Authentication (a partir del Sprint 3)
- **Control de versiones:** Git y GitHub
- **Despliegue:** GitHub Pages

## Estructura general del proyecto
```
├── index.html
├── catalogo.html
├── producto.html
├── carrito.html
├── perfil.html
├── admin.html
├── css/
│   └── styles.css
├── js/
│   ├── modules/
│   └── pages/
├── assets/
│   ├── img/
│   ├── icons/
│   └── logo/
├── README.md
└── .gitignore
```

## Instrucciones de ejecución
1. Cloná o descargá este repositorio.
2. Abrí la carpeta del proyecto en Visual Studio Code.
3. Abrí `index.html` con la extensión **Live Server** (o hacé doble clic para
   abrirlo directamente en el navegador).
4. No requiere instalación de dependencias: Bootstrap y las fuentes se cargan
   desde CDN.

## Funcionalidades desarrolladas en el Sprint 1
- Identidad visual propia (nombre, logotipo textual, paleta de colores, tipografía).
- Página de inicio (`index.html`) con encabezado, hero, productos destacados
  estáticos, sección de beneficios y pie de página.
- Barra de navegación responsive con menú hamburguesa, indicador de carrito y
  botón de inicio de sesión (con aviso de funcionalidad pendiente).
- Todas las páginas del sitio (`catalogo.html`, `producto.html`, `carrito.html`,
  `perfil.html`, `admin.html`) creadas, enlazadas y con aviso de
  "Funcionalidad en desarrollo" indicando el sprint correspondiente.
- HTML semántico (`header`, `nav`, `main`, `section`, `footer`) y jerarquía
  correcta de encabezados.
- Diseño responsive probado en teléfono, tablet y escritorio mediante Bootstrap
  Grid y Flexbox.
- Accesibilidad básica: textos alternativos en imágenes, foco visible,
  etiquetas `aria-label`, navegación por teclado.

## Funcionalidades pendientes
- Catálogo dinámico con búsqueda, filtros y ordenamiento (Sprint 2).
- Detalle dinámico de producto (Sprint 2).
- Carrito de compras con LocalStorage (Sprint 2).
- Registro e inicio de sesión con Firebase Authentication (Sprint 3).
- Persistencia de datos en Cloud Firestore (Sprint 3).
- Panel administrativo con operaciones CRUD (Sprint 4).

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