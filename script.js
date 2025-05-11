// Inicializar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA5BuOwgEUYK1JMwJD0PL0k0rcAST_Koms",
  authDomain: "subastacarhn-40554.firebaseapp.com",
  projectId: "subastacarhn-40554",
  storageBucket: "subastacarhn-40554.appspot.com",
  messagingSenderId: "536785797974",
  appId: "1:536785797974:web:e3eabb4dcd898c2ffe8cf7",
  measurementId: "G-QM5N60K8C0"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Mostrar saludo si el usuario está logueado
auth.onAuthStateChanged(user => {
  const content = document.getElementById('content');
  const desktop = document.getElementById('userGreeting');
  const mobile  = document.getElementById('mobileGreeting');
  if (user) {
    content.style.display = 'block';
    const name = (user.displayName || user.email.split('@')[0]).replace(/^./, c => c.toUpperCase());
    desktop.innerHTML = `<a href="perfil.html">Hola, ${name}</a> | <a href="#" onclick="logout()">Cerrar sesión</a>`;
    mobile.innerHTML = `<a href="perfil.html">Hola, ${name}</a> | <a href="#" onclick="logout()">Salir</a>`;
  } else {
    content.style.display = 'none';
    desktop.innerHTML = `<a href="login.html">Iniciar sesión</a> | <a href="register.html">Registrarse</a>`;
    mobile.innerHTML = desktop.innerHTML;
    alert('❗ Debes iniciar sesión para usar la calculadora.');
    window.location.href = 'login.html';
  }
});

function logout() {
  firebase.auth().signOut().then(() => location.reload());
}

function toggleMenu() {
  document.getElementById('mobile-menu-links').classList.toggle('open');
}

// Obtener tipo de cambio desde tu API BCH
async function obtenerTipoCambioAutomatico() {
  const url = "https://subastacar-bch-api.onrender.com/api/tipo-cambio-bch";
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.valor) {
      document.getElementById("e2").value = data.valor;
      document.getElementById("e2").readOnly = true;
    }
  } catch (error) {
    console.error("Error al obtener tipo de cambio:", error);
  }
}

// Contador de clics
const endpoint = "https://contador-clics-backend.onrender.com/contador";

async function obtenerContador() {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    document.getElementById('contadorClics').textContent = `Cálculos: ${data.clics}`;
  } catch (e) {
    console.error("Error al obtener contador:", e);
  }
}

async function registrarClic() {
  try {
    const res = await fetch(endpoint, { method: "POST" });
    const data = await res.json();
    document.getElementById('contadorClics').textContent = `Cálculos: ${data.clics}`;
  } catch (e) {
    console.error("Error al registrar clic:", e);
  }
}

// Tablas de fees (igual a tu calculadora actual)
const buyerFees = [
  [50,1],[100,25],[200,60],[300,85],[350,100],[400,125],[450,135],[500,145],[550,155],[600,170],[700,195],
  [800,215],[900,230],[1000,250],[1200,270],[1300,285],[1400,300],[1500,315],[1600,330],[1700,350],[1800,370],[2000,390],
  [2400,425],[2500,460],[3000,505],[3500,555],[4000,600],[4500,625],[5000,650],[5500,675],[6000,700],[7000,755],[7500,775],
  [8000,800],[8500,820],[9000,820],[10000,850],[11000,850],[11500,860],[12000,875],[12500,890],[13000,890],[14000,900],[15000,900]
];

const virtualBidFees = [
  [100,50],[500,65],[1000,85],[1500,95],[2000,110],[4000,125],[6000,145],[8000,160],
  [9000,160],[10000,160],[200000,160]
];

// Funciones auxiliares para buscar fee
const buscarValor = (tabla, valor) => {
  for (let i = tabla.length - 1; i >= 0; i--) {
    if (valor >= tabla[i][0]) return tabla[i][1];
  }
  return 0;
};
const buscarBuyerFee = c1 => c1 > 15000 ? +(c1 * 0.06).toFixed(2) : buscarValor(buyerFees, c1);
const buscarVirtualBidFee = c1 => c1 > 8000 ? 160 : buscarValor(virtualBidFees, c1);

