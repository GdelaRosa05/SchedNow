window.addEventListener("DOMContentLoaded", async () => {
  // Mostrar notificación si viene de login
  const mensaje = localStorage.getItem("notiExito")
  if (mensaje) {
    mostrarNotificacion("exito", mensaje)
    localStorage.removeItem("notiExito")
  }

  // Comprobar PIN
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

  // Comprobar si ya tiene negocios creados
  const { data: negocios, error: errorNegocios } = await supabaseClient
    .from("negocios")
    .select("id")
    .eq("usuario_id", usuario.id)

  if (errorNegocios) {
    console.error("Error consultando negocios:", errorNegocios.message)
  } else if (negocios.length > 0) {
    // Si ya tiene negocio creado, ir directo al dashboard
    window.location.href = "dashboard.html"
    return
  }

  // Preview del logo
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

  // Guardar negocio
  const btnGuardar = document.getElementById("add-bussines")
  btnGuardar.addEventListener("click", async (e) => {
    e.preventDefault()

    const nombre = document.getElementById("bussines-name").value.trim()
    const direccion = document.getElementById("bussines-adress").value.trim()
    const telefono = document.getElementById("bussines-number").value.trim()
    const correo = document.getElementById("bussines-email").value.trim()
    const logo = logoInput.files[0]

    if (!nombre || !direccion || !telefono || !correo) {
      mostrarNotificacion("advertencia", "Todos los campos son obligatorios.")
      return
    }

    let logoUrl = null
    if (logo) {
      const filePath = `${usuario.id}/${Date.now()}_${logo.name}`

      // Subir logo al bucket  
      const { error: storageError } = await supabaseClient.storage
        .from("logos-negocios")
        .upload(filePath, logo, { upsert: false })

      if (storageError) {
        console.error("Storage error:", storageError.message)
        mostrarNotificacion("error", "Error subiendo el logo.")
        return
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabaseClient.storage
        .from("logos-negocios")
        .getPublicUrl(filePath)

      if (!publicUrlData) {
        mostrarNotificacion("error", "Error URL")
        return
      }

      logoUrl = publicUrlData.publicUrl
    }

    // Guardar negocio en la BD
    const { error } = await supabaseClient.from("negocios").insert({
      usuario_id: usuario.id,
      nombre,
      direccion,
      telefono,
      correo_contacto: correo,
      logo: logoUrl
    })

    if (error) {
      console.error("DB error:", error.message)
      mostrarNotificacion("error", "Error añadiendo negocio.")
      return
    }

    // Guardar mensaje de éxito y redirigir al dashboard
    localStorage.setItem("notiExito", "Negocio añadido con éxito.")
    window.location.href = "dashboard.html"
  })
})
