import { auth } from "../services/firebaseConfig.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

// 1. Obtener los elementos del formulario
const form = document.querySelector("form");
const emailInput = form.querySelector('input[type="email"]');
const passwordInput = form.querySelector('input[type="password"]');

// 2. Añadir el "listener" para el evento 'submit'
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevenir que la página se recargue

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    // 3. Usar la función de Firebase para crear el usuario
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("¡Usuario registrado!", userCredential.user);
    alert("¡Registro exitoso! Ahora puedes iniciar sesión.");

    // 4. Redirigir al login
    window.location.href = "login.html";
  } catch (error) {
    // 5. Manejar errores
    console.error("Error en el registro:", error.message);
    alert("Error: " + error.message);
  }
});