// Formateo de moneda
const formatear = v => new Intl.NumberFormat("es-HN", {
  style: "currency", currency: "HNL"
}).format(v);
const formatearUSD = v => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD"
}).format(v);
function calcular() {
  registrarClic();

  // Entradas del formulario
  const c1 = parseFloat(document.getElementById('c1').value.trim()); // Oferta
  const c7 = parseFloat(document.getElementById('c7').value.trim()); // Barco
  const c8 = parseFloat(document.getElementById('c8').value.trim()); // Grúa
  const e2 = parseFloat(document.getElementById('e2').value.trim()); // Tipo de cambio
  const vin = document.getElementById('vin').value; // VIN
  const tipo = document.getElementById('tipoVehiculo').value; // Tipo vehículo
  const año = document.getElementById('año').value; // Año del vehículo
  const motor = document.getElementById('motor').value; // Cilindraje

  if (!c1 || !c7 || !c8 || !e2 || !vin || !tipo || !año || (vin === "otros" && tipo === "TURISMO" && !motor)) {
    alert("Por favor completa todos los campos requeridos.");
    return;
  }

  // Tarifas fijas
  const environmentalFee = 15;
  const gateFee = 115;
  const virtualBidFee = buscarVirtualBidFee(c1);
  const buyerFee = buscarBuyerFee(c1);
  const subastaTotal = c1 + environmentalFee + virtualBidFee + buyerFee + gateFee;

  const envioTotal = c7 + c8;
  const cifUSD = subastaTotal + envioTotal;
  const cifHNL = cifUSD * e2;

  // DAI
  let dai = 0;
  if (vin === "otros") {
    if (tipo === "TURISMO") {
      dai = (cifHNL + 50 * e2 + (subastaTotal * 0.015 * e2) + gateFee * e2) * (motor === "1.5 Inferior" ? 0.05 : 0.15);
    } else if (tipo === "PICKUP" || tipo === "CAMION" || tipo === "MOTO") {
      dai = (cifHNL + 50 * e2 + (subastaTotal * 0.015 * e2) + gateFee * e2) * 0.10;
    } else if (tipo === "AGRICOLA") {
      dai = (cifHNL + 50 * e2 + (subastaTotal * 0.015 * e2) + gateFee * e2) * 0.05;
    }
  }

  // ISC
  let isc = 0;
  if (tipo !== "AGRICOLA" && tipo !== "MOTO") {
    if (cifUSD <= 7000) isc = 0.10;
    else if (cifUSD <= 10000) isc = 0.15;
    else if (cifUSD <= 20000) isc = 0.20;
    else if (cifUSD <= 30000) isc = 0.30;
    else isc = 0.45;
  } else if (tipo === "MOTO") {
    isc = 0.10;
  }

  const iscTotal = (vin === "otros") ? (cifHNL + 50 * e2 + (subastaTotal * 0.015 * e2) + dai) * isc : 0;

  // ISV
  const isv = (tipo !== "AGRICOLA")
    ? (cifHNL + dai + iscTotal + 50 * e2 + (subastaTotal * 0.015 * e2)) * 0.15
    : 0;

  const totalImpuestos = dai + iscTotal + isv;

  // Ecotasa
  let ecotasa = 5000;
  if (c1 > 15000 && c1 <= 25000) ecotasa = 7000;
  else if (c1 > 25000) ecotasa = 10000;

  // Gastos fijos
  const aduanero = 4000;
  const votainer = 7500;
  const transferencia = 55 * e2;
  const matricula = (año === "2006") ? 4000 : 0;

  const gastosFijos = ecotasa + aduanero + votainer + transferencia + matricula;
  const totalFinal = cifHNL + totalImpuestos + gastosFijos;

  const detalles = [
    ['MONTO DE OFERTA', c1, 'usd'],
    ['ENVIRONMENTAL FEE', environmentalFee, 'usd'],
    ['VIRTUAL BID FEE', virtualBidFee, 'usd'],
    ['BUYER FEE', buyerFee, 'usd'],
    ['GATE FEE', gateFee, 'usd'],
    ['TOTAL PRECIO SUBASTA', subastaTotal, 'usd'],
    ['VALOR DE BARCO', c7, 'usd'],
    ['PRECIO DE GRÚA', c8, 'usd'],
    ['TOTAL ENVÍO MARÍTIMO', envioTotal, 'usd'],
    ['TOTAL CIF EN USD', cifUSD, 'usd'],
    ['TOTAL CIF EN HNL', cifHNL, 'hnl'],
    ['DAI', dai, 'hnl'],
    ['ISC', iscTotal, 'hnl'],
    ['ISV', isv, 'hnl'],
    ['TOTAL IMPUESTOS HONDURAS', totalImpuestos, 'hnl'],
    ['ECOTASA', ecotasa, 'hnl'],
    ['ADUANERO', aduanero, 'hnl'],
    ['VOTAINER', votainer, 'hnl'],
    ['TRANSFERENCIA INT.', transferencia, 'hnl'],
    ['MATRÍCULA', matricula, 'hnl'],
    ['TOTAL GASTOS FIJOS', gastosFijos, 'hnl'],
    ['TOTAL FINAL', totalFinal, 'hnl']
  ];

  mostrarResultados(detalles);
  guardarHistorial(
    detalles.map(([titulo, valor, tipo]) => ({
      titulo,
      valor: tipo === 'usd' ? formatearUSD(valor) : formatear(valor)
    })),
    formatear(totalFinal)
  );
}
function mostrarResultados(detalles) {
  const html = detalles.map(([titulo, valor, tipo]) => `
    <tr>
      <td>${titulo}</td>
      <td>${tipo === 'usd' ? formatearUSD(valor) : formatear(valor)}</td>
    </tr>`).join('');

  document.getElementById('results').innerHTML = `
    <div style="text-align:center;">
      <p><strong>Total Final:</strong> ${formatear(detalles[detalles.length - 1][1])}</p>
      <div class="botones-detalle">
        <button onclick="mostrarDetalles()" id="toggleBtn" class="styled-btn">Ver detalles</button>
        <button onclick="descargarPDF()" class="styled-btn">Descargar en PDF</button>
        <button onclick="compartirWhatsApp()" class="styled-btn">Compartir por WhatsApp</button>
      </div>
      <div id="detalleResultados" style="display:none;">
        <table class="tabla-detalles">
          <tr><th>Concepto</th><th>Valor</th></tr>
          ${html}
        </table>
      </div>
    </div>
  `;
}

