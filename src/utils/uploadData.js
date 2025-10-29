import { db } from "../services/firebaseConfig.js";
import { doc, setDoc, collection } from "firebase/firestore";

const mockVideos = [
  {
    id: "abc12345",
    title: "Este es el Título de un Video Muy Interesante",
    channel: "Nombre del Canal",
    views: "1.2 M de vistas",
    uploaded: "hace 3 días",
    duration: "12:30",
  },
  {
    id: "def67890",
    title: "Unboxing del Nuevo Gadget 2025 que te Sorprenderá",
    channel: "TechReviews",
    views: "300K de vistas",
    uploaded: "hace 1 semana",
    duration: "08:15",
  },
  {
    id: "ghi12345",
    title: "Aprendiendo a Cocinar: Receta Fácil",
    channel: "Cocina Rápida",
    views: "50K de vistas",
    uploaded: "hace 12 horas",
    duration: "22:05",
  },
  {
    id: "jkl67890",
    title: "Tutorial de Programación: CSS Grid en 5 Minutos",
    channel: "DeveloperPro",
    views: "850K de vistas",
    uploaded: "hace 1 mes",
    duration: "05:42",
  },
  {
    id: "mno13579",
    title: "Concierto en Vivo - Música Relajante para Estudiar",
    channel: "MusicStream",
    views: "4.5 M de vistas",
    uploaded: "hace 6 meses",
    duration: "1:15:30",
  },
  {
    id: "pqr24680",
    title: "El Resumen de la Semana: Noticias",
    channel: "Noticias Hoy",
    views: "95K de vistas",
    uploaded: "hace 2 horas",
    duration: "09:22",
  },
];

// Esta función subirá los videos
async function uploadVideos() {
  console.log("Comenzando subida de videos...");
  const videosCollection = collection(db, "videos"); // "videos" es el nombre de la colección

  for (const video of mockVideos) {
    // Usamos el 'id' del video como el ID del documento
    const videoRef = doc(videosCollection, video.id);
    try {
      // Sube el objeto 'video' completo a Firestore
      await setDoc(videoRef, video);
      console.log(`Video ${video.id} subido con éxito.`);
    } catch (error) {
      console.error(`Error subiendo ${video.id}:`, error);
    }
  }
  console.log("¡Subida completada!");
}

// Exportamos la función para poder llamarla desde main.js
export { uploadVideos };
