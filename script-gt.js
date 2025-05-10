function calcular() {
  const oferta = parseFloat(document.getElementById("c1").value);
  const flete = parseFloat(document.getElementById("c7").value);
  const grua = parseFloat(document.getElementById("c8").value);
  const tipoCambio = parseFloat(document.getElementById("e2").value);
  const anio = parseInt(document.getElementById("anio").value);
  const titulo = document.getElementById("titulo").value;
  const tipoVehiculo = document.getElementById("tipoVehiculo").value;
  const aduanero = parseFloat(document.getElementById("aduanero").value || 0);

  if (!oferta || !flete || !grua || !tipoCambio || !anio) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Cargos Copart
  const environmentalFee = 15;
  const gateFee = 115;
  const virtualBidFee = buscarVirtualBidFee(oferta);
  const buyerFee = buscarBuyerFee(oferta);

  const facturaCopart = oferta + environmentalFee + virtualBidFee + buyerFee + gateFee;

  // Seguro marítimo (1.5% de factura Copart)
  const seguro = facturaCopart * 0.015;

  // CIF total en USD
  const cifUSD = facturaCopart + flete + grua + seguro;

  // CIF en Quetzales
  const cifGTQ = cifUSD * tipoCambio;

  // IVA 12%
  const iva = cifGTQ * 0.12;

  // IPRIMA según antigüedad
  const anioActual = new Date().getFullYear();
  const antiguedad = anioActual - anio;

  let iprimaTasa = 0.2;
  if (antiguedad >= 3 && antiguedad <= 4) iprimaTasa = 0.15;
  else if (antiguedad >= 5 && antiguedad <= 6) iprimaTasa = 0.10;
  else if (antiguedad >= 7) iprimaTasa = 0.05;

  const iprima = cifGTQ * iprimaTasa;

  const totalImpuestos = iva + iprima;
  const totalImportacion = cifGTQ + totalImpuestos;

  // Gastos fijos adicionales en GTQ
  const transferencia = 250;
  const escaneoAlmacenaje = 400;
  const placas = 120;
  const tarjeta = 75;
  const tituloGuate = 50;
  const otros = 100;

  const gastosFijos = transferencia + escaneoAlmacenaje + placas + tarjeta + tituloGuate + otros;

  const totalFinalGeneral = totalImportacion + gastosFijos + aduanero;

  mostrarResultados({
    facturaCopart, seguro, cifGTQ, iva, iprima, totalImpuestos, totalImportacion,
    gastosFijos, aduanero, totalFinalGeneral, tipoCambio
  });
}

// Tablas
const buyerFees = [
  [50,1],[100,25],[200,60],[300,85],[350,100],[400,125],[450,135],[500,145],[550,155],[600,170],[700,195],
  [800,215],[900,230],[1000,250],[1200,270],[1300,285],[1400,300],[1500,315],[1600,330],[1700,350],[1800,370],[2000,390],
  [2400,425],[2500,460],[3000,505],[3500,555],[4000,600],[4500,625],[5000,650],[5500,675],[6000,700],[7000,755],
  [7500,775],[8000,800],[8500,820],[9000,820],[10000,850],[11000,850],[11500,860],[12000,875],[12500,890],
  [13000,890],[14000,900],[15000,900]
];

const virtualBidFees = [
  [100,50],[500,65],[1000,85],[1500,95],[2000,110],[4000,125],[6000,145],[8000,160],
  [9000,160],[10000,160],[200000,160]
];

function buscarValor(tabla, valor) {
  for (let i = tabla.length - 1; i >= 0; i--) {
    if (valor >= tabla[i][0]) return tabla[i][1];
  }
  return 0;
}

function buscarBuyerFee(oferta) {
  return oferta > 15000 ? +(oferta * 0.06).toFixed(2) : buscarValor(buyerFees, oferta);
}

function buscarVirtualBidFee(oferta) {
  return oferta > 8000 ? 160 : buscarValor(virtualBidFees, oferta);
}

// Mostrar resultados
function mostrarResultados(datos) {
  const {
    facturaCopart, seguro, cifGTQ, iva, iprima, totalImpuestos, totalImportacion,
    gastosFijos, aduanero, totalFinalGeneral, tipoCambio
  } = datos;

  const formatear = v => new Intl.NumberFormat("es-GT", {
    style: "currency", currency: "GTQ"
  }).format(v);

  const formatearUSD = v => new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD"
  }).format(v);

  const html = `
    <h2>Resultados</h2>
    <table>
      <tr><th>Concepto</th><th>Valor</th></tr>
      <tr><td>Factura Copart</td><td>${formatearUSD(facturaCopart)}</td></tr>
      <tr><td>Seguro Marítimo (1.5%)</td><td>${formatearUSD(seguro)}</td></tr>
      <tr><td>Valor CIF en GTQ</td><td>${formatear(cifGTQ)}</td></tr>
      <tr><td>IVA (12%)</td><td>${formatear(iva)}</td></tr>
      <tr><td>IPRIMA</td><td>${formatear(iprima)}</td></tr>
      <tr><td>Total de Impuestos</td><td>${formatear(totalImpuestos)}</td></tr>
      <tr><td>Total Importación + Impuestos</td><td>${formatear(totalImportacion)}</td></tr>
      <tr><td>Gastos Fijos Estimados</td><td>${formatear(gastosFijos)}</td></tr>
      <tr><td>Agente Aduanero</td><td>${formatear(aduanero)}</td></tr>
      <tr><th>Total Final Estimado</th><th>${formatear(totalFinalGeneral)}</th></tr>
    </table>
    <p style="margin-top:10px;">Tipo de cambio aplicado: ${tipoCambio}</p>
  `;

  document.getElementById("resultados").innerHTML = html;
}

function reiniciar() {
  document.getElementById("c1").value = "";
  document.getElementById("c7").value = "";
  document.getElementById("c8").value = "";
  document.getElementById("e2").value = "7.8";
  document.getElementById("anio").value = "";
  document.getElementById("titulo").value = "clean";
  document.getElementById("tipoVehiculo").value = "turismo";
  document.getElementById("aduanero").value = "";
  document.getElementById("resultados").innerHTML = "";
}
