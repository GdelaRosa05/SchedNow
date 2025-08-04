const inputs = document.querySelectorAll(".pin-container input")
const botones = document.querySelectorAll(".teclado button")
const btnConfirmar = document.getElementById("confirm")
let posicion = 0
let timeoutNotificacion = null

function mostrarNotificacion(tipo, mensaje) {
  const notificacion = document.getElementById("notificacion")

  // Íconos SVG según el tipo
  const iconos = {
    error: `
      <svg width="20px" height="20px" viewBox="0 0 512 512" fill="#962730" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(42.666667, 42.666667)">
          <path d="M213.333333,0C331.136,0,426.666667,95.5306667,426.666667,213.333333S331.136,426.666667,213.333333,426.666667,0,331.136,0,213.333333,95.5306667,0,213.333333,0Zm0,42.666667C119.232,42.666667,42.666667,119.232,42.666667,213.333333S119.232,384,213.333333,384,384,307.434667,384,213.333333,307.434667,42.666667,213.333333,42.666667Zm48.917334,91.584,30.165333,30.165333L243.498667,213.333333l48.917333,48.917334-30.165333,30.165333L213.333333,243.498667l-48.917333,48.917333-30.165333-30.165333L183.168,213.333333l-48.917333-48.917333,30.165333-30.165333L213.333333,183.168Z"/>
        </g>
      </svg>
    `,
    advertencia: `
      <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 15H12.01M12 12V9M4.98207 19H19.0179C20.5615 19 21.5233 17.3256 20.7455 15.9923L13.7276 3.96153C12.9558 2.63852 11.0442 2.63852 10.2724 3.96153L3.25452 15.9923C2.47675 17.3256 3.43849 19 4.98207 19Z"/>
      </svg>
    `,
    exito: `
      <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12C21 16.9706 16.9706 21 12 21 7.029 21 3 16.97 3 12 3 7.03 7.029 3 12 3c4.971 0 9 4.03 9 9Z"/>
        <path d="M9 12l1.683 1.683c.175.175.459.175.634 0L15 10"/>
      </svg>
    `,
  }

  notificacion.className = `notificacion ${tipo}`
  notificacion.innerHTML = `${iconos[tipo]} <span>${mensaje}</span>`

  if (timeoutNotificacion) clearTimeout(timeoutNotificacion)

  void notificacion.offsetWidth

  notificacion.classList.add("mostrar")

  timeoutNotificacion = setTimeout(() => {
    notificacion.classList.remove("mostrar")
    timeoutNotificacion = null
  }, 2500)
}

botones.forEach(boton => {
  boton.addEventListener("click", () => {
    const numero = boton.dataset.num

    if (numero !== undefined) {
      if (posicion < inputs.length) {
        inputs[posicion].value = numero
        posicion++
        actualizarInputs()
      }
    }

    if (boton.id === "borrar") {
      borrarNumero()
    }

    if (boton.id === "borrarTodo") {
      borrarTodo()
    }
  })
})

function borrarNumero() {
  if (posicion > 0) {
    posicion--
    inputs[posicion].value = ""
    actualizarInputs()
  }
}

function borrarTodo() {
  inputs.forEach(input => (input.value = ""))
  posicion = 0
  actualizarInputs()
}

function actualizarInputs() {
  inputs.forEach(input => {
    if (input.value !== "") {
      input.classList.add("filled")
    } else {
      input.classList.remove("filled")
    }
  })
}

if (btnConfirmar) {
  btnConfirmar.addEventListener("click", async () => {
    const pin = Array.from(inputs).map(i => i.value).join("")

    if (pin.length < inputs.length) {
      mostrarNotificacion("advertencia", "Introduce el PIN completo")
      return
    }

    const usuario = await validarPin(pin)

    if (!usuario) {
      mostrarNotificacion("error", "PIN incorrecto")
      borrarTodo()
      return
    }

    localStorage.setItem("usuarioPin", pin)
    localStorage.setItem("notiExito", "Inicio de sesión exitoso.")

    document.getElementById("loading-screen").style.display = "flex"

    // 🔹 Comprobar si el usuario ya tiene negocios creados
    const { data: negocios, error } = await supabaseClient
      .from("negocios")
      .select("id")
      .eq("usuario_id", usuario.id)

    setTimeout(() => {
      if (negocios && negocios.length > 0) {
        window.location.href = "dashboard.html"
      } else {
        window.location.href = "bussines-setup.html"
      }
    }, 3000)
  })
}
