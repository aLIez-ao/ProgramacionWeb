/**
 * Esta función revisa en qué página estamos
 * y decide si minimiza la sidebar o muestra el overlay.
 */
export function toggleSidebar() {
  if (document.body.classList.contains("page-watch")) {
    // Si estamos en la página de video, mostramos el overlay
    document.body.classList.toggle("sidebar-open-overlay");
  } else {
    // Si estamos en Home (o cualquier otra), minimizamos
    document.body.classList.toggle("sidebar-minimized");
  }
}
