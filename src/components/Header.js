// Importamos el CSS específico de este componente
import "../styles/header.css";

// Importar herramientas de Firebase para salir
import { auth } from "../services/firebaseConfig.js";
import { signOut } from "firebase/auth";

// Obtenemos la variable que definimos en vite.config.js
const siteName = import.meta.env.SITE_NAME;

// La función ahora acepta el objeto 'user'
export function Header(user) {
  const headerEl = document.createElement("header");
  headerEl.classList.add("header");

  // Lógica para cambiar el HTML de la derecha
  let authHtml;
  if (user) {
    // --- USUARIO CONECTADO ---
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
    // --- USUARIO DESCONECTADO ---
    authHtml = `
      <a href="/views/login.html" class="auth-button">
          <i class="fas fa-user-circle"></i>
          <span>Acceder</span>
      </a>
    `;
  }

  // Insertamos el HTML en la plantilla principal
  headerEl.innerHTML = `
    <div class="header-left">
        <i class="fas fa-bars menu-icon"></i>
        <a href="/" class="logo"> <i class="fab fa-youtube"></i>
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
        ${authHtml} </div>
  `;

  // --- LÓGICA DE JAVASCRIPT ---
  // (Esto solo se ejecuta si el usuario está conectado)
  if (user) {
    // Encontrar los elementos que acabamos de crear
    const avatarButton = headerEl.querySelector(".user-avatar");
    const dropdown = headerEl.querySelector("#user-dropdown");
    const logoutButton = headerEl.querySelector("#dropdown-logout-button");

    // Lógica para ABRIR/CERRAR el menú
    avatarButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que el clic se propague al 'document'
      dropdown.classList.toggle("show");
    });

    // Lógica para CERRAR SESIÓN (botón dentro del menú)
    logoutButton.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          console.log("Usuario desconectado.");
        })
        .catch((error) => {
          console.error("Error al salir:", error);
        });
    });
  }

  // Cerrar el menú si se hace clic en cualquier otro lado
  document.addEventListener("click", (e) => {
    const dropdown = headerEl.querySelector("#user-dropdown");
    if (
      dropdown &&
      dropdown.classList.contains("show") &&
      !dropdown.contains(e.target)
    ) {
      dropdown.classList.remove("show");
    }
  });

  return headerEl;
}
