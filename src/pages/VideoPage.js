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
  updateDoc, // <-- ¡NUEVO! Para actualizar contadores
  increment, // <-- ¡NUEVO!
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

  // --- RENDERIZADO DE LA PLANTILLA ---
  // Pasamos la inicial del usuario para la caja de "Añadir comentario"
  pageContainer.innerHTML = VideoPageTemplate(videoData, userInitial);

  // --- INICIALIZACIÓN DE SECCIONES ---
  setupVideoActions(pageContainer, user, videoId, videoData.channel);
  // Pasamos la inicial del usuario para las cajas de "Respuesta"
  setupCommentSection(pageContainer, user, videoId, userInitial);
  setupRelatedVideos(pageContainer, videoId);

  return pageContainer;
}

// ===================================================================
// --- FUNCIÓN PARA LÓGICA DE LIKE/SUSCRIBIRSE AL VIDEO ---
// (Esta función no tiene cambios)
// ===================================================================
async function setupVideoActions(pageContainer, user, videoId, channelName) {
  // ... (toda tu lógica de likes/dislikes/suscripción del video va aquí)
}

// ===================================================================
// --- FUNCIÓN PARA CARGAR VIDEOS RELACIONADOS ---
// (Esta función no tiene cambios)
// ===================================================================
async function setupRelatedVideos(pageContainer, videoId) {
  // ... (toda tu lógica de videos relacionados va aquí)
}

