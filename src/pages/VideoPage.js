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
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// --- FUNCIÓN PRINCIPAL DE LA PÁGINA ---
export async function VideoPage(user) {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("v");
  const userId = user ? user.uid : null;

  const pageContainer = document.createElement("div");
  pageContainer.classList.add("watch-layout");

  // --- OBTENER DATOS DEL VIDEO ---
  const videoRef = doc(db, "videos", videoId);
  const videoSnap = await getDoc(videoRef);

  if (!videoSnap.exists()) {
    pageContainer.innerHTML = "<h1>Video no encontrado (404)</h1>";
    return pageContainer;
  }
  const videoData = videoSnap.data();

  // --- DEFINIR INICIAL DEL USUARIO ---
  const userInitial = user ? user.email.charAt(0).toUpperCase() : "?";

  // --- RENDERIZADO DE LA PLANTILLA ---
  pageContainer.innerHTML = VideoPageTemplate(videoData, userInitial);

  // --- LÓGICA DE LIKE/SUSCRIBIRSE ---
  setupVideoActions(pageContainer, user, videoId, videoData.channel);

  // --- LÓGICA DE COMENTARIOS ---
  setupCommentSection(pageContainer, user, videoId);

  // --- LÓGICA DE VIDEOS RELACIONADOS ---
  setupRelatedVideos(pageContainer, videoId);

  return pageContainer;
}

// ===================================================================
// --- FUNCIÓN PARA LIKES/SUSCRIBIRSE ---
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
      // Lógica de like/unlike
    });
    dislikeButton.addEventListener("click", async () => {
      // Lógica de dislike/undislike
    });
    subscribeButton.addEventListener("click", async () => {
      // Lógica de suscribir/desuscribir
    });
  } else {
    const authRequired = () => alert("Debes iniciar sesión para hacer esto.");
    likeButton.addEventListener("click", authRequired);
    dislikeButton.addEventListener("click", authRequired);
    subscribeButton.addEventListener("click", authRequired);
  }
}

// ===================================================================
// --- FUNCIÓN DE COMENTARIOS ---
async function setupCommentSection(pageContainer, user, videoId) {
  const commentInput = pageContainer.querySelector("#comment-input");
  const addCommentButton = pageContainer.querySelector("#add-comment-button");
  const commentsContainer = pageContainer.querySelector("#comments-container");
  const sortNewestBtn = pageContainer.querySelector("#sort-by-newest");
  const sortTopBtn = pageContainer.querySelector("#sort-by-top");

  const userId = user ? user.uid : null;
  const userEmail = user ? user.email : null;

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

  addCommentButton.addEventListener("click", async () => {
    if (!userId || !addCommentButton.classList.contains("enabled")) return;
    const text = commentInput.value;
    try {
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
      commentInput.value = "";
      addCommentButton.classList.remove("enabled");
      fetchComments("createdAt");
    } catch (error) {
      console.error("Error al añadir comentario:", error);
    }
  });

  // --- FUNCIÓN PARA CARGAR COMENTARIOS ---
  async function fetchComments(orderByField) {
    commentsContainer.innerHTML = "Cargando comentarios...";
    const q = query(
      collection(db, "comments"),
      where("videoId", "==", videoId),
      orderBy(orderByField, "desc")
    );
    const querySnapshot = await getDocs(q);
    commentsContainer.innerHTML = "";

    if (querySnapshot.empty) {
      commentsContainer.innerHTML =
        "<p>Aún no hay comentarios. ¡Sé el primero!</p>";
      return;
    }

    // --- Renderizamos cada comentario (ACTUALIZADO) ---
    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentId = doc.id;

      // Renderiza y añade el comentario
      const commentElement = renderComment(commentData, commentId);
      commentsContainer.appendChild(commentElement);

      // --- Lógica de "Leer más" / "Mostrar menos" ---
      const textElement = commentElement.querySelector(".comment-text");
      const detailsContainer = commentElement.querySelector(".comment-details");

      const isOverflowing = textElement.scrollHeight > textElement.clientHeight;
      const hasLineBreaks = commentData.text.includes("\n");

      if (isOverflowing || hasLineBreaks) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "show-more-btn";
        let isExpanded = false;

        if (hasLineBreaks && !isOverflowing) {
          isExpanded = true;
          toggleBtn.textContent = "Mostrar menos";
        } else {
          isExpanded = false;
          toggleBtn.textContent = "Leer más";
        }

        detailsContainer.insertBefore(toggleBtn, textElement.nextSibling);

        toggleBtn.addEventListener("click", () => {
          isExpanded = !isExpanded;
          if (isExpanded) {
            textElement.classList.remove("truncated");
            toggleBtn.textContent = "Mostrar menos";
          } else {
            textElement.classList.add("truncated");
            toggleBtn.textContent = "Leer más";
          }
        });
      }
    });
  }

  function renderComment(commentData, commentId) {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-thread");

    const authorInitial = commentData.userEmail
      ? commentData.userEmail.charAt(0).toUpperCase()
      : "?";

    commentDiv.innerHTML = `
      <div class="comment-avatar">${authorInitial}</div>
      <div class="comment-details">
        <span class="comment-author">@${
          commentData.userEmail.split("@")[0]
        }</span>
        <p class="comment-text truncated">${commentData.text}</p>
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

  sortNewestBtn.addEventListener("click", () => {
    sortNewestBtn.classList.add("sort-active");
    sortTopBtn.classList.remove("sort-active");
    fetchComments("createdAt");
  });

  sortTopBtn.addEventListener("click", () => {
    sortTopBtn.classList.add("sort-active");
    sortNewestBtn.classList.remove("sort-active");
    fetchComments("likeCount");
  });

  commentsContainer.addEventListener("click", async (e) => {
    if (!userId) {
      alert("Debes iniciar sesión para valorar comentarios.");
      return;
    }
    const likeBtn = e.target.closest(".like-comment-btn");
    const dislikeBtn = e.target.closest(".dislike-comment-btn");
    if (!likeBtn && !dislikeBtn) return;
    const commentId = likeBtn ? likeBtn.dataset.id : dislikeBtn.dataset.id;
    const type = likeBtn ? "like" : "dislike";
    alert(
      `Has hecho clic en ${type} en el comentario ${commentId}. (Lógica pendiente)`
    );
  });

  fetchComments("createdAt");
}

// ===================================================================
// --- FUNCIÓN PARA VIDEOS RELACIONADOS ---
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
