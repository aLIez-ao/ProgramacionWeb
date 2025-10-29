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
  updateDoc,
  increment,
} from "firebase/firestore";

// --- FUNCIÓN PRINCIPAL DE LA PÁGINA ---
export async function VideoPage(user) {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("v");
  const userId = user ? user.uid : null;
  const userInitial = user ? user.email.charAt(0).toUpperCase() : "?";

  const pageContainer = document.createElement("div");
  pageContainer.classList.add("watch-layout");

  const videoRef = doc(db, "videos", videoId);
  const videoSnap = await getDoc(videoRef);

  if (!videoSnap.exists()) {
    pageContainer.innerHTML = "<h1>Video no encontrado (404)</h1>";
    return pageContainer;
  }

  const videoData = videoSnap.data();

  // Renderizado
  pageContainer.innerHTML = VideoPageTemplate(videoData, userInitial);

  // Secciones
  setupVideoActions(pageContainer, user, videoId, videoData.channel);
  setupCommentSection(pageContainer, user, videoId, userInitial);
  setupRelatedVideos(pageContainer, videoId);

  return pageContainer;
}

// ===================================================================
// --- FUNCIÓN PARA LÓGICA DE LIKE/DISLIKE/SUSCRIPCIÓN AL VIDEO ---
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

  // Funciones de UI
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

  // Si el usuario no está logueado
  if (!userId) {
    const authRequired = () => alert("Debes iniciar sesión para hacer esto.");
    likeButton.addEventListener("click", authRequired);
    dislikeButton.addEventListener("click", authRequired);
    subscribeButton.addEventListener("click", authRequired);
    return;
  }

  // --- Lógica para usuarios logueados ---
  const userVideoId = `${userId}_${videoId}`;
  const subId = `${userId}_${channelName}`;
  const likeRef = doc(db, "likes", userVideoId);
  const dislikeRef = doc(db, "dislikes", userVideoId);
  const subRef = doc(db, "subscriptions", subId);

  // Estado inicial
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

  // --- Eventos ---
  likeButton.addEventListener("click", async () => {
    if (isLiked) {
      isLiked = false;
      await deleteDoc(likeRef);
    } else {
      isLiked = true;
      await setDoc(likeRef, { userId, videoId, likedAt: serverTimestamp() });
      if (isDisliked) {
        isDisliked = false;
        await deleteDoc(dislikeRef);
        updateDislikeButton(false);
      }
    }
    updateLikeButton(isLiked);
  });

  dislikeButton.addEventListener("click", async () => {
    if (isDisliked) {
      isDisliked = false;
      await deleteDoc(dislikeRef);
    } else {
      isDisliked = true;
      await setDoc(dislikeRef, {
        userId,
        videoId,
        dislikedAt: serverTimestamp(),
      });
      if (isLiked) {
        isLiked = false;
        await deleteDoc(likeRef);
        updateLikeButton(false);
      }
    }
    updateDislikeButton(isDisliked);
  });

  subscribeButton.addEventListener("click", async () => {
    isSubscribed = !isSubscribed;
    updateSubscribeButton(isSubscribed);

    if (isSubscribed) {
      await setDoc(subRef, {
        userId,
        channelName,
        subscribedAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(subRef);
    }
  });
}

// ===================================================================
// --- FUNCIÓN PARA COMENTARIOS Y RESPUESTAS ---
// ===================================================================
async function setupCommentSection(pageContainer, user, videoId, userInitial) {
  const commentInput = pageContainer.querySelector("#comment-input");
  const addCommentButton = pageContainer.querySelector("#add-comment-button");
  const commentsContainer = pageContainer.querySelector("#comments-container");
  const sortNewestBtn = pageContainer.querySelector("#sort-by-newest");
  const sortTopBtn = pageContainer.querySelector("#sort-by-top");

  const userId = user ? user.uid : null;
  const userEmail = user ? user.email : null;
  let currentSort = "createdAt";

  if (userId) {
    commentInput.addEventListener("input", () => {
      addCommentButton.classList.toggle(
        "enabled",
        commentInput.value.trim().length > 0
      );
    });
  } else {
    commentInput.placeholder = "Inicia sesión para añadir un comentario.";
    commentInput.disabled = true;
    addCommentButton.style.display = "none";
  }

  async function postComment(text, parentId = null) {
    if (!userId) return;
    try {
      await addDoc(collection(db, "comments"), {
        videoId,
        userId,
        userEmail,
        text,
        parentId,
        createdAt: serverTimestamp(),
        likeCount: 0,
        dislikeCount: 0,
        replyCount: 0,
      });

      if (parentId) {
        const parentRef = doc(db, "comments", parentId);
        await updateDoc(parentRef, { replyCount: increment(1) });
        const repliesContainer = commentsContainer.querySelector(
          `.replies-container[data-parent-id="${parentId}"]`
        );
        if (repliesContainer)
          await fetchAndShowReplies(parentId, repliesContainer);
      } else {
        fetchComments(currentSort);
      }
    } catch (error) {
      console.error("Error al añadir comentario:", error);
    }
  }

  addCommentButton.addEventListener("click", async () => {
    if (addCommentButton.classList.contains("enabled")) {
      await postComment(commentInput.value, null);
      commentInput.value = "";
      addCommentButton.classList.remove("enabled");
    }
  });

  async function fetchComments(orderByField) {
    currentSort = orderByField;
    commentsContainer.innerHTML = "Cargando comentarios...";

    const q = query(
      collection(db, "comments"),
      where("videoId", "==", videoId),
      where("parentId", "==", null),
      orderBy(orderByField, "desc")
    );

    const querySnapshot = await getDocs(q);
    commentsContainer.innerHTML = "";

    if (querySnapshot.empty) {
      commentsContainer.innerHTML =
        "<p>Aún no hay comentarios. ¡Sé el primero!</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentId = doc.id;
      const commentElement = renderComment(commentData, commentId, false);
      commentsContainer.appendChild(commentElement);
    });
  }

  function renderComment(commentData, commentId, isReply) {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-thread");

    const authorInitial = commentData.userEmail
      ? commentData.userEmail.charAt(0).toUpperCase()
      : "?";
    const authorName = commentData.userEmail.split("@")[0];

    commentDiv.innerHTML = `
      <div class="comment-avatar">${authorInitial}</div>
      <div class="comment-details">
        <span class="comment-author">@${authorName}</span>
        <p class="comment-text truncated">${commentData.text}</p>
        <div class="comment-actions">
          <button class="like-comment-btn" data-id="${commentId}">
            <i class="fas fa-thumbs-up"></i>
          </button>
          <span>${commentData.likeCount || 0}</span>
          <button class="dislike-comment-btn" data-id="${commentId}">
            <i class="fas fa-thumbs-down"></i>
          </button>
          ${
            !isReply
              ? `<button class="reply-button" data-id="${commentId}">Responder</button>`
              : ""
          }
        </div>
        <div class="add-reply-container"></div>
        ${
          commentData.replyCount > 0
            ? `<button class="view-replies-btn" data-id="${commentId}">
                Ver ${commentData.replyCount} respuestas
              </button>`
            : ""
        }
        <div class="replies-container" data-parent-id="${commentId}"></div>
      </div>
    `;

    // --- Leer más / Mostrar menos ---
    const textElement = commentDiv.querySelector(".comment-text");
    const detailsContainer = commentDiv.querySelector(".comment-details");
    const isOverflowing = textElement.scrollHeight > textElement.clientHeight;
    const hasLineBreaks = commentData.text.includes("\n");

    if (isOverflowing || hasLineBreaks) {
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "show-more-btn";
      let isExpanded = false;

      toggleBtn.textContent = isOverflowing ? "Leer más" : "Mostrar menos";

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

    return commentDiv;
  }

  function showReplyInput(parentId, container) {
    const existingBox = container.querySelector(".add-reply-box");
    if (existingBox) {
      existingBox.remove();
      return;
    }

    const replyBox = document.createElement("div");
    replyBox.classList.add("add-reply-box");
    replyBox.innerHTML = `
      <div class="comment-avatar">${userInitial}</div>
      <textarea placeholder="Añade una respuesta..."></textarea>
      <button>Responder</button>
    `;

    const replyButton = replyBox.querySelector("button");
    const replyText = replyBox.querySelector("textarea");

    replyButton.addEventListener("click", async () => {
      const text = replyText.value;
      if (text.trim().length > 0) {
        await postComment(text, parentId);
        replyBox.remove();
      }
    });

    container.appendChild(replyBox);
  }

  async function fetchAndShowReplies(parentId, container) {
    if (container.children.length > 0) {
      container.innerHTML = "";
      return;
    }

    const q = query(
      collection(db, "comments"),
      where("parentId", "==", parentId),
      orderBy("createdAt", "asc")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No se encontraron respuestas.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const replyElement = renderComment(doc.data(), doc.id, true);
      container.appendChild(replyElement);
    });
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
    const replyBtn = e.target.closest(".reply-button");
    if (replyBtn) {
      if (!userId) {
        alert("Debes iniciar sesión para responder.");
        return;
      }
      const commentId = replyBtn.dataset.id;
      const replyContainer = e.target
        .closest(".comment-details")
        .querySelector(".add-reply-container");
      showReplyInput(commentId, replyContainer);
    }

    const viewRepliesBtn = e.target.closest(".view-replies-btn");
    if (viewRepliesBtn) {
      const commentId = viewRepliesBtn.dataset.id;
      const repliesContainer = e.target
        .closest(".comment-details")
        .querySelector(".replies-container");
      await fetchAndShowReplies(commentId, repliesContainer);
      const currentText = viewRepliesBtn.textContent.trim();
      viewRepliesBtn.textContent = currentText.startsWith("Ver")
        ? "Ocultar respuestas"
        : `Ver ${currentText.split(" ")[1]} respuestas`;
    }
  });

  fetchComments("createdAt");
}

// ===================================================================
// --- VIDEOS RELACIONADOS ---
// ===================================================================
async function setupRelatedVideos(pageContainer, videoId) {
  const relatedVideosList = pageContainer.querySelector(".secondary-column");
  const videosSnapshot = await getDocs(collection(db, "videos"));
  videosSnapshot.forEach((doc) => {
    const relatedVideoData = doc.data();
    if (relatedVideoData.id !== videoId) {
      relatedVideosList.appendChild(VideoCard(relatedVideoData));
    }
  });
}
