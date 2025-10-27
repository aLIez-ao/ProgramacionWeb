import "./style.css";
import { Header } from "./components/Header.js";
import { Sidebar } from "./components/Sidebar.js";
import { HomePage } from "./pages/Home.js";
import { VideoPage } from "./pages/VideoPage.js";
import { auth } from "./services/firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

const appElement = document.getElementById("app");
let contentArea;

// --- Función Router ---
function router() {
  if (!contentArea) return;

  // Limpiar clases de estado anteriores
  document.body.classList.remove(
    "page-home",
    "page-watch",
    "sidebar-open-overlay"
  );

  const path = window.location.pathname;
  contentArea.innerHTML = "";

  if (path === "/") {
    document.body.classList.add("page-home"); // <-- CLASE DE PÁGINA
    contentArea.appendChild(HomePage());
  } else if (path === "/watch") {
    document.body.classList.add("page-watch"); // <-- CLASE DE PÁGINA
    contentArea.appendChild(VideoPage());
  } else {
    contentArea.innerHTML = "<h1>404 - Página no encontrada</h1>";
  }
}

// --- Renderizado de la App (Partes Estáticas) ---
function renderStaticApp(user) {
  appElement.innerHTML = "";

  // 1. Renderizar Header (pasándole el usuario)
  appElement.appendChild(Header(user));

  // 2. ¡CAMBIO! Renderizar Sidebar como hija directa de #app
  appElement.appendChild(Sidebar());

  // 3. Renderizar el layout principal (AHORA SIN LA SIDEBAR)
  const mainLayout = document.createElement("div");
  mainLayout.classList.add("main-layout");

  contentArea = document.createElement("main");
  contentArea.classList.add("content-area");
  mainLayout.appendChild(contentArea);
  appElement.appendChild(mainLayout);

  // 4. ¡NUEVO! Añadir el overlay para el modo "watch"
  const overlay = document.createElement("div");
  overlay.classList.add("page-overlay");
  // Añadirle un clic para que cierre el menú
  overlay.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open-overlay");
  });
  appElement.appendChild(overlay);

  // 5. LLAMAR AL ROUTER por primera vez
  router();
}

// --- Interceptor de Clics (Sin cambios) ---
document.body.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (
    !link ||
    link.href.startsWith("http") ||
    link.pathname.startsWith("/views/")
  ) {
    return;
  }
  e.preventDefault();
  history.pushState(null, "", link.href);
  router();
});

// --- Puntos de Entrada (Sin cambios) ---
onAuthStateChanged(auth, (user) => {
  renderStaticApp(user);
});
window.addEventListener("popstate", router);
