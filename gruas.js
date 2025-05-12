// Datos organizados por estado > ciudad > tipo de vehículo
const dataGruas = {
  Florida: {
    "Miami": {
      "Turismos Pequeños": { barco: 780, grua: 80 },
      "Turismos Grande": { barco: 970, grua: 80 },
      "Camionetas Regulares": { barco: 795, grua: 80 },
      "Camionetas Grandes": { barco: 1180, grua: 80 },
      "Camionetas XL": { barco: 1750, grua: 80 },
      "Motos Regulares": { barco: 600, grua: 80 },
      "Marcas Exclusivas": { barco: 1000, grua: 80 },
      "Cabina Sencilla (no excediendo 16')": { barco: 970, grua: 80 },
      "Cabina y Media (baja)": { barco: 1260, grua: 80 },
      "Cabina y Media (alto) y doble cabina": { barco: 1380, grua: 80 },
      "Extra Grandes (más de 17'3'')": { barco: 1750, grua: 80 }
    }
  },
  Texas: {
    "Houston": {
      "Turismos Pequeños": { barco: 800, grua: 100 },
      "Turismos Grande": { barco: 980, grua: 100 },
      "Camionetas Regulares": { barco: 950, grua: 100 },
      "Camionetas Grandes": { barco: 1225, grua: 100 },
      "Camionetas XL": { barco: 1775, grua: 100 },
      "Motos Regulares": { barco: 675, grua: 100 },
      "Marcas Exclusivas": { barco: 945, grua: 100 },
      "Cabina Sencilla (no excediendo 16')": { barco: 1050, grua: 100 },
      "Cabina y Media (baja)": { barco: 1280, grua: 100 },
      "Cabina y Media (alto) y doble cabina": { barco: 1380, grua: 100 },
      "Extra Grandes (más de 17'3'')": { barco: 1775, grua: 100 }
    }
  },
  Delaware: {
    "New Castle": {
      "Turismos Pequeños": { barco: 850, grua: 80 },
      "Turismos Grande": { barco: 950, grua: 80 },
      "Camionetas Regulares": { barco: 950, grua: 80 },
      "Camionetas Grandes": { barco: 1230, grua: 80 },
      "Camionetas XL": { barco: 1730, grua: 80 },
      "Motos Regulares": { barco: 700, grua: 80 },
      "Marcas Exclusivas": { barco: 975, grua: 80 },
      "Cabina Sencilla (no excediendo 16')": { barco: 1050, grua: 80 },
      "Cabina y Media (baja)": { barco: 1340, grua: 80 },
      "Cabina y Media (alto) y doble cabina": { barco: 1480, grua: 80 },
      "Extra Grandes (más de 17'3'')": { barco: 1780, grua: 80 }
    }
  }
};

// Llena el select de ciudad según el estado
function cargarCiudades() {
  const estado = document.getElementById("estadoSelect").value;
  const ciudadSelect = document.getElementById("ciudadSelect");

  ciudadSelect.innerHTML = '<option value="">Selecciona una ciudad</option>';

  if (estado && dataGruas[estado]) {
    const ciudades = Object.keys(dataGruas[estado]);
    ciudades.forEach(ciudad => {
      const option = document.createElement("option");
      option.value = ciudad;
      option.textContent = ciudad;
      ciudadSelect.appendChild(option);
    });
  }
}

// Busca los precios según estado + ciudad + tipo de vehículo
function buscarRutaMasEconomica() {
  const estado = document.getElementById("estadoSelect").value;
  const ciudad = document.getElementById("ciudadSelect").value;
  const tipo = document.getElementById("vehiculoSelect").value;

  const resultadoDiv = document.getElementById("resultadoGrua");
  const errorDiv = document.getElementById("mensajeError");
  const barcoText = document.getElementById("precioBarco");
  const gruaText = document.getElementById("precioGrua");

  if (
    estado &&
    ciudad &&
    tipo &&
    dataGruas[estado] &&
    dataGruas[estado][ciudad] &&
    dataGruas[estado][ciudad][tipo]
  ) {
    const datos = dataGruas[estado][ciudad][tipo];
    let barco = 0;

    // Asignar barco por puerto principal del estado
    if (estado === "Florida") barco = 780;
    else if (estado === "Texas") barco = 800;
    else if (estado === "Delaware") barco = 850;

    barcoText.innerHTML = `🚢 <strong>Barco (desde ${estado}):</strong> USD ${barco}`;
    gruaText.innerHTML = `🏗️ <strong>Grúa (desde ${ciudad}):</strong> USD ${datos.grua}`;
    resultadoDiv.style.display = "block";
    errorDiv.style.display = "none";
  } else {
    resultadoDiv.style.display = "none";
    errorDiv.style.display = "block";
  }
}
