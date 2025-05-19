// === script.js ===

document.addEventListener('DOMContentLoaded', () => {
  // Llenar select de años automáticamente
  const anioInicio = document.getElementById("anioInicio");
  const anioFin = document.getElementById("anioFin");
  for (let y = 2000; y <= new Date().getFullYear() + 1; y++) {
    anioInicio.innerHTML += `<option value="${y}">${y}</option>`;
    anioFin.innerHTML += `<option value="${y}">${y}</option>`;
  }
  anioInicio.value = 2015;
  anioFin.value = 2026;

  const formulario = document.getElementById('formularioBusqueda');

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const datosBusqueda = {
      anioInicio: anioInicio.value,
      anioFin: anioFin.value,
      marca: document.getElementById('marca').value.trim(),
      modelo: document.getElementById('modelo').value.trim(),
      tipoVehiculoCopart: document.getElementById('tipoVehiculoCopart').value,
      tipoVehiculoBarco: document.getElementById('tipoVehiculoBarco').value,
      precioDeseado: parseFloat(document.getElementById('precioDeseado').value)
    };

    console.log('Datos de búsqueda capturados:', datosBusqueda);

    // Aquí se podría enviar a un backend (Node.js con Playwright por ejemplo)
    // fetch('/api/busqueda', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(datosBusqueda)
    // })
    // .then(res => res.json())
    // .then(data => mostrarResultados(data))
    // .catch(err => console.error('Error:', err));

    // Por ahora solo mostramos mensaje simulado
    document.getElementById('resultados').innerHTML = `
      <p>Buscando <strong>${datosBusqueda.marca} ${datosBusqueda.modelo}</strong> (${datosBusqueda.anioInicio} - ${datosBusqueda.anioFin})...<br>
      Tipo Vehículo: ${datosBusqueda.tipoVehiculoCopart} / ${datosBusqueda.tipoVehiculoBarco}<br>
      Precio meta: L. ${datosBusqueda.precioDeseado.toLocaleString()}</p>
    `;
  });
});
