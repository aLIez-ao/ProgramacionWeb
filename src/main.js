import "./style.css";
import { Header } from "./components/Header.js";
import { Sidebar } from "./components/Sidebar.js";
import { HomePage } from "./pages/Home.js";
import { VideoPage } from "./pages/VideoPage.js";
import { auth } from "./services/firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

const appElement = document.getElementById("app");
let contentArea;
let currentUser = null;

// --- Función Router ---
async function router() {
  if (!contentArea) return;

  document.body.classList.remove(
    "page-home",
    "page-watch",
    "sidebar-open-overlay"
  );

  const path = window.location.pathname;
  contentArea.innerHTML = "";

  if (path === "/") {
    document.body.classList.add("page-home");
    contentArea.appendChild(await HomePage());
  } else if (path === "/watch") {
    document.body.classList.add("page-watch");
    contentArea.appendChild(await VideoPage(currentUser));
  } else {
    contentArea.innerHTML = "<h1>404 - Página no encontrada</h1>";
  }
}

// --- Renderizado de la App (Partes Estáticas) ---
function renderStaticApp(user) {
  appElement.innerHTML = "";
  appElement.appendChild(Header(user));
  appElement.appendChild(Sidebar());
  const mainLayout = document.createElement("div");
  mainLayout.classList.add("main-layout");
  contentArea = document.createElement("main");
  contentArea.classList.add("content-area");
  mainLayout.appendChild(contentArea);
  appElement.appendChild(mainLayout);
  const overlay = document.createElement("div");
  overlay.classList.add("page-overlay");
  overlay.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open-overlay");
  });
  appElement.appendChild(overlay);

  // router() se llama aquí y es la única vez que se debe llamar
  router();
}

// --- Interceptor de Clics ---
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

// --- Puntos de Entrada ---
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  renderStaticApp(user);
});

window.addEventListener("popstate", router);
