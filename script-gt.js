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

  // IPRIMA
  const anioActual = new Date().getFullYear();
  const antiguedad = anioActual - anio;
  let iprimaTasa = 0.2;
  if (antiguedad >= 3 && antiguedad <= 4) iprimaTasa = 0.15;
  else if (antiguedad >= 5 && antiguedad <= 6) iprimaTasa = 0.10;
  else if (antiguedad >= 7) iprimaTasa = 0.05;
  const iprima = cifGTQ * iprimaTasa;
  const totalImpuestos = iva + iprima;

  // Gastos fijos
  const gastos = {
    transferencia: 250,
    escaneo: 400,
    placas: 120,
    tarjeta: 75,
    titulo: 50,
    otros: 100
  };

  const totalGastosFijos = gastos.transferencia + gastos.escaneo + gastos.placas + gastos.tarjeta + gastos.titulo + gastos.otros;

  const totalFinal = cifGTQ + totalImpuestos + totalGastosFijos + aduanero;

  mostrarResultados({
    oferta, environmentalFee, virtualBidFee, buyerFee, gateFee,
    facturaCopart, flete, grua, seguro, cifUSD, cifGTQ,
    iva, iprima, totalImpuestos, gastos, aduanero, totalGastosFijos, totalFinal, tipoCambio
  });
}

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

function mostrarResultados(data) {
  const f = v => new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(v);
  const fUSD = v => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  document.getElementById("resultados").innerHTML = `
    <h2>Resultados Detallados</h2>
    <table>
      <tr><th colspan="2">🧾 Factura Copart</th></tr>
      <tr><td>Monto de Oferta</td><td>${fUSD(data.oferta)}</td></tr>
      <tr><td>Environmental Fee</td><td>${fUSD(data.environmentalFee)}</td></tr>
      <tr><td>Virtual Bid Fee</td><td>${fUSD(data.virtualBidFee)}</td></tr>
      <tr><td>Buyer Fee</td><td>${fUSD(data.buyerFee)}</td></tr>
      <tr><td>Gate Fee</td><td>${fUSD(data.gateFee)}</td></tr>
      <tr><td><strong>Total Factura Copart</strong></td><td><strong>${fUSD(data.facturaCopart)}</strong></td></tr>

      <tr><th colspan="2">🚢 Transporte y Seguro</th></tr>
      <tr><td>Precio de Barco</td><td>${fUSD(data.flete)}</td></tr>
      <tr><td>Precio de Grúa</td><td>${fUSD(data.grua)}</td></tr>
      <tr><td>Seguro (1.5%)</td><td>${fUSD(data.seguro)}</td></tr>
      <tr><td>Total CIF (USD)</td><td>${fUSD(data.cifUSD)}</td></tr>
      <tr><td>Total CIF (GTQ)</td><td>${f(data.cifGTQ)}</td></tr>

      <tr><th colspan="2">💸 Impuestos</th></tr>
      <tr><td>IVA (12%)</td><td>${f(data.iva)}</td></tr>
      <tr><td>IPRIMA</td><td>${f(data.iprima)}</td></tr>
      <tr><td><strong>Total Impuestos</strong></td><td><strong>${f(data.totalImpuestos)}</strong></td></tr>

      <tr><th colspan="2">🔧 Gastos Fijos</th></tr>
      <tr><td>Transferencia Internacional</td><td>${f(data.gastos.transferencia)}</td></tr>
      <tr><td>Escaneo y Almacenaje</td><td>${f(data.gastos.escaneo)}</td></tr>
      <tr><td>Placas</td><td>${f(data.gastos.placas)}</td></tr>
      <tr><td>Tarjeta de Circulación</td><td>${f(data.gastos.tarjeta)}</td></tr>
      <tr><td>Título Guatemalteco</td><td>${f(data.gastos.titulo)}</td></tr>
      <tr><td>Otros (gestoría, formularios)</td><td>${f(data.gastos.otros)}</td></tr>
      <tr><td><strong>Total Gastos Fijos</strong></td><td><strong>${f(data.totalGastosFijos)}</strong></td></tr>

      <tr><td>Agente Aduanero</td><td>${f(data.aduanero)}</td></tr>

      <tr><th>Total Final</th><th>${f(data.totalFinal)}</th></tr>
    </table>
    <p style="margin-top: 12px;">Tipo de cambio aplicado: <strong>${data.tipoCambio}</strong></p>
  `;
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
