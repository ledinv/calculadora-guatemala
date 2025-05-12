const dataGruas = [
  {
    ciudad: "Miami",
    vehiculos: {
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
  {
    ciudad: "Houston",
    vehiculos: {
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
  {
    ciudad: "Delaware",
    vehiculos: {
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
];

function buscarRutaMasEconomica() {
  const ciudadInput = document.getElementById("ciudadInput").value.trim().toLowerCase();
  const tipoVehiculo = document.getElementById("vehiculoSelect").value;

  const resultado = dataGruas.find(item =>
    item.ciudad.toLowerCase().includes(ciudadInput) &&
    item.vehiculos[tipoVehiculo]
  );

  const resultadoDiv = document.getElementById("resultadoGrua");
  const errorDiv = document.getElementById("mensajeError");
  const barcoText = document.getElementById("precioBarco");
  const gruaText = document.getElementById("precioGrua");

  if (resultado) {
    const datos = resultado.vehiculos[tipoVehiculo];
    barcoText.innerHTML = `🚢 <strong>Barco:</strong> USD ${datos.barco}`;
    gruaText.innerHTML = `🏗️ <strong>Grúa:</strong> USD ${datos.grua}`;
    resultadoDiv.style.display = "block";
    errorDiv.style.display = "none";
  } else {
    resultadoDiv.style.display = "none";
    errorDiv.style.display = "block";
  }
}
