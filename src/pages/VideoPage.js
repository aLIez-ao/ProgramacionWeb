// --- IMPORTACIONES ---
import { VideoCard } from "../components/VideoCard.js";
import { VideoPageTemplate } from "./VideoPage.template.js";
import "../styles/videoPage.css";
import { db } from "../services/firebaseConfig.js";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  addDoc, // <-- ¡NUEVO! Para añadir comentarios
  query, // <-- ¡NUEVO! Para ordenar/filtrar
  where, // <-- ¡NUEVO!
  orderBy, // <-- ¡NUEVO!
} from "firebase/firestore";

// --- FUNCIÓN PRINCIPAL DE LA PÁGINA ---
export async function VideoPage(user) {
  // --- INICIALIZACIÓN Y OBTENCIÓN DE DATOS (Sin cambios) ---
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("v");
  const userId = user ? user.uid : null;

  const pageContainer = document.createElement("div");
  pageContainer.classList.add("watch-layout");

  const videoRef = doc(db, "videos", videoId);
  const videoSnap = await getDoc(videoRef);

  if (!videoSnap.exists()) {
    pageContainer.innerHTML = "<h1>Video no encontrado (404)</h1>";
    return pageContainer;
  }
  const videoData = videoSnap.data();

  // --- RENDERIZADO DE LA PLANTILLA (Sin cambios) ---
  pageContainer.innerHTML = VideoPageTemplate(videoData);

  // --- LÓGICA DE LIKES Y SUSCRIPCIONES (Sin cambios) ---
  // (Esta sección sigue igual que antes, manejando los botones de like/sub del video)
  setupVideoActions(pageContainer, user, videoId, videoData.channel);

  // --- ¡NUEVA LÓGICA DE COMENTARIOS! ---
  setupCommentSection(pageContainer, user, videoId);

  // --- LÓGICA DE VIDEOS RELACIONADOS (Sin cambios) ---
  setupRelatedVideos(pageContainer, videoId);

  return pageContainer;
}

// ===================================================================
// --- FUNCIÓN PARA LÓGICA DE LIKE/SUSCRIBIRSE AL VIDEO ---
// (Refactorizamos tu lógica anterior en esta función)
// ===================================================================
async function setupVideoActions(pageContainer, user, videoId, channelName) {
  const likeButton = pageContainer.querySelector(
    ".action-buttons button:nth-child(1)"
  );
  const dislikeButton = pageContainer.querySelector(
    ".action-buttons button:nth-child(2)"
  );
  const subscribeButton = pageContainer.querySelector(".subscribe-button");
  const userId = user ? user.uid : null;

  function updateLikeButton(liked) {
    liked
      ? likeButton.classList.add("active")
      : likeButton.classList.remove("active");
  }
  function updateDislikeButton(disliked) {
    disliked
      ? dislikeButton.classList.add("active")
      : dislikeButton.classList.remove("active");
  }
  function updateSubscribeButton(subscribed) {
    if (subscribed) {
      subscribeButton.classList.add("subscribed");
      subscribeButton.textContent = "Suscrito";
    } else {
      subscribeButton.classList.remove("subscribed");
      subscribeButton.textContent = "Suscribirse";
    }
  }

  if (userId) {
    const userVideoId = `${userId}_${videoId}`;
    const subId = `${userId}_${channelName}`;
    const likeRef = doc(db, "likes", userVideoId);
    const dislikeRef = doc(db, "dislikes", userVideoId);
    const subRef = doc(db, "subscriptions", subId);

    const [likeSnap, dislikeSnap, subSnap] = await Promise.all([
      getDoc(likeRef),
      getDoc(dislikeRef),
      getDoc(subRef),
    ]);

    let isLiked = likeSnap.exists();
    let isDisliked = dislikeSnap.exists();
    let isSubscribed = subSnap.exists();

    updateLikeButton(isLiked);
    updateDislikeButton(isDisliked);
    updateSubscribeButton(isSubscribed);

    likeButton.addEventListener("click", async () => {
      // ... (lógica de like/unlike que ya tenías)
    });
    dislikeButton.addEventListener("click", async () => {
      // ... (lógica de dislike/undislike que ya tenías)
    });
    subscribeButton.addEventListener("click", async () => {
      // ... (lógica de suscribir/desuscribir que ya tenías)
    });
  } else {
    const authRequired = () => alert("Debes iniciar sesión para hacer esto.");
    likeButton.addEventListener("click", authRequired);
    dislikeButton.addEventListener("click", authRequired);
    subscribeButton.addEventListener("click", authRequired);
  }
}

