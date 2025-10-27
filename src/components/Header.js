// Importamos el CSS
import "../styles/header.css";

// Importar herramientas de Firebase
import { auth } from "../services/firebaseConfig.js";
import { signOut } from "firebase/auth";

// Obtenemos la variable de entorno
const siteName = import.meta.env.SITE_NAME;

export function Header(user) {
  const headerEl = document.createElement("header");
  headerEl.classList.add("header");

  // Lógica para HTML de autenticación (sin cambios)
  let authHtml;
  if (user) {
    const userInitial = user.email.charAt(0).toUpperCase();
    authHtml = `
      <i class="fas fa-video" title="Subir video"></i>
      <i class="fas fa-bell" title="Notificaciones"></i>
      <div class="user-menu-container">
        <div class="user-avatar" title="${user.email}">${userInitial}</div>
        <div id="user-dropdown" class="user-dropdown">
          <div class="dropdown-header">
            <span class="dropdown-header-email">${user.email}</span>
          </div>
          <button id="dropdown-logout-button">
            <i class="fas fa-sign-out-alt"></i>
            <span>Salir</span>
          </button>
        </div>
      </div>
    `;
  } else {
    authHtml = `
      <a href="/views/login.html" class="auth-button">
          <i class="fas fa-user-circle"></i>
          <span>Acceder</span>
      </a>
    `;
  }

  // Plantilla HTML (sin cambios)
  headerEl.innerHTML = `
    <div class="header-left">
        <i class="fas fa-bars menu-icon"></i> <a href="/" class="logo"> <i class="fab fa-youtube"></i>
            <span>${siteName}</span>
        </a>
    </div>
    <div class="header-center">
        </div>
    <div class="header-right auth-section">
        ${authHtml}
    </div>
  `;

  // --- LÓGICA DE JAVASCRIPT ---

  // 1. Lógica del menú desplegable (sin cambios)
  if (user) {
    const avatarButton = headerEl.querySelector(".user-avatar");
    const dropdown = headerEl.querySelector("#user-dropdown");
    const logoutButton = headerEl.querySelector("#dropdown-logout-button");

    avatarButton.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });

    logoutButton.addEventListener("click", () => {
      signOut(auth);
    });
  }

  // 2. ¡NUEVA LÓGICA! Para minimizar la barra lateral
  const menuIcon = headerEl.querySelector(".menu-icon");
  menuIcon.addEventListener("click", () => {
    // Añade o quita la clase 'sidebar-minimized' del <body>
    document.body.classList.toggle("sidebar-minimized");
  });

  return headerEl;
}
