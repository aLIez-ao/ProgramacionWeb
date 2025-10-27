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

  // Plantilla HTML
  headerEl.innerHTML = `
    <div class="header-left">
        <i class="fas fa-bars menu-icon"></i> <a href="/" class="logo"> <i class="fab fa-youtube"></i>
            <span>${siteName}</span>
        </a>
    </div>
    
    <div class="header-center">
        <form class="search-bar" action="#">
            <input type="text" placeholder="Buscar">
            <button type="submit">
                <i class="fas fa-search"></i>
            </button>
        </form>
    </div>

    <div class="header-right auth-section">
        ${authHtml}
    </div>
  `;

  // --- LÓGICA DE JAVASCRIPT ---

  //  Lógica del menú desplegable
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

  // Lógica para minimizar la barra lateral
  const menuIcon = headerEl.querySelector(".menu-icon");
  menuIcon.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-minimized");
  });

  return headerEl;
}