// ===================================================================
// --- ¡NUEVA SECCIÓN DE LÓGICA DE COMENTARIOS (ACTUALIZADA)! ---
// ===================================================================
async function setupCommentSection(pageContainer, user, videoId, userInitial) {
  const commentInput = pageContainer.querySelector("#comment-input");
  const addCommentButton = pageContainer.querySelector("#add-comment-button");
  const commentsContainer = pageContainer.querySelector("#comments-container");
  const sortNewestBtn = pageContainer.querySelector("#sort-by-newest");
  const sortTopBtn = pageContainer.querySelector("#sort-by-top");

  const userId = user ? user.uid : null;
  const userEmail = user ? user.email : null;
  let currentSort = "createdAt"; // Estado para saber el orden

  // Habilitar/Deshabilitar el botón de comentar
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

  // --- FUNCIÓN PARA PUBLICAR UN COMENTARIO (Padre o Respuesta) ---
  async function postComment(text, parentId = null) {
    if (!userId) return;

    try {
      // 1. Añadimos el nuevo comentario
      await addDoc(collection(db, "comments"), {
        videoId: videoId,
        userId: userId,
        userEmail: userEmail,
        text: text,
        parentId: parentId, // <-- Será 'null' para padres, o un ID para respuestas
        createdAt: serverTimestamp(),
        likeCount: 0,
        dislikeCount: 0,
        replyCount: 0, // Las respuestas siempre empiezan con 0
      });

      // 2. Si es una respuesta, actualizamos el contador del padre
      if (parentId) {
        const parentRef = doc(db, "comments", parentId);
        await updateDoc(parentRef, {
          replyCount: increment(1),
        });
        // Forzar la recarga de las respuestas para ese comentario
        const repliesContainer = commentsContainer.querySelector(
          `.replies-container[data-parent-id="${parentId}"]`
        );
        if (repliesContainer)
          await fetchAndShowReplies(parentId, repliesContainer);
      } else {
        // 3. Si es un comentario padre, recargamos la lista principal
        fetchComments(currentSort);
      }
    } catch (error) {
      console.error("Error al añadir comentario:", error);
    }
  }

  // --- Event Listener para el botón principal de Comentar ---
  addCommentButton.addEventListener("click", async () => {
    if (addCommentButton.classList.contains("enabled")) {
      await postComment(commentInput.value, null);
      commentInput.value = "";
      addCommentButton.classList.remove("enabled");
    }
  });

  // --- FUNCIÓN PARA CARGAR COMENTARIOS "PADRE" ---
  async function fetchComments(orderByField) {
    currentSort = orderByField; // Guardar el estado del orden
    commentsContainer.innerHTML = "Cargando comentarios...";

    // 1. Consulta solo por comentarios "padre" (parentId == null)
    const q = query(
      collection(db, "comments"),
      where("videoId", "==", videoId),
      where("parentId", "==", null), // <-- ¡CLAVE!
      orderBy(orderByField, "desc")
    );

    const querySnapshot = await getDocs(q);
    commentsContainer.innerHTML = ""; // Limpiamos el "Cargando..."

    if (querySnapshot.empty) {
      commentsContainer.innerHTML =
        "<p>Aún no hay comentarios. ¡Sé el primero!</p>";
      return;
    }

    // 3. Renderizamos cada comentario padre
    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      const commentId = doc.id;
      // Pasamos 'isReply = false'
      const commentElement = renderComment(commentData, commentId, false);
      commentsContainer.appendChild(commentElement);
    });
  }

  // --- FUNCIÓN PARA "PINTAR" UN SOLO COMENTARIO (Padre o Respuesta) ---
  function renderComment(commentData, commentId, isReply) {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-thread");

    const authorInitial = commentData.userEmail
      ? commentData.userEmail.charAt(0).toUpperCase()
      : "?";
    const authorName = commentData.userEmail.split("@")[0];

    // ¡HTML actualizado para incluir contenedores de respuesta!
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
            ? `
          <button class="view-replies-btn" data-id="${commentId}">
            Ver ${commentData.replyCount} respuestas
          </button>
        `
            : ""
        }
        <div class="replies-container" data-parent-id="${commentId}"></div>

      </div>
    `;

    // --- Lógica de "Leer más" (sin cambios) ---
    const textElement = commentDiv.querySelector(".comment-text");
    const detailsContainer = commentDiv.querySelector(".comment-details");
    // ... (copia y pega tu lógica de "Leer más" / "Mostrar menos" aquí)

    return commentDiv;
  }

  // --- FUNCIÓN PARA MOSTRAR LA CAJA DE RESPUESTA ---
  function showReplyInput(parentId, container) {
    // Si ya hay una caja de respuesta, la borramos para evitar duplicados
    const existingBox = container.querySelector(".add-reply-box");
    if (existingBox) {
      existingBox.remove();
      return; // Cierra la caja si se vuelve a hacer clic
    }

    const replyBox = document.createElement("div");
    replyBox.classList.add("add-reply-box");
    replyBox.innerHTML = `
      <div class="comment-avatar">${userInitial}</div>
      <textarea placeholder="Añade una respuesta..."></textarea>
      <button>Responder</button>
    `;

    // Lógica del botón de respuesta
    const replyButton = replyBox.querySelector("button");
    const replyText = replyBox.querySelector("textarea");

    replyButton.addEventListener("click", async () => {
      const text = replyText.value;
      if (text.trim().length > 0) {
        await postComment(text, parentId);
        replyBox.remove(); // Opcional: ocultar la caja después de responder
      }
    });

    container.appendChild(replyBox);
  }

  // --- FUNCIÓN PARA CARGAR Y MOSTRAR RESPUESTAS ---
  async function fetchAndShowReplies(parentId, container) {
    if (container.children.length > 0) {
      // Si ya hay respuestas, las ocultamos
      container.innerHTML = "";
      return;
    }

    const q = query(
      collection(db, "comments"),
      where("parentId", "==", parentId),
      orderBy("createdAt", "asc") // Las respuestas se ordenan de más antigua a más nueva
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>Error: No se encontraron respuestas.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      // Renderizamos la respuesta usando la misma función,
      // pero marcándola como 'isReply = true'
      const replyElement = renderComment(doc.data(), doc.id, true);
      container.appendChild(replyElement);
    });
  }

  // --- LÓGICA DE ORDENAR (sin cambios) ---
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

  // --- DELEGACIÓN DE EVENTOS (ACTUALIZADA) ---
  commentsContainer.addEventListener("click", async (e) => {
    // 1. Lógica de "Responder"
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

    // 2. Lógica de "Ver Respuestas"
    const viewRepliesBtn = e.target.closest(".view-replies-btn");
    if (viewRepliesBtn) {
      const commentId = viewRepliesBtn.dataset.id;
      const repliesContainer = e.target
        .closest(".comment-details")
        .querySelector(".replies-container");
      await fetchAndShowReplies(commentId, repliesContainer);
      // Alternar texto
      const currentText = viewRepliesBtn.textContent.trim();
      viewRepliesBtn.textContent = currentText.startsWith("Ver")
        ? "Ocultar respuestas"
        : `Ver ${currentText.split(" ")[1]} respuestas`;
    }

    // 3. Lógica de "Like/Dislike de Comentario" (sin cambios)
    const likeBtn = e.target.closest(".like-comment-btn");
    const dislikeBtn = e.target.closest(".dislike-comment-btn");
    if (likeBtn || dislikeBtn) {
      if (!userId) {
        alert("Debes iniciar sesión para valorar comentarios.");
        return;
      }
      // ... (tu lógica de like/dislike de comentarios va aquí)
    }
  });

  // --- Carga inicial de comentarios ---
  fetchComments("createdAt");
}
