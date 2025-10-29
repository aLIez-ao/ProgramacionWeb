import { VideoCard } from "../components/VideoCard.js";
import { db } from "../services/firebaseConfig.js"; // <-- Importa la DB
import { collection, getDocs } from "firebase/firestore"; // <-- Importa funciones de Firestore

// ¡La función ahora es 'async'!
export async function HomePage() {
  const gridEl = document.createElement("div");
  gridEl.classList.add("video-grid");

  // 1. Apuntamos a la colección "videos" en Firestore
  const videosCollection = collection(db, "videos");

  // 2. Pedimos todos los documentos (videos) de esa colección
  const videosSnapshot = await getDocs(videosCollection);

  // 3. Recorremos la respuesta y creamos las tarjetas
  videosSnapshot.forEach((doc) => {
    // doc.data() contiene el objeto del video (title, channel, etc.)
    const videoData = doc.data();
    gridEl.appendChild(VideoCard(videoData));
  });

  return gridEl;
}
