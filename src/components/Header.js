// Importamos el CSS específico de este componente
import "../styles/header.css";

// Exportamos una función que crea el HTML del Header
export function Header() {
  const headerEl = document.createElement("header");
  headerEl.classList.add("header");

  headerEl.innerHTML = `
    <div class="header-left">
        <i class="fas fa-bars menu-icon"></i>
        <a href="/" class="logo"> <i class="fab fa-youtube"></i>
            <span>MiTubo</span>
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
        <a href="/views/login.html" class="auth-button">
            <i class="fas fa-user-circle"></i>
            <span>Acceder</span>
        </a>
    </div>
  `;

  return headerEl;
}
