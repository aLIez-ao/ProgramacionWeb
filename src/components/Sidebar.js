import "../styles/sidebar.css";
import { toggleSidebar } from "../utils/sidebarToggle.js";

const siteName = import.meta.env.SITE_NAME;

export function Sidebar() {
  const sidebarEl = document.createElement("aside");
  sidebarEl.classList.add("sidebar");

  // --- HTML actualizado con cabecera interna y textos mini/full ---
  sidebarEl.innerHTML = `
    <div class="sidebar-header">
      <i class="fas fa-bars menu-icon" id="sidebar-close-icon"></i>
      <a href="/" class="logo">
        <i class="fab fa-youtube"></i>
        <span>${siteName}</span>
      </a>
    </div>

    <nav>
      <ul>
        <li>
          <a href="#" class="active">
            <i class="fas fa-home"></i>
            <span class="text-full">Inicio</span>
            <span class="text-mini">Inicio</span>
          </a>
        </li>
        <li>
          <a href="#">
            <i class="fas fa-bolt"></i>
            <span class="text-full">Shorts</span>
            <span class="text-mini">Shorts</span>
          </a>
        </li>
        <li>
          <a href="#">
            <i class="fas fa-play-circle"></i>
            <span class="text-full">Suscripciones</span>
            <span class="text-mini">Suscripciones</span>
          </a>
        </li>
      </ul>
      <hr>
      <ul>
        <li>
          <a href="#">
            <i class="fas fa-folder"></i>
            <span class="text-full">Biblioteca</span>
            <span class="text-mini">Biblioteca</span>
          </a>
        </li>
        <li>
          <a href="#">
            <i class="fas fa-history"></i>
            <span class="text-full">Historial</span>
            <span class="text-mini">Historial</span>
          </a>
        </li>
        <li>
          <a href="#">
            <i class="fas fa-clock"></i>
            <span class="text-full">Ver más tarde</span>
            <span class="text-mini">Ver más tarde</span>
          </a>
        </li>
        <li>
          <a href="#">
            <i class="fas fa-thumbs-up"></i>
            <span class="text-full">Videos que me gustan</span>
            <span class="text-mini">Me gusta</span>
          </a>
        </li>
      </ul>
    </nav>
  `;

  // --- Lógica JS: conectar el botón de cerrar/minimizar ---
  const closeButton = sidebarEl.querySelector("#sidebar-close-icon");
  closeButton.addEventListener("click", () => {
    toggleSidebar(); // Centraliza la lógica de abrir/minimizar
  });

  return sidebarEl;
}