// ===================================================================
// --- ¡NUEVA SECCIÓN DE LÓGICA DE COMENTARIOS! ---
// ===================================================================
async function setupCommentSection(pageContainer, user, videoId) {
  const commentInput = pageContainer.querySelector("#comment-input");
  const addCommentButton = pageContainer.querySelector("#add-comment-button");
  const commentsContainer = pageContainer.querySelector("#comments-container");
  const sortNewestBtn = pageContainer.querySelector("#sort-by-newest");
  const sortTopBtn = pageContainer.querySelector("#sort-by-top");

  const userId = user ? user.uid : null;
  const userEmail = user ? user.email : null;

  // Habilitar/Deshabilitar el botón de comentar
  if (userId) {
    commentInput.addEventListener("input", () => {
      if (commentInput.value.trim().length > 0) {
        addCommentButton.classList.add("enabled");
      } else {
        addCommentButton.classList.remove("enabled");
      }
    });
  } else {
    commentInput.placeholder = "Inicia sesión para añadir un comentario.";
    commentInput.disabled = true;
  }

  // --- FUNCIÓN PARA PUBLICAR UN NUEVO COMENTARIO ---
  addCommentButton.addEventListener("click", async () => {
    if (!userId || !addCommentButton.classList.contains("enabled")) return;

    const text = commentInput.value;
    try {
      // Añadimos el nuevo comentario a la colección 'comments'
      await addDoc(collection(db, "comments"), {
        videoId: videoId,
        userId: userId,
        userEmail: userEmail,
        text: text,
        createdAt: serverTimestamp(),
        likeCount: 0,
        dislikeCount: 0,
        replyCount: 0,
      });
      // Limpiamos el input y recargamos los comentarios
      commentInput.value = "";
      addCommentButton.classList.remove("enabled");
      fetchComments("createdAt"); // Recargar con los más nuevos
    } catch (error) {
      console.error("Error al añadir comentario:", error);
    }
  });

  // --- FUNCIÓN PARA CARGAR COMENTARIOS ---
  async function fetchComments(orderByField) {
    commentsContainer.innerHTML = "Cargando comentarios...";

    // 1. Creamos la consulta (query)
    const q = query(
      collection(db, "comments"),
      where("videoId", "==", videoId), // Solo de este video
      orderBy(orderByField, "desc") // Ordenados
    );

    // 2. Ejecutamos la consulta
    const querySnapshot = await getDocs(q);
    commentsContainer.innerHTML = ""; // Limpiamos el "Cargando..."

    if (querySnapshot.empty) {
      commentsContainer.innerHTML =
        "<p>Aún no hay comentarios. ¡Sé el primero!</p>";
      return;
    }

    // 3. Renderizamos cada comentario
    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentId = doc.id;
      const commentElement = renderComment(commentData, commentId);
      commentsContainer.appendChild(commentElement);
    });
  }

  // --- FUNCIÓN PARA "PINTAR" UN SOLO COMENTARIO ---
  function renderComment(commentData, commentId) {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-thread");

    // Obtenemos la inicial del email para el avatar
    const authorInitial = commentData.userEmail
      ? commentData.userEmail.charAt(0).toUpperCase()
      : "?";

    commentDiv.innerHTML = `
      <div class="channel-avatar-lg">${authorInitial}</div>
      <div class="comment-details">
        <span class="comment-author">@${
          commentData.userEmail.split("@")[0]
        }</span>
        <p class="comment-text">${commentData.text}</p>
        <div class="comment-actions">
          <button class="like-comment-btn" data-id="${commentId}">
            <i class="fas fa-thumbs-up"></i>
          </button>
          <span>${commentData.likeCount || 0}</span>
          <button class="dislike-comment-btn" data-id="${commentId}">
            <i class="fas fa-thumbs-down"></i>
          </button>
          <button class="reply-button" data-id="${commentId}">Responder</button>
        </div>
      </div>
    `;
    return commentDiv;
  }

  // --- LÓGICA DE ORDENAR ---
  sortNewestBtn.addEventListener("click", () => {
    sortNewestBtn.classList.add("sort-active");
    sortTopBtn.classList.remove("sort-active");
    fetchComments("createdAt"); // 'createdAt' es el campo de la fecha
  });

  sortTopBtn.addEventListener("click", () => {
    sortTopBtn.classList.add("sort-active");
    sortNewestBtn.classList.remove("sort-active");
    fetchComments("likeCount"); // 'likeCount' es el campo de "relevancia"
  });

  // --- LÓGICA DE LIKE/DISLIKE DE COMENTARIOS (Usando Delegación de Eventos) ---
  commentsContainer.addEventListener("click", async (e) => {
    if (!userId) {
      alert("Debes iniciar sesión para valorar comentarios.");
      return;
    }

    const likeBtn = e.target.closest(".like-comment-btn");
    const dislikeBtn = e.target.closest(".dislike-comment-btn");

    if (!likeBtn && !dislikeBtn) return; // No se hizo clic en un botón de like/dislike

    const commentId = likeBtn ? likeBtn.dataset.id : dislikeBtn.dataset.id;
    const type = likeBtn ? "like" : "dislike";

    // ¡Lógica de like/dislike mutuamente excluyente! (La omitimos por brevedad)
    // ... esta lógica sería idéntica a la de los videos, pero
    // usando la colección 'comment_likes' y actualizando 'likeCount'
    // en el documento del comentario.
    alert(
      `Has hecho clic en ${type} en el comentario ${commentId}. (Lógica pendiente)`
    );
  });

  // --- Carga inicial de comentarios ---
  fetchComments("createdAt"); // Cargar comentarios por defecto
}

// ===================================================================
// --- FUNCIÓN PARA CARGAR VIDEOS RELACIONADOS ---
// (Refactorizamos tu lógica anterior en esta función)
// ===================================================================
async function setupRelatedVideos(pageContainer, videoId) {
  const relatedVideosList = pageContainer.querySelector(".secondary-column");
  const videosCollection = collection(db, "videos");
  const videosSnapshot = await getDocs(videosCollection);

  videosSnapshot.forEach((doc) => {
    const relatedVideoData = doc.data();
    if (relatedVideoData.id !== videoId) {
      relatedVideosList.appendChild(VideoCard(relatedVideoData));
    }
  });
}
