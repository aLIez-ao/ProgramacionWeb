// Importamos el CSS específico de este componente
import "../styles/header.css";

// Exportamos una función que crea el HTML del Header
export function Header() {
  // Creamos el elemento <header>
  const headerEl = document.createElement("header");
  headerEl.classList.add("header"); // Le añadimos su clase CSS

  // Usamos innerHTML para definir su contenido.
  // Esto es mucho más legible que crear cada div con createElement.
  headerEl.innerHTML = `
    <div class="header-left">
        <i class="fas fa-bars menu-icon"></i>
        <a href="#" class="logo">
            <i class="fab fa-youtube"></i>
            <span>Mi Web</span>
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
    
    <div class="header-right">
        <i class="fas fa-video"></i>
        <i class="fas fa-bell"></i>
        <div class="user-avatar">M</div>
    </div>
  `;

  // Devolvemos el elemento del DOM listo para ser insertado
  return headerEl;
}
