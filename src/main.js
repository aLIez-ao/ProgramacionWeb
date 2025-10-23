// 1. Importar el estilo global
import "./style.css";

// 2. Importar los componentes principales de la UI
import { Header } from "./components/Header.js";
import { Sidebar } from "./components/Sidebar.js";

// 3. Importar la página que queremos mostrar
import { HomePage } from "./pages/Home.js";

// 4. Función para "renderizar" la aplicación
function renderApp() {
  // Obtenemos el punto de anclaje del index.html
  const appElement = document.getElementById("app");
  if (!appElement) return; // Salir si no se encuentra el div

  // 5. Crear la estructura base
  // (Header va primero, luego el layout principal)
  const header = Header();
  appElement.appendChild(header);

  const mainLayout = document.createElement("div");
  mainLayout.classList.add("main-layout");

  const sidebar = Sidebar();
  mainLayout.appendChild(sidebar);

  // El 'content-area' albergará el contenido de nuestras páginas
  const contentArea = document.createElement("main");
  contentArea.classList.add("content-area");

  // 6. Renderizar la página de inicio
  const homePageContent = HomePage();
  contentArea.appendChild(homePageContent);

  mainLayout.appendChild(contentArea);
  appElement.appendChild(mainLayout);
}

// 7. Ejecutar la aplicación
renderApp();
