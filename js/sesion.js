// js/sesion.js

import { auth } from "./firebase/config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerRol } from "./firebase/roles.js";

const btnNavLogin = document.getElementById("btn-nav-login");
const usuarioSesion = document.getElementById("usuario-sesion");
const navUsuarioCorreo = document.getElementById("nav-usuario-correo");
const btnNavLogout = document.getElementById("btn-nav-logout");
const itemAdmin = document.getElementById("nav-admin-item");

onAuthStateChanged(auth, async (usuario) => {
  if (usuario) {
    if (btnNavLogin) btnNavLogin.classList.add("d-none");
    if (usuarioSesion) {
      usuarioSesion.classList.remove("d-none");
      usuarioSesion.classList.add("d-flex");
    }
    if (navUsuarioCorreo) navUsuarioCorreo.textContent = usuario.email;

    // El enlace al panel arranca oculto en el HTML y solo se muestra al admin.
    const rol = await obtenerRol(usuario.uid);
    if (itemAdmin) itemAdmin.classList.toggle("d-none", rol !== "administrador");
  } else {
    if (btnNavLogin) btnNavLogin.classList.remove("d-none");
    if (usuarioSesion) {
      usuarioSesion.classList.add("d-none");
      usuarioSesion.classList.remove("d-flex");
    }
    if (itemAdmin) itemAdmin.classList.add("d-none");
  }
});

if (btnNavLogout) {
  btnNavLogout.addEventListener("click", async () => {
    await signOut(auth);
  });
}

const AVISOS = {
  "sin-sesion": "Para entrar al panel de administración tenés que iniciar sesión.",
  "sin-permisos": "No tenés permisos para acceder al panel de administración.",
};

function mostrarAvisoDesdeUrl() {
  const params = new URLSearchParams(window.location.search);
  const clave = params.get("aviso");
  if (!clave || !AVISOS[clave]) return;

  const principal = document.querySelector("main");
  if (!principal) return;

  const aviso = document.createElement("div");
  aviso.className = "container mt-3";
  aviso.innerHTML = `
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      ${AVISOS[clave]}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
  principal.prepend(aviso);

  // Limpia la URL para que el aviso no reaparezca al recargar.
  params.delete("aviso");
  const resto = params.toString();
  window.history.replaceState({}, "", window.location.pathname + (resto ? "?" + resto : ""));
}

mostrarAvisoDesdeUrl();