import "../styles/videoCard.css";

// Este componente es una "plantilla".
// Recibe un objeto 'video' con datos y los usa para rellenar el HTML.
export function VideoCard(video) {
  const cardEl = document.createElement("article");
  cardEl.classList.add("video-card");

  // Usamos template literals (comillas ``) para insertar las variables
  cardEl.innerHTML = `
    <div class="video-thumbnail">
        <span class="video-duration">${video.duration}</span>
    </div>
    <div class="video-details">
        <div class="channel-avatar"></div>
        <div class="video-meta">
            <h3 class="video-title">${video.title}</h3>
            <p class="video-channel-name">${video.channel}</p>
            <p class="video-stats">${video.views} • ${video.uploaded}</p>
        </div>
    </div>
  `;

  return cardEl;
}
