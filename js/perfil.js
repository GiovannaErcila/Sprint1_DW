// js/perfil.js
// Registro de usuarios con validación de campos y Firebase Authentication.

import { auth } from "./firebase/config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const formRegistro = document.getElementById("form-registro");
const mensajeRegistro = document.getElementById("mensaje-registro");

function mostrarMensaje(texto, tipo) {
  mensajeRegistro.textContent = texto;
  mensajeRegistro.classList.remove("text-danger", "text-success");
  mensajeRegistro.classList.add(tipo === "error" ? "text-danger" : "text-success");
}

function validarFormulario(nombre, correo, contrasena) {
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

function traducirErrorFirebase(codigo) {
  const mensajes = {
    "auth/email-already-in-use": "Ese correo ya tiene una cuenta registrada.",
    "auth/invalid-email": "El correo ingresado no es válido.",
    "auth/weak-password": "La contraseña es demasiado débil.",
  };
  return mensajes[codigo] || "Ocurrió un error al crear la cuenta. Intentá de nuevo.";
}

formRegistro.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById("registro-nombre").value.trim();
  const correo = document.getElementById("registro-correo").value.trim();
  const contrasena = document.getElementById("registro-contrasena").value;

  const errorValidacion = validarFormulario(nombre, correo, contrasena);
  if (errorValidacion) {
    mostrarMensaje(errorValidacion, "error");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, correo, contrasena);
    mostrarMensaje("Cuenta creada correctamente. Ya podés iniciar sesión.", "exito");
    formRegistro.reset();
  } catch (error) {
    mostrarMensaje(traducirErrorFirebase(error.code), "error");
  }
});
