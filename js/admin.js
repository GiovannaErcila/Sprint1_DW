// js/admin.js
// Protege admin.html: solo un usuario con sesión iniciada y rol "administrador"
// puede ver el contenido. Cualquier otro caso se redirige a index.html con un aviso.
// (La protección de los datos en sí la hacen las reglas de Firestore.)

import { auth } from "./firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerRol } from "./firebase/roles.js";

const verificando = document.getElementById("admin-verificando");
const contenido = document.getElementById("admin-contenido");

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
});