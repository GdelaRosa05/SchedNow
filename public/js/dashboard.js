window.addEventListener("DOMContentLoaded", async () => {
  const pin = localStorage.getItem("usuarioPin")
  if (!pin) {
    window.location.href = "../index.html"
    return
  }

  const usuario = await validarPin(pin)
  if (!usuario) {
    localStorage.removeItem("usuarioPin")
    window.location.href = "index.html"
    return
  }

  const container = document.getElementById("cards-container")
  const formContainer = document.getElementById("form-container")

  // Obtener negocios desde Supabase
  const { data: negocios, error } = await supabaseClient
    .from("negocios")
    .select("*")
    .eq("usuario_id", usuario.id)

  if (error) {
    console.error(error)
    mostrarNotificacion("error", "Error cargando negocios")
    return
  }

  // Si no tiene negocios, mostrar directamente el formulario
  if (negocios.length === 0) {
    formContainer.style.display = "block"
    container.style.display = "none"
  } else {
    // Renderizar tarjetas
    negocios.forEach(negocio => {
      const card = document.createElement("div")
      card.classList.add("business-card")
      card.innerHTML = `
        <div class="card-header">
          <img src="${negocio.logo || 'default-logo.png'}" alt="Logo">
          <div class="card-name">
            <h4>${negocio.nombre}</h4>
            <p>${negocio.direccion}</p>
          </div>
          <svg class="arrow" width="15px" height="15px" viewBox="0 -4.5 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" transform="rotate(90)">
          <g id="SVGRepo_bgCarrier" stroke-width="0"/>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
          <g id="SVGRepo_iconCarrier"> <title>arrow_up [#ffffff]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g class="arrow-path" id="Dribbble-Light-Preview" transform="translate(-260.000000, -6684.000000)" fill="#666666"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M223.707692,6534.63378 L223.707692,6534.63378 C224.097436,6534.22888 224.097436,6533.57338 223.707692,6533.16951 L215.444127,6524.60657 C214.66364,6523.79781 213.397472,6523.79781 212.616986,6524.60657 L204.29246,6533.23165 C203.906714,6533.6324 203.901717,6534.27962 204.282467,6534.68555 C204.671211,6535.10081 205.31179,6535.10495 205.70653,6534.69695 L213.323521,6526.80297 C213.714264,6526.39807 214.346848,6526.39807 214.737591,6526.80297 L222.294621,6534.63378 C222.684365,6535.03868 223.317949,6535.03868 223.707692,6534.63378" id="arrow_up-[#ffffff]"> </path> </g> </g> </g> </g>
          </svg>
        </div>
        <p class="card-phone"><svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5.5C3 14.0604 9.93959 21 18.5 21C18.8862 21 19.2691 20.9859 19.6483 20.9581C20.0834 20.9262 20.3009 20.9103 20.499 20.7963C20.663 20.7019 20.8185 20.5345 20.9007 20.364C21 20.1582 21 19.9181 21 19.438V16.6207C21 16.2169 21 16.015 20.9335 15.842C20.8749 15.6891 20.7795 15.553 20.6559 15.4456C20.516 15.324 20.3262 15.255 19.9468 15.117L16.74 13.9509C16.2985 13.7904 16.0777 13.7101 15.8683 13.7237C15.6836 13.7357 15.5059 13.7988 15.3549 13.9058C15.1837 14.0271 15.0629 14.2285 14.8212 14.6314L14 16C11.3501 14.7999 9.2019 12.6489 8 10L9.36863 9.17882C9.77145 8.93713 9.97286 8.81628 10.0942 8.64506C10.2012 8.49408 10.2643 8.31637 10.2763 8.1317C10.2899 7.92227 10.2096 7.70153 10.0491 7.26005L8.88299 4.05321C8.745 3.67376 8.67601 3.48403 8.55442 3.3441C8.44701 3.22049 8.31089 3.12515 8.15802 3.06645C7.98496 3 7.78308 3 7.37932 3H4.56201C4.08188 3 3.84181 3 3.63598 3.09925C3.4655 3.18146 3.29814 3.33701 3.2037 3.50103C3.08968 3.69907 3.07375 3.91662 3.04189 4.35173C3.01413 4.73086 3 5.11378 3 5.5Z" stroke="currentColor" fill="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>${negocio.telefono}</p>
      `

      container.appendChild(card)
    })
  }

  // Mostrar formulario al pulsar "Añadir negocio"
  const overlay = document.getElementById("form-overlay")
  const body = document.getElementById("dashboard-body")

  document.getElementById("new-business").addEventListener("click", () => {
    overlay.style.display = "flex"
    body.style.overflowY = "hidden"

    requestAnimationFrame(() => {
      overlay.classList.remove("ocultar")
      overlay.classList.add("mostrar")
    })

    // Preview del logo: conectar eventos cuando se abre el formulario
    const logoInput = document.getElementById("bussines-logo")
    const logoPreview = document.getElementById("logo-preview")
    const logoIcon = document.getElementById("logo-icon")

    logoInput.addEventListener("change", () => {
      const file = logoInput.files[0]
      if (file) {
        logoPreview.src = URL.createObjectURL(file)
        logoPreview.style.display = "block"
        logoIcon.style.display = "none"
      } else {
        logoPreview.style.display = "none"
        logoIcon.style.display = "block"
      }
    })
  })

  document.getElementById("close-form").addEventListener("click", () => {
    overlay.classList.remove("mostrar")
    overlay.classList.add("ocultar")

    setTimeout(() => {
      overlay.style.display = "none"
      body.style.overflowY = "scroll"
    }, 300)
  })


  // Guardar negocio
  document.getElementById("add-bussines").addEventListener("click", async () => {
    const nombre = document.getElementById("bussines-name").value.trim()
    const direccion = document.getElementById("bussines-adress").value.trim()
    const telefono = document.getElementById("bussines-number").value.trim()
    const correo = document.getElementById("bussines-email").value.trim()
    const logo = document.getElementById("bussines-logo").files[0]

    if (!nombre || !direccion || !telefono || !correo) {
      mostrarNotificacion("advertencia", "Todos los campos son obligatorios")
      return
    }

    let logoUrl = null
    if (logo) {
      const filePath = `${usuario.id}/${Date.now()}_${logo.name}`
      const { error: uploadError } = await supabaseClient.storage
        .from("logos-negocios")
        .upload(filePath, logo)

      if (uploadError) {
        mostrarNotificacion("error", "Error al subir el logo")
        return
      }

      const { data } = supabaseClient.storage
        .from("logos-negocios")
        .getPublicUrl(filePath)

      logoUrl = data.publicUrl
    }

    const { error: insertError } = await supabaseClient.from("negocios").insert({
      usuario_id: usuario.id,
      nombre,
      direccion,
      telefono,
      correo_contacto: correo,
      logo: logoUrl
    })

    if (insertError) {
      mostrarNotificacion("error", "Error al guardar el negocio")
      return
    }

    mostrarNotificacion("exito", "Negocio guardado correctamente")
    document.getElementById("form-inicial").reset()

    // Ocultar formulario y recargar tarjetas
    setTimeout(() => window.location.reload(), 500)
  })
})