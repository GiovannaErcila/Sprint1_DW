// js/perfil.js
// Día 2: registro de usuarios.
// Día 3: inicio y cierre de sesión, con mensajes de error traducidos.

import { auth } from "./firebase/config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const formRegistro = document.getElementById("form-registro");
const mensajeRegistro = document.getElementById("mensaje-registro");

const formLogin = document.getElementById("form-login");
const mensajeLogin = document.getElementById("mensaje-login");

const contenedorFormularios = document.getElementById("formularios-auth");
const panelSesion = document.getElementById("panel-sesion");
const sesionCorreoEl = document.getElementById("sesion-correo");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

// --- Utilidades compartidas --------------------------------------------

function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.classList.remove("text-danger", "text-success");
  if (texto) {
    elemento.classList.add(tipo === "error" ? "text-danger" : "text-success");
  }
}

function traducirErrorFirebase(codigo) {
  const mensajes = {
    "auth/email-already-in-use": "Ese correo ya tiene una cuenta registrada.",
    "auth/invalid-email": "El correo ingresado no es válido.",
    "auth/weak-password": "La contraseña es demasiado débil.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos fallidos. Probá de nuevo más tarde.",
  };
  return mensajes[codigo] || "Ocurrió un error. Intentá de nuevo.";
}

function mostrarSesionIniciada(correo) {
  contenedorFormularios.classList.add("d-none");
  panelSesion.classList.remove("d-none");
  sesionCorreoEl.textContent = correo;
}

function mostrarFormularios() {
  contenedorFormularios.classList.remove("d-none");
  panelSesion.classList.add("d-none");
}

// --- Registro (Día 2) ---------------------------------------------------

function validarRegistro(nombre, correo, contrasena) {
  if (!nombre || !correo || !contrasena) {
    return "Completá todos los campos.";
  }

  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexCorreo.test(correo)) {
    return "Ingresá un correo electrónico válido.";
  }

  if (contrasena.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  return null;
}

formRegistro.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById("registro-nombre").value.trim();
  const correo = document.getElementById("registro-correo").value.trim();
  const contrasena = document.getElementById("registro-contrasena").value;

  const errorValidacion = validarRegistro(nombre, correo, contrasena);
  if (errorValidacion) {
    mostrarMensaje(mensajeRegistro, errorValidacion, "error");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, correo, contrasena);
    mostrarMensaje(mensajeRegistro, "Cuenta creada correctamente. Ya podés iniciar sesión.", "exito");
    formRegistro.reset();
  } catch (error) {
    mostrarMensaje(mensajeRegistro, traducirErrorFirebase(error.code), "error");
  }
});

// --- Inicio y cierre de sesión (Día 3) -----------------------------------

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const correo = document.getElementById("login-correo").value.trim();
  const contrasena = document.getElementById("login-contrasena").value;

  if (!correo || !contrasena) {
    mostrarMensaje(mensajeLogin, "Completá correo y contraseña.", "error");
    return;
  }

  try {
    const credencial = await signInWithEmailAndPassword(auth, correo, contrasena);
    mostrarMensaje(mensajeLogin, "", "exito");
    formLogin.reset();
    mostrarSesionIniciada(credencial.user.email);
  } catch (error) {
    mostrarMensaje(mensajeLogin, traducirErrorFirebase(error.code), "error");
  }
});

btnCerrarSesion.addEventListener("click", async () => {
  await signOut(auth);
  mostrarFormularios();
});

