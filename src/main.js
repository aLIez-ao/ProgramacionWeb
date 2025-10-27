import "./style.css";
import { Header } from "./components/Header.js";
import { Sidebar } from "./components/Sidebar.js";
import { HomePage } from "./pages/Home.js";
import { VideoPage } from "./pages/VideoPage.js"; // <-- 1. Importar la nueva página
import { auth } from "./services/firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

const appElement = document.getElementById("app");
let contentArea; // Variable global para el router

// --- Función Router ---

// Decide qué página mostrar en .content-area
function router() {
  if (!contentArea) return; // Si el layout no se ha pintado, salir

  const path = window.location.pathname; // Obtiene la URL (ej. "/", "/watch")

  contentArea.innerHTML = ""; // Limpia el contenido anterior

  if (path === "/") contentArea.appendChild(HomePage());
  else if (path === "/watch") contentArea.appendChild(VideoPage());
  else contentArea.innerHTML = "<h1>404 - Página no encontrada</h1>";
}

// --- Renderizado de la App (Partes Estáticas) ---

// Pinta el Header y la Sidebar una vez.
function renderStaticApp(user) {
  appElement.innerHTML = ""; // Limpiar todo

  // Renderizar Header (pasándole el usuario)
  appElement.appendChild(Header(user));

  // Renderizar el layout principal
  const mainLayout = document.createElement("div");
  mainLayout.classList.add("main-layout");

  // Pintar Sidebar
  mainLayout.appendChild(Sidebar());

  // Crear el contenedor de contenido (pero no llenarlo)
  contentArea = document.createElement("main");
  contentArea.classList.add("content-area");
  mainLayout.appendChild(contentArea);

  appElement.appendChild(mainLayout);

  // LLAMAR AL ROUTER por primera vez
  router();
}

// --- Interceptor de Clics (La Magia del SPA) ---

// Esto escucha TODOS los clics en la página
document.body.addEventListener("click", (e) => {
  // Busca si el clic (o su elemento padre) fue en un enlace <a>
  const link = e.target.closest("a");

  // Si no fue un link, O si es un link externo (http), un link a nuestras vistas de auth...
  // ...no hacemos nada y dejamos que el navegador actúe.
  if (
    !link ||
    link.href.startsWith("http") ||
    link.pathname.startsWith("/views/")
  )
    return;

  // SI LLEGAMOS AQUÍ, es un enlace interno de la App (como / o /watch)
  // Prevenimos la recarga de la página
  e.preventDefault();

  // Cambiamos la URL en la barra de direcciones
  history.pushState(null, "", link.href);

  // Llamamos al router para que cargue el nuevo contenido
  router();
});

// --- Puntos de Entrada ---

// Escuchar cambios de autenticación
onAuthStateChanged(auth, (user) => {
  // Pinta la app estática (Header/Sidebar)
  renderStaticApp(user);
});

// Escuchar los botones "Atrás" y "Adelante" del navegador
window.addEventListener("popstate", router);
