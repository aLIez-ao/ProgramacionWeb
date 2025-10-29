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
    ".action-buttons button:nth-child(1)"
  );
  const subscribeButton = pageContainer.querySelector(".subscribe-button");

  const userId = user ? user.uid : null; // Obtenemos el ID del usuario (o null)
  const channelName = videoData.channel; // Usamos el nombre del canal como su ID (para este demo)

  // 4. Funciones para actualizar el estilo de los botones
  function updateLikeButton(liked) {
    if (liked) {
      likeButton.classList.add("active");
    } else {
      likeButton.classList.remove("active");
    }
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

  // 5. Comprobar el estado inicial (solo si el usuario está logueado)
  if (userId) {
    // Definimos los IDs únicos para nuestros documentos de "relación"
    const likeId = `${userId}_${videoId}`;
    const subId = `${userId}_${channelName}`;

    // Creamos las referencias a esos documentos
    const likeRef = doc(db, "likes", likeId);
    const subRef = doc(db, "subscriptions", subId);

    // Comprobamos si ya existen
    const likeSnap = await getDoc(likeRef);
    const subSnap = await getDoc(subRef);

    let isLiked = likeSnap.exists();
    let isSubscribed = subSnap.exists();

    // Actualizamos la UI con el estado inicial
    updateLikeButton(isLiked);
    updateSubscribeButton(isSubscribed);

    // 6. AÑADIR LOS EVENT LISTENERS

    // --- Lógica de Like/Unlike ---
    likeButton.addEventListener("click", async () => {
      isLiked = !isLiked; // Invertir el estado
      updateLikeButton(isLiked); // Actualizar UI

      if (isLiked) {
        // Si ahora está likeado, crea el documento
        await setDoc(likeRef, {
          userId: userId,
          videoId: videoId,
          likedAt: serverTimestamp(),
        });
      } else {
        // Si ya no está likeado, borra el documento
        await deleteDoc(likeRef);
      }
    });

    // --- Lógica de Suscribir/Desuscribir ---
    subscribeButton.addEventListener("click", async () => {
      isSubscribed = !isSubscribed; // Invertir estado
      updateSubscribeButton(isSubscribed); // Actualizar UI

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
    // Si no hay usuario, al hacer clic solo mostramos una alerta
    const authRequired = () => alert("Debes iniciar sesión para hacer esto.");
    likeButton.addEventListener("click", authRequired);
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
