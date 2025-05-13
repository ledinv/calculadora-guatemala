// script.js

function toggleMenu() {
  const menu = document.getElementById("mobile-menu-links");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

function bloquearMotorPorVin() {
  const vin = document.getElementById("c13").value;
  const motorSelect = document.getElementById("motor");
  motorSelect.disabled = vin !== "OTROS";
  if (motorSelect.disabled) motorSelect.value = "";
}

function buscarValor(tabla, valor) {
  for (let i = tabla.length - 1; i >= 0; i--) {
    if (valor >= tabla[i][0]) return tabla[i][1];
  }
  return 0;
}

function buscarBuyerFee(c1) {
  const buyerFees = [
    [50,1],[100,25],[200,60],[300,85],[350,100],[400,125],[450,135],[500,145],[550,155],[600,170],[700,195],
    [800,215],[900,230],[1000,250],[1200,270],[1300,285],[1400,300],[1500,315],[1600,330],[1700,350],[1800,370],
    [2000,390],[2400,425],[2500,460],[3000,505],[3500,555],[4000,600],[4500,625],[5000,650],[5500,675],[6000,700],
    [7000,755],[7500,775],[8000,800],[8500,820],[9000,820],[10000,850],[11000,850],[11500,860],[12000,875],
    [12500,890],[13000,890],[14000,900],[15000,900]
  ];
  return c1 > 15000 ? +(c1 * 0.06).toFixed(2) : buscarValor(buyerFees, c1);
}

function buscarVirtualBidFee(c1) {
  const virtualBidFees = [
    [100,50],[500,65],[1000,85],[1500,95],[2000,110],[4000,125],[6000,145],[8000,160],
    [9000,160],[10000,160],[200000,160]
  ];
  return c1 > 8000 ? 160 : buscarValor(virtualBidFees, c1);
}

function calcular() {
  const c1 = parseFloat(document.getElementById('c1').value.trim());
  const c7 = parseFloat(document.getElementById('c7').value.trim());
  const c8 = parseFloat(document.getElementById('c8').value.trim());
  const e2 = parseFloat(document.getElementById('e2').value.trim());
  const c13 = document.getElementById('c13').value;
  const c14 = document.getElementById('c14').value;
  const motor = document.getElementById('motor').value;

  if (!c1 || !c7 || !c8 || !e2 || !c13 || !c14 || (c13 === "OTROS" && !motor)) {
    alert("Por favor completa todos los campos. El campo 'Tipo de Motor' solo aplica si el VIN es OTROS.");
    return;
  }

  const c2 = 15;
  const c3 = buscarVirtualBidFee(c1);
  const c4 = buscarBuyerFee(c1);
  const c5 = 115;
  const c6 = c1 + c2 + c3 + c4 + c5;
  const c9 = c7 + c8;
  const c10 = c6 + c9;
  const c11 = c10 * e2;
  const o3 = 50 * e2;
  const o4 = c6 * 0.015 * e2;

  const tieneCafta = c13 === "1,4,5";
  const tipo = c14;
  const cifUSD = c10;
  const baseLps = c11 + o3 + o4 + c5;

  let c15 = 0;
  if (!tieneCafta) {
    if (tipo === "HIBRIDO") c15 = baseLps * 0.10;
    else if (tipo === "MAQUINARIA") c15 = baseLps * 0.05;
    else if (["PICK UP", "CAMION", "BUS", "MOTO"].includes(tipo)) c15 = baseLps * 0.10;
    else c15 = baseLps * 0.15;
  }

  let c16 = 0;
  if (tipo === "HIBRIDO") {
    c16 = (baseLps + c15) * 0.05;
  } else if (tipo === "PICK UP" && !tieneCafta) {
    c16 = (baseLps + c15) * 0.10;
  } else if (["CAMION", "BUS", "MAQUINARIA"].includes(tipo)) {
    c16 = 0;
  } else if (["MOTO", "OTROS"].includes(tipo)) {
    let isc = 0;
    if (cifUSD <= 7000) isc = 0.10;
    else if (cifUSD <= 10000) isc = 0.15;
    else if (cifUSD <= 20000) isc = 0.20;
    else if (cifUSD <= 30000) isc = 0.30;
    else isc = 0.45;
    c16 = (baseLps + c15) * isc;
  }

  let c17 = 0;
  if (tipo !== "MAQUINARIA") {
    c17 = (c11 + c15 + c16 + o3 + o4) * 0.15;
  }

  const c18 = c15 + c16 + c17;

  let c20 = 5000;
  if (cifUSD > 15000 && cifUSD <= 25000) c20 = 7000;
  else if (cifUSD > 25000) c20 = 10000;
  if (tipo === "MAQUINARIA") c20 = 0;

  alert(`DAI: ${c15.toFixed(2)}\nISC: ${c16.toFixed(2)}\nISV: ${c17.toFixed(2)}\nTotal Impuestos: ${c18.toFixed(2)}\nEcotasa: ${c20.toFixed(2)}`);
}

function reiniciar() {
  document.getElementById('c1').value = "";
  document.getElementById('c7').value = "";
  document.getElementById('c8').value = "";
  document.getElementById('e2').value = "25.90";
  document.getElementById('c13').value = "OTROS";
  document.getElementById('c14').value = "OTROS";
  document.getElementById('motor').value = "";
  document.getElementById('results').innerHTML = '';
  bloquearMotorPorVin();
}
