// === script.js ===

document.addEventListener('DOMContentLoaded', async () => {
  // Llenar select de años automáticamente
  const anioInicio = document.getElementById("anioInicio");
  const anioFin = document.getElementById("anioFin");
  for (let y = 2000; y <= new Date().getFullYear() + 1; y++) {
    anioInicio.innerHTML += `<option value="${y}">${y}</option>`;
    anioFin.innerHTML += `<option value="${y}">${y}</option>`;
  }
  anioInicio.value = 2015;
  anioFin.value = 2026;

  const marcaSelect = document.getElementById('marca');
  const modeloSelect = document.getElementById('modelo');

  // Cargar marcas desde archivo JSON
  try {
    const marcasRes = await fetch('marcas-copart.json');
    const marcas = await marcasRes.json();

    marcas.forEach(marca => {
      const option = document.createElement('option');
      option.value = marca;
      option.textContent = marca;
      marcaSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error cargando marcas:', err);
  }

  // Al seleccionar una marca, cargar modelos
  marcaSelect.addEventListener('change', async () => {
    modeloSelect.innerHTML = '<option value="">Cargando modelos...</option>';
    try {
      const modelosRes = await fetch('modelos-copart.json');
      const modelosData = await modelosRes.json();
      const modelos = modelosData[marcaSelect.value] || [];
      modeloSelect.innerHTML = '';
      modelos.forEach(modelo => {
        const option = document.createElement('option');
        option.value = modelo;
        option.textContent = modelo;
        modeloSelect.appendChild(option);
      });
      if (modelos.length === 0) {
        modeloSelect.innerHTML = '<option value="">(Sin modelos disponibles)</option>';
      }
    } catch (err) {
      console.error('Error cargando modelos:', err);
      modeloSelect.innerHTML = '<option value="">Error al cargar</option>';
    }
  });

  const formulario = document.getElementById('formularioBusqueda');

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const datosBusqueda = {
      anioInicio: anioInicio.value,
      anioFin: anioFin.value,
      marca: marcaSelect.value,
      modelo: modeloSelect.value,
      tipoVehiculoCopart: document.getElementById('tipoVehiculoCopart').value,
      tipoVehiculoBarco: document.getElementById('tipoVehiculoBarco').value,
      precioDeseado: parseFloat(document.getElementById('precioDeseado').value)
    };

    console.log('Datos de búsqueda capturados:', datosBusqueda);

    document.getElementById('resultados').innerHTML = `
      <p>Buscando <strong>${datosBusqueda.marca} ${datosBusqueda.modelo}</strong> (${datosBusqueda.anioInicio} - ${datosBusqueda.anioFin})...<br>
      Tipo Vehículo: ${datosBusqueda.tipoVehiculoCopart} / ${datosBusqueda.tipoVehiculoBarco}<br>
      Precio meta: L. ${datosBusqueda.precioDeseado.toLocaleString()}</p>
    `;
  });
});
