// js/sesion.js
// Se incluye (como módulo) en TODAS las páginas del sitio.
// Mantiene la sesión activa al recargar y actualiza el navbar según el usuario.

import { auth } from "./firebase/config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const btnNavLogin = document.getElementById("btn-nav-login");
const usuarioSesion = document.getElementById("usuario-sesion");
const navUsuarioCorreo = document.getElementById("nav-usuario-correo");
const btnNavLogout = document.getElementById("btn-nav-logout");

onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    if (btnNavLogin) btnNavLogin.classList.add("d-none");
    if (usuarioSesion) {
      usuarioSesion.classList.remove("d-none");
      usuarioSesion.classList.add("d-flex");
    }
    if (navUsuarioCorreo) navUsuarioCorreo.textContent = usuario.email;
  } else {
    if (btnNavLogin) btnNavLogin.classList.remove("d-none");
    if (usuarioSesion) {
      usuarioSesion.classList.add("d-none");
      usuarioSesion.classList.remove("d-flex");
    }
  }
});

if (btnNavLogout) {
  btnNavLogout.addEventListener("click", async () => {
    await signOut(auth);
  });
}
