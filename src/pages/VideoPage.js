import { VideoCard } from "../components/VideoCard.js";
import { VideoPageTemplate } from "./VideoPage.template.js";
import "../styles/videoPage.css";
import { db } from "../services/firebaseConfig.js"; // <-- Importa la DB
import { doc, getDoc, collection, getDocs } from "firebase/firestore"; // <-- Importa más funciones

// ¡La función ahora es 'async'!
export async function VideoPage() {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("v");

  const pageContainer = document.createElement("div");
  pageContainer.classList.add("watch-layout");

  // 1. APUNTAR A UN DOCUMENTO ESPECÍFICO
  const videoRef = doc(db, "videos", videoId); // Apunta a db -> colección "videos" -> doc con ID "videoId"

  // 2. PEDIR ESE DOCUMENTO
  const videoSnap = await getDoc(videoRef);

  if (!videoSnap.exists()) {
    // Si el video no existe en Firestore
    pageContainer.innerHTML = "<h1>Video no encontrado (404)</h1>";
    return pageContainer;
  }

  // 3. OBTENER LOS DATOS
  const videoData = videoSnap.data();

  // 4. CONSTRUIR LA VISTA (Usando la plantilla)
  pageContainer.innerHTML = VideoPageTemplate(videoData);

  // 5. LÓGICA DE VIDEOS RELACIONADOS (Leyendo de Firestore)
  const relatedVideosList = pageContainer.querySelector(".secondary-column");
  const videosCollection = collection(db, "videos");
  const videosSnapshot = await getDocs(videosCollection);

  videosSnapshot.forEach((doc) => {
    const relatedVideoData = doc.data();
    // Añadimos todos menos el video actual
    if (relatedVideoData.id !== videoId) {
      relatedVideosList.appendChild(VideoCard(relatedVideoData));
    }
  });

  return pageContainer;
}
