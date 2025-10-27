// 1. IMPORTACIONES
import { mockVideos } from "./Home.js";
import { VideoCard } from "../components/VideoCard.js";
import { VideoPageTemplate } from "./VideoPage.template.js";
import "../styles/videoPage.css";

export function VideoPage() {
  // --- LÓGICA (El "Controlador") ---

  // 1. Leer el ID del video desde la URL
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("v");

  // 2. Encontrar el video en nuestros datos de ejemplo
  const videoData = mockVideos.find((v) => v.id === videoId);

  // 3. Crear el elemento principal de la página
  const pageContainer = document.createElement("div");
  pageContainer.classList.add("watch-layout");

  // 4. Manejar "Video no encontrado"
  if (!videoData) {
    pageContainer.innerHTML = "<h1>Video no encontrado (404)</h1>";
    return pageContainer;
  }

  // --- VISTA (Llamada a la Plantilla) ---

  // 5. Construir el HTML llamando a la plantilla
  pageContainer.innerHTML = VideoPageTemplate(videoData);

  // --- LÓGICA (Post-Renderizado) ---

  // 6. Añadir los videos relacionados (simulados)
  // Buscamos el contenedor que la plantilla acaba de crear
  const relatedVideosList = pageContainer.querySelector(".secondary-column");

  // Llenamos el contenedor
  mockVideos.slice(0, 3).forEach((video) => {
    relatedVideosList.appendChild(VideoCard(video));
  });

  // 7. Devolver la página completa
  return pageContainer;
}