function mostrarDetalles() {
  const tabla = document.getElementById("detalleResultados");
  const btn = document.getElementById("toggleBtn");
  const visible = tabla.style.display === "block";
  tabla.style.display = visible ? "none" : "block";
  btn.textContent = visible ? "Ver detalles" : "Ocultar detalles";
}

function descargarPDF() {
  const detalleDiv = document.getElementById("detalleResultados");
  if (detalleDiv.style.display === "none") mostrarDetalles();
  const contenido = document.getElementById("results").innerHTML;
  const w = window.open('', '_blank', 'width=800,height=600');
  w.document.open();
  w.document.write(`
    <html><head><title>Descargar en PDF</title>
    <style>
      body { font-family: Helvetica; margin: 20px; }
      .tabla-detalles {
        margin: 20px auto;
        border-collapse: collapse;
        width: auto;
        max-width: 600px;
      }
      .tabla-detalles th, .tabla-detalles td {
        padding: 8px 12px;
        border: 1px solid #ddd;
      }
      .tabla-detalles th { background: #f2f2f2; }
      th:first-child, td:first-child { text-align: left; }
      th:nth-child(2), td:nth-child(2) { text-align: right; }
    </style>
    </head><body>${contenido}</body></html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

function compartirWhatsApp() {
  let texto = "¡Hola! Aquí tienes el cálculo de importación de tu vehículo:\n\n";
  document.querySelectorAll("#detalleResultados table tr").forEach(fila => {
    const cols = fila.querySelectorAll("td, th");
    if (cols.length === 2) texto += `${cols[0].innerText}: ${cols[1].innerText}\n`;
  });
  texto += "\nCalculado con SUBASTACARROS.COM 👉 https://comocomprarcarros.com";
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}

function reiniciar() {
  document.getElementById('c1').value = "";
  document.getElementById('c7').value = "";
  document.getElementById('c8').value = "";
  document.getElementById('e2').value = "25.90";
  document.getElementById('vin').value = "otros";
  document.getElementById('tipoVehiculo').value = "TURISMO";
  document.getElementById('año').value = "2006";
  document.getElementById('motor').value = "";
  document.getElementById('results').innerHTML = '';
}

async function guardarHistorial(detallesFormateados, totalFinalFormateado) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const historialRef = db.collection("clients").doc(user.uid).collection("historial");
    const snapshot = await historialRef.orderBy("fecha", "desc").get();

    if (snapshot.size >= 100) {
      const ultimo = snapshot.docs[snapshot.size - 1];
      await historialRef.doc(ultimo.id).delete();
    }

    await historialRef.add({
      nombre: "Sin título",
      fecha: firebase.firestore.FieldValue.serverTimestamp(),
      detalles: detallesFormateados,
      total: totalFinalFormateado
    });

  } catch (error) {
    console.error("❌ Error al guardar historial:", error);
  }
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  obtenerTipoCambioAutomatico();
  obtenerContador();
});
