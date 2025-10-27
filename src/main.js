// Importar el estilo global
import "./style.css";

// Importar los componentes principales de la UI
import { Header } from "./components/Header.js";
import { Sidebar } from "./components/Sidebar.js";

// Importar la página que queremos mostrar
import { HomePage } from "./pages/Home.js";

// Importar herramientas de Firebase
import { auth } from "./services/firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

// Modificar la función 'renderApp' para que Acepte un 'user'
function renderApp(user) {
  const appElement = document.getElementById("app");
  if (!appElement) return; // Salir si no se encuentra el div

  // Limpiamos el HTML para evitar duplicados si el estado cambia
  appElement.innerHTML = "";

  //  el 'user' (o 'null') al Header
  const header = Header(user);
  appElement.appendChild(header);

  const mainLayout = document.createElement("div");
  mainLayout.classList.add("main-layout");

  const sidebar = Sidebar();
  mainLayout.appendChild(sidebar);

  const contentArea = document.createElement("main");
  contentArea.classList.add("content-area");

  const homePageContent = HomePage();
  contentArea.appendChild(homePageContent);

  mainLayout.appendChild(contentArea);
  appElement.appendChild(mainLayout);
}

// onAuthStateChanged decide ejecutar renderApp()
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario está CONECTADO
    console.log("Usuario conectado:", user.email);
    renderApp(user); // Dibujamos la app en modo "conectado"
  } else {
    // Usuario está DESCONECTADO
    console.log("No hay usuario conectado.");
    renderApp(null); // Dibujamos la app en modo "desconectado"
  }
});
