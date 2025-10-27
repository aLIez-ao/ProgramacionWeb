// src/pages/VideoPage.template.js

// Esta función recibe los datos del video y devuelve el HTML
export function VideoPageTemplate(videoData) {
  return `
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
}
