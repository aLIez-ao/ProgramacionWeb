import { VideoCard } from "../components/VideoCard.js";
import { VideoPageTemplate } from "./VideoPage.template.js";
import "../styles/videoPage.css";
// 1. Importar la DB y todas las funciones que necesitamos
import { db } from "../services/firebaseConfig.js";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";

// 2. La función ahora ACEPTA el objeto 'user'
export async function VideoPage(user) {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("v");

  const pageContainer = document.createElement("div");
  pageContainer.classList.add("watch-layout");

  // --- OBTENER DATOS DEL VIDEO (sin cambios) ---
  const videoRef = doc(db, "videos", videoId);
  const videoSnap = await getDoc(videoRef);

  if (!videoSnap.exists()) {
    pageContainer.innerHTML = "<h1>Video no encontrado (404)</h1>";
    return pageContainer;
  }
  const videoData = videoSnap.data();

  // --- CONSTRUIR LA VISTA (sin cambios) ---
  pageContainer.innerHTML = VideoPageTemplate(videoData);

  // --- LÓGICA DE LIKES Y SUSCRIPCIONES ---

  // 3. Obtener los elementos de los botones
  const likeButton = pageContainer.querySelector(
    ".action-buttons button:nth-child(1)" // Botón de Like
  );
  // ¡NUEVO! Seleccionamos el botón de dislike
  const dislikeButton = pageContainer.querySelector(
    ".action-buttons button:nth-child(2)" // Botón de Dislike
  );
  const subscribeButton = pageContainer.querySelector(".subscribe-button");

  const userId = user ? user.uid : null;
  const channelName = videoData.channel;

  // 4. Funciones para actualizar el estilo de los botones
  function updateLikeButton(liked) {
    if (liked) {
      likeButton.classList.add("active");
    } else {
      likeButton.classList.remove("active");
    }
  }

  // ¡NUEVO! Función para el botón de dislike
  function updateDislikeButton(disliked) {
    if (disliked) {
      dislikeButton.classList.add("active");
    } else {
      dislikeButton.classList.remove("active");
    }
  }

  function updateSubscribeButton(subscribed) {
    // ... (esta función no cambia)
    if (subscribed) {
      subscribeButton.classList.add("subscribed");
      subscribeButton.textContent = "Suscrito";
    } else {
      subscribeButton.classList.remove("subscribed");
      subscribeButton.textContent = "Suscribirse";
    }
  }

  // 5. Comprobar el estado inicial (solo si el usuario está logueado)
  if (userId) {
    // ID único para la relación usuario-video
    const userVideoId = `${userId}_${videoId}`;
    const subId = `${userId}_${channelName}`;

    // Referencias a los documentos de like Y dislike
    const likeRef = doc(db, "likes", userVideoId);
    const dislikeRef = doc(db, "dislikes", userVideoId); // ¡NUEVO!
    const subRef = doc(db, "subscriptions", subId);

    // Comprobamos si ya existen
    const likeSnap = await getDoc(likeRef);
    const dislikeSnap = await getDoc(dislikeRef); // ¡NUEVO!
    const subSnap = await getDoc(subRef);

    let isLiked = likeSnap.exists();
    let isDisliked = dislikeSnap.exists(); // ¡NUEVO!
    let isSubscribed = subSnap.exists();

    // Actualizamos la UI con el estado inicial
    updateLikeButton(isLiked);
    updateDislikeButton(isDisliked); // ¡NUEVO!
    updateSubscribeButton(isSubscribed);

    // 6. AÑADIR LOS EVENT LISTENERS

    // --- Lógica de Like (Modificada para ser excluyente) ---
    likeButton.addEventListener("click", async () => {
      if (isLiked) {
        // --- El usuario está quitando su Like ---
        isLiked = false;
        await deleteDoc(likeRef);
      } else {
        // --- El usuario está dando Like ---
        isLiked = true;
        await setDoc(likeRef, {
          userId: userId,
          videoId: videoId,
          likedAt: serverTimestamp(),
        });

        // ¡NUEVO! Si tenía dislike, se lo quitamos
        if (isDisliked) {
          isDisliked = false;
          await deleteDoc(dislikeRef);
          updateDislikeButton(false); // Actualiza la UI del dislike
        }
      }
      updateLikeButton(isLiked); // Actualiza la UI del like
    });

    // --- ¡NUEVO! Lógica de Dislike ---
    dislikeButton.addEventListener("click", async () => {
      if (isDisliked) {
        // --- El usuario está quitando su Dislike ---
        isDisliked = false;
        await deleteDoc(dislikeRef);
      } else {
        // --- El usuario está dando Dislike ---
        isDisliked = true;
        await setDoc(dislikeRef, {
          userId: userId,
          videoId: videoId,
          dislikedAt: serverTimestamp(),
        });

        // ¡NUEVO! Si tenía like, se lo quitamos
        if (isLiked) {
          isLiked = false;
          await deleteDoc(likeRef);
          updateLikeButton(false); // Actualiza la UI del like
        }
      }
      updateDislikeButton(isDisliked); // Actualiza la UI del dislike
    });

    // --- Lógica de Suscribir (sin cambios) ---
    subscribeButton.addEventListener("click", async () => {
      isSubscribed = !isSubscribed;
      updateSubscribeButton(isSubscribed);

      if (isSubscribed) {
        await setDoc(subRef, {
          userId: userId,
          channelName: channelName,
          subscribedAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(subRef);
      }
    });
  } else {
    // Si no hay usuario, mostramos alerta
    const authRequired = () => alert("Debes iniciar sesión para hacer esto.");
    likeButton.addEventListener("click", authRequired);
    dislikeButton.addEventListener("click", authRequired); // ¡NUEVO!
    subscribeButton.addEventListener("click", authRequired);
  }

  // --- LÓGICA DE VIDEOS RELACIONADOS (sin cambios) ---
  const relatedVideosList = pageContainer.querySelector(".secondary-column");
  const videosCollection = collection(db, "videos");
  const videosSnapshot = await getDocs(videosCollection);

  videosSnapshot.forEach((doc) => {
    const relatedVideoData = doc.data();
    if (relatedVideoData.id !== videoId) {
      relatedVideosList.appendChild(VideoCard(relatedVideoData));
    }
  });

  return pageContainer;
}
