// Importamos los datos de ejemplo para encontrar el video
// Importamos el VideoCard para los videos relacionados
// Importamos los estilos para esta página (¡los crearemos en el paso 4!)
import { mockVideos } from "./Home.js";
import { VideoCard } from "../components/VideoCard.js";
import "../styles/videoPage.css";

export function VideoPage() {
  // 1. Leer el ID del video desde la URL (ej. /watch?v=abc12345)
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("v");

  // 2. Encontrar el video en nuestros datos de ejemplo
  const videoData = mockVideos.find((v) => v.id === videoId);

  // 3. Crear el elemento principal de la página
  const pageContainer = document.createElement("div");
  pageContainer.classList.add("watch-layout");

  // Si no se encuentra el video, mostrar un error
  if (!videoData) {
    pageContainer.innerHTML = "<h1>Video no encontrado (404)</h1>";
    return pageContainer;
  }

  // 4. Si se encuentra el video, construir el HTML
  pageContainer.innerHTML = `
    <div class="primary-column">
      
      <div class="video-player-placeholder">
        <span>Reproductor de video (16:9)</span>
      </div>

      <div class="video-info">
        <h1 class="video-title">${videoData.title}</h1>
        <div class="video-actions">
          <div class="channel-info">
            <div class="channel-avatar-lg"></div>
            <div class="channel-meta">
              <span class="channel-name">${videoData.channel}</span>
              <span class="channel-subs">1.2M suscriptores</span>
            </div>
            <button class="subscribe-button">Suscribirse</button>
          </div>
          <div class="action-buttons">
            <button><i class="fas fa-thumbs-up"></i> 15K</button>
            <button><i class="fas fa-thumbs-down"></i></button>
            <button><i class="fas fa-share"></i> Compartir</button>
            <button><i class="fas fa-ellipsis-h"></i> Más</button>
          </div>
        </div>
      </div>

      <div class="comments-section">
        <h2>Comentarios</h2>
        <p>Los comentarios se cargarían aquí...</p>
      </div>

    </div>

    <div class="secondary-column">
      <h2>Videos relacionados</h2>
    </div>
  `;

  // 5. Añadir los videos relacionados (simulados)
  const relatedVideosList = pageContainer.querySelector(".secondary-column");
  // Simplemente mostramos los 3 primeros videos de la lista como "relacionados"
  mockVideos.slice(0, 3).forEach((video) => {
    relatedVideosList.appendChild(VideoCard(video));
  });

  return pageContainer;
}
