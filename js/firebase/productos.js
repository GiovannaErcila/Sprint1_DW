// firebase/productos-firestore.js

import { db } from "./config.js";

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/**
 * Obtiene la lista de productos desde Firestore.
 * Mapea tanto los datos del documento como su ID único.
 */
export async function obtenerProductosFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "productos"));

    const lista = snapshot.docs.map((documento) => {
      const datos = documento.data();
      return {
        id: documento.id, // Asigna el ID del documento en Firestore (o respeta si ya tenía un campo id)
        ...datos,
      };
    });

    return lista;
  } catch (error) {
    console.error("Error al obtener los productos de Firestore:", error);
    throw error;
  }
}
