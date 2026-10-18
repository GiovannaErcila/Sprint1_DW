// js/firebase/roles.js
// Consulta el rol del usuario en la colección "usuarios".
// Lo usan sesion.js (navbar) y admin.js (protección del panel).

import { db } from "./config.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Devuelve "administrador" solo si el documento existe y así lo dice.
// En cualquier otro caso (sin documento, rol distinto o error de consulta)
// devuelve "cliente": ante la duda, el menor nivel de permisos.
export async function obtenerRol(uid) {
  try {
    const snap = await getDoc(doc(db, "usuarios", uid));
    console.log("UID:", uid, "| documento:", snap.exists() ? snap.data() : "no existe");
    if (snap.exists() && snap.data().rol === "administrador") {
      return "administrador";
    }
    return "cliente";
  } catch (error) {
    console.error("No se pudo consultar el rol del usuario:", error);
    return "cliente";
  }
}