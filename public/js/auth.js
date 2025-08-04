// Inicializar Supabase (usa tu URL y API Key)
const SUPABASE_URL = "https://honvguaogggjnpcbkxza.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbnZndWFvZ2dnam5wY2JreHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODg0MzcsImV4cCI6MjA2NjU2NDQzN30.amwImB6OQyHiPg0KD6Q3UHTZKrJsuWBo0ICOkrsSfFw";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Valida si un PIN existe en la tabla usuarios.
 * @param {string} pin - PIN introducido por el usuario
 * @returns {Promise<object|null>} Devuelve el usuario si existe, o null si no existe
 */
async function validarPin(pin) {
  try {
    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("id")
      .eq("pin", pin)
      .maybeSingle();

    if (error) {
      console.error("Error en Supabase:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error en la validación del PIN:", err);
    return null;
  }
}