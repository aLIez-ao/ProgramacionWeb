import { auth } from "../services/firebaseConfig.js";
import { sendPasswordResetEmail } from "firebase/auth";

const form = document.querySelector("form");
const emailInput = form.querySelector('input[type="email"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value;

  try {
    // ¡Esta es la función mágica!
    await sendPasswordResetEmail(auth, email);

    alert(
      "¡Email enviado! Revisa tu bandeja de entrada para restablecer tu contraseña."
    );
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error al enviar email:", error.message);
    alert("Error: " + error.message);
  }
});
