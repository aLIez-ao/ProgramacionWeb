import { auth } from "../services/firebaseConfig.js";
import { signInWithEmailAndPassword } from "firebase/auth";

const form = document.querySelector("form");
const emailInput = form.querySelector('input[type="email"]');
const passwordInput = form.querySelector('input[type="password"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    // Usar la función de Firebase para iniciar sesión
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("¡Usuario autenticado!", userCredential.user);
    alert("¡Inicio de sesión exitoso!");

    // Redirigir a la página principal (index.html)
    window.location.href = "../index.html"; // Sube un nivel y va al index
  } catch (error) {
    console.error("Error en el inicio de sesión:", error.message);
    alert("Error: " + error.message);
  }
});
