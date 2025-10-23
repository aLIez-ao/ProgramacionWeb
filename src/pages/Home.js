import { VideoCard } from "../components/VideoCard.js";

// 1. Datos de ejemplo (simulando una llamada a la API)
const mockVideos = [
  {
    title: "Este es el Título de un Video Muy Interesante",
    channel: "Nombre del Canal",
    views: "1.2 M de vistas",
    uploaded: "hace 3 días",
    duration: "12:30",
  },
  {
    title: "Unboxing del Nuevo Gadget 2025 que te Sorprenderá",
    channel: "TechReviews",
    views: "300K de vistas",
    uploaded: "hace 1 semana",
    duration: "08:15",
  },
  {
    title: "Aprendiendo a Cocinar: Receta Fácil",
    channel: "Cocina Rápida",
    views: "50K de vistas",
    uploaded: "hace 12 horas",
    duration: "22:05",
  },
  {
    title: "Tutorial de Programación: CSS Grid en 5 Minutos",
    channel: "DeveloperPro",
    views: "850K de vistas",
    uploaded: "hace 1 mes",
    duration: "05:42",
  },
  {
    title: "Concierto en Vivo - Música Relajante para Estudiar",
    channel: "MusicStream",
    views: "4.5 M de vistas",
    uploaded: "hace 6 meses",
    duration: "1:15:30",
  },
  {
    title: "El Resumen de la Semana: Noticias",
    channel: "Noticias Hoy",
    views: "95K de vistas",
    uploaded: "hace 2 horas",
    duration: "09:22",
  },
];

// 2. La función de la página de Inicio
export function HomePage() {
  // Crea el contenedor principal de la rejilla
  const gridEl = document.createElement("div");
  gridEl.classList.add("video-grid");

  // 3. Itera sobre los datos y crea una tarjeta para cada video
  for (const video of mockVideos) {
    const videoCard = VideoCard(video); // Llama al componente
    gridEl.appendChild(videoCard); // Añade la tarjeta a la rejilla
  }

  // Devuelve la rejilla llena de videos
  return gridEl;
}
