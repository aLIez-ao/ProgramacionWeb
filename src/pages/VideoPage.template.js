// src/pages/VideoPage.template.js

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
        
        <div class="comments-header">
          <h2>Comentarios</h2>
          <div class="sort-buttons">
            <button id="sort-by-newest" class="sort-active">Más recientes</button>
            <button id="sort-by-top">Más relevantes</button>
          </div>
        </div>

        <div class="add-comment-box">
          <div class="channel-avatar-lg"></div>
          <textarea id="comment-input" placeholder="Añade un comentario..."></textarea>
          <button id="add-comment-button">Comentar</button>
        </div>

        <div id="comments-container">
          </div>

      </div>

    </div>

    <div class="secondary-column">
      <h2>Videos relacionados</h2>
    </div>
  `;
}
