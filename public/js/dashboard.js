window.addEventListener("DOMContentLoaded", async () => {
  const pin = localStorage.getItem("usuarioPin")
  if (!pin) {
    window.location.href = "index.html"
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
        </div>
        <p class="card-phone">${negocio.telefono}</p>
      `

      card.addEventListener("click", () => {
        console.log("Abrir negocio:", negocio.id)
      })

      container.appendChild(card)
    })
  }

  // Mostrar formulario al pulsar "Añadir negocio"
  document.getElementById("new-business").addEventListener("click", () => {
    document.getElementById("form-overlay").style.display = "flex"
    document.getElementById("dashboard-body").style.overflowY = "hidden"
  })

  document.getElementById("close-form").addEventListener("click", () => {
    document.getElementById("form-overlay").style.display = "none"
    document.getElementById("dashboard-body").style.overflowY = "scroll"
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
    setTimeout(() => window.location.reload(), 1500)
  })
})