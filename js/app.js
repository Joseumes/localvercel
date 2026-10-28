
const authForm = document.getElementById("auth-form");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-description");
const nameField = document.getElementById("name-field");
const fullNameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("submit-button");
const togglePassword = document.getElementById("toggle-password");
const forgotWrapper = document.getElementById("forgot-wrapper");
const switchWrapper = document.getElementById("switch-wrapper");
const message = document.getElementById("message");
const dashboard = document.getElementById("dashboard");
const userEmail = document.getElementById("user-email");
const userName = document.getElementById("user-name");
const logoutButton = document.getElementById("logout-button");

let isBusy = false;

function showMessage(text, type = "info") {
  message.textContent = text;
  message.className = `message ${type}`;
  message.hidden = false;
}

function setBusy(busy) {
  isBusy = busy;
  submitButton.disabled = busy;
  submitButton.textContent = busy
    ? "Guardando..."
    : "Guardar registro";
}

function showForm() {
  authForm.hidden = false;
  dashboard.hidden = true;

  if (switchWrapper) switchWrapper.hidden = true;
  if (forgotWrapper) forgotWrapper.hidden = true;

  if (nameField) nameField.hidden = false;
  if (fullNameInput) fullNameInput.required = true;

  if (passwordInput) {
    passwordInput.required = false;
    passwordInput.disabled = true;
    passwordInput.value = "";
  }

  if (togglePassword) togglePassword.hidden = true;

  if (formTitle) formTitle.textContent = "Registro de prueba";

  if (formDescription) {
    formDescription.textContent =
      "Ingresa tu nombre y correo electrónico.";
  }

  if (submitButton) submitButton.textContent = "Guardar registro";
}

function showSavedRecord(nombre, correo) {
  authForm.hidden = true;
  dashboard.hidden = false;
  message.hidden = true;

  if (userName) userName.textContent = nombre;
  if (userEmail) userEmail.textContent = correo;

  if (logoutButton) {
    logoutButton.textContent = "Registrar otra persona";
    logoutButton.disabled = false;
  }
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isBusy) return;

  const nombre = fullNameInput.value.trim();
  const correo = emailInput.value.trim().toLowerCase();

  if (!nombre) {
    showMessage("Escribe tu nombre.", "error");
    fullNameInput.focus();
    return;
  }

  if (!correo || !emailInput.validity.valid) {
    showMessage("Escribe un correo electrónico válido.", "error");
    emailInput.focus();
    return;
  }

  if (nombre.length > 150 || correo.length > 254) {
    showMessage("El nombre o el correo son demasiado largos.", "error");
    return;
  }

  setBusy(true);
  showMessage("Guardando el registro...", "info");

  try {
    const { data, error } = await supabaseClient
      .from("usuarios_prueba")
      .insert([
        {
          nombre: nombre,
          correo: correo
        }
      ])
      .select("id, nombre, correo")
      .single();

    if (error) {
      console.error("Error de Supabase:", error);

      if (error.code === "42501") {
        throw new Error(
          "No hay permisos para guardar. Revisa la política RLS de la tabla."
        );
      }

      throw new Error(
        error.message || "No se pudo guardar el registro."
      );
    }

    showSavedRecord(data.nombre, data.correo);

  } catch (error) {
    console.error("Error al guardar:", error);

    showMessage(
      error.message || "No se pudo guardar el registro. Inténtalo de nuevo.",
      "error"
    );
  } finally {
    setBusy(false);
  }
});

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    authForm.reset();

    if (passwordInput) {
      passwordInput.value = "";
    }

    showForm();

    if (message) {
      message.hidden = false;
      message.textContent = "";
      message.className = "message";
    }

    fullNameInput.focus();
  });
}

showForm();
