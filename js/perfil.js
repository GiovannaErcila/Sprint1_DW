// js/perfil.js

import { auth, db } from "./firebase/config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const formRegistro = document.getElementById("form-registro");
const mensajeRegistro = document.getElementById("mensaje-registro");

const formLogin = document.getElementById("form-login");
const mensajeLogin = document.getElementById("mensaje-login");

const contenedorFormularios = document.getElementById("formularios-auth");
const panelSesion = document.getElementById("panel-sesion");
const sesionCorreoEl = document.getElementById("sesion-correo");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

const pedidosCargando = document.getElementById("pedidos-cargando");
const pedidosVacio = document.getElementById("pedidos-vacio");
const listaPedidos = document.getElementById("lista-pedidos");


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

async function cargarPedidosUsuario(uid) {
  pedidosCargando.classList.remove("d-none");
  pedidosVacio.classList.add("d-none");
  listaPedidos.innerHTML = "";

  try {
    const consulta = query(
      collection(db, "pedidos"),
      where("usuarioId", "==", uid),
      orderBy("fecha", "desc")
    );
    const snapshot = await getDocs(consulta);

    pedidosCargando.classList.add("d-none");

    if (snapshot.empty) {
      pedidosVacio.classList.remove("d-none");
      return;
    }

    snapshot.forEach((docSnap) => {
      const pedido = docSnap.data();
      const fecha = pedido.fecha ? pedido.fecha.toDate().toLocaleString("es-UY") : "Fecha no disponible";

      const detalleProductos = (pedido.productos || [])
        .map((p) => `${p.nombre} x${p.cantidad} ($${p.subtotal.toLocaleString("es-UY")})`)
        .join(", ");

      const tarjeta = document.createElement("div");
      tarjeta.classList.add("card", "mb-3");
      tarjeta.innerHTML = `
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <h3 class="h6 mb-1">Pedido ${docSnap.id}</h3>
            <span class="badge bg-success-subtle text-success">${pedido.estado || "confirmado"}</span>
          </div>
          <p class="small text-muted mb-2">${fecha}</p>
          <p class="small mb-2">${detalleProductos}</p>
          <p class="fw-bold mb-0">Total: $${pedido.total.toLocaleString("es-UY")}</p>
        </div>
      `;
      listaPedidos.appendChild(tarjeta);
    });
  } catch (error) {
    console.error(error);
    pedidosCargando.classList.add("d-none");
    listaPedidos.innerHTML = `<p class="text-danger">No se pudieron cargar tus pedidos.</p>`;
  }
}


onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    mostrarSesionIniciada(usuario.email);
    cargarPedidosUsuario(usuario.uid);
  } else {
    mostrarFormularios();
  }
});


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

  const botonRegistro = formRegistro.querySelector("button[type='submit']");
  botonRegistro.disabled = true;

  try {
    const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena);


    await setDoc(doc(db, "usuarios", credencial.user.uid), {
      nombre,
      email: credencial.user.email,
      rol: "cliente",
    });

    mostrarMensaje(mensajeRegistro, "Cuenta creada correctamente. Ya podés iniciar sesión.", "exito");
    formRegistro.reset();
  } catch (error) {
    mostrarMensaje(mensajeRegistro, traducirErrorFirebase(error.code), "error");
  } finally {
    botonRegistro.disabled = false;
  }
});


formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const correo = document.getElementById("login-correo").value.trim();
  const contrasena = document.getElementById("login-contrasena").value;

  if (!correo || !contrasena) {
    mostrarMensaje(mensajeLogin, "Completá correo y contraseña.", "error");
    return;
  }

  const botonLogin = formLogin.querySelector("button[type='submit']");
  botonLogin.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, correo, contrasena);
    formLogin.reset();
  } catch (error) {
    mostrarMensaje(mensajeLogin, traducirErrorFirebase(error.code), "error");
  } finally {
    botonLogin.disabled = false;
  }
});

btnCerrarSesion.addEventListener("click", async () => {
  await signOut(auth);
});


