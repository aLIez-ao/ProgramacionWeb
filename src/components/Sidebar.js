import "../styles/sidebar.css";

export function Sidebar() {
  const sidebarEl = document.createElement("aside");
  sidebarEl.classList.add("sidebar");

  sidebarEl.innerHTML = `
    <nav>
        <ul>
            <li>
                <a href="#" class="active">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="fas fa-bolt"></i>
                    <span>Shorts</span>
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="fas fa-play-circle"></i>
                    <span>Suscripciones</span>
                </a>
            </li>
        </ul>
        <hr>
        <ul>
            <li>
                <a href="#">
                    <i class="fas fa-folder"></i>
                    <span>Biblioteca</span>
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="fas fa-history"></i>
                    <span>Historial</span>
                </a>
            </li>
            <li>
                <a href="#">
                    <i class="fas fa-clock"></i>
                    <span>Ver más tarde</span>
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

  return sidebarEl;
}
