// ELEMENTOS DEL DOM
const form = document.querySelector("form");
const correo = document.querySelector('input[name="correo"]');
const password = document.querySelector('input[name="password"]');

/* VALIDAR CORREO */
function validarCorreo() {
  const valor = correo.value.trim();

  if (valor.length < 5 || !valor.includes("@")) {
    correo.classList.add("is-invalid");
    return false;
  }

  correo.classList.remove("is-invalid");
  correo.classList.add("is-valid");

  return true;
}

/* VALIDAR PASSWORD */
function validarPassword() {
  const valor = password.value.trim();

  if (valor.length < 5) {
    password.classList.add("is-invalid");
    return false;
  }

  password.classList.remove("is-invalid");
  password.classList.add("is-valid");

  return true;
}

/* VALIDAR AL SALIR DEL INPUT */
correo.addEventListener("blur", validarCorreo);
password.addEventListener("blur", validarPassword);

/* VALIDAR FORMULARIO */
form.addEventListener("submit", function (e) {
  const correoValido = validarCorreo();
  const passwordValido = validarPassword();

  if (!correoValido || !passwordValido) {
    e.preventDefault();

    console.log("Formulario inválido");
  }
});
