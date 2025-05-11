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

// Mostrar el formulario sin autenticación
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("content").style.display = "block";
  obtenerTipoCambioAutomatico();
  obtenerContador();
});

function logout() {
  firebase.auth().signOut().then(() => location.reload());
}
function toggleMenu() {
  document.getElementById('mobile-menu-links').classList.toggle('open');
}

// Obtener tipo de cambio
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

// Formateo de moneda
const formatear = v => new Intl.NumberFormat("es-HN", {
  style: "currency", currency: "HNL"
}).format(v);
const formatearUSD = v => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD"
}).format(v);
// Tablas Copart (idénticas a tu calculadora original)
const buyerFees = [
  [50,1],[100,25],[200,60],[300,85],[350,100],[400,125],[450,135],[500,145],
  [550,155],[600,170],[700,195],[800,215],[900,230],[1000,250],[1200,270],
  [1300,285],[1400,300],[1500,315],[1600,330],[1700,350],[1800,370],[2000,390],
  [2400,425],[2500,460],[3000,505],[3500,555],[4000,600],[4500,625],[5000,650],
  [5500,675],[6000,700],[7000,755],[7500,775],[8000,800],[8500,820],[9000,820],
  [10000,850],[11000,850],[11500,860],[12000,875],[12500,890],[13000,890],
  [14000,900],[15000,900]
];

const virtualBidFees = [
  [100,50],[500,65],[1000,85],[1500,95],[2000,110],[4000,125],
  [6000,145],[8000,160],[9000,160],[10000,160],[200000,160]
];

const buscarValor = (tabla, valor) => {
  for (let i = tabla.length - 1; i >= 0; i--) {
    if (valor >= tabla[i][0]) return tabla[i][1];
  }
  return 0;
};
const buscarBuyerFee = c1 => c1 > 15000 ? +(c1 * 0.06).toFixed(2) : buscarValor(buyerFees, c1);
const buscarVirtualBidFee = c1 => c1 > 8000 ? 160 : buscarValor(virtualBidFees, c1);

// FUNCIÓN PRINCIPAL
function calcular() {
  registrarClic();

  const c1 = parseFloat(document.getElementById('c1').value.trim());
  const c7 = parseFloat(document.getElementById('c7').value.trim());
  const c8 = parseFloat(document.getElementById('c8').value.trim());
  const e2 = parseFloat(document.getElementById('e2').value.trim());
  const vin = document.getElementById('vin').value;
  const tipo = document.getElementById('tipoVehiculo').value;
  const año = parseInt(document.getElementById('año').value.trim());
  const motor = document.getElementById('motor').value;

  const usaAmnistia = año <= 2005;

  if (!c1 || !c7 || !c8 || !e2 || !vin || !tipo || !año || (vin === "otros" && tipo === "TURISMO" && !motor)) {
    alert("Por favor completa todos los campos requeridos.");
    return;
  }

  const environmentalFee = 15;
  const gateFee = 115;
  const virtualBidFee = buscarVirtualBidFee(c1);
  const buyerFee = buscarBuyerFee(c1);
  const subastaTotal = c1 + environmentalFee + virtualBidFee + buyerFee + gateFee;

  const envioTotal = c7 + c8;
  const cifUSD = subastaTotal + envioTotal;
  const cifHNL = cifUSD * e2;

  const o3 = 50 * e2;
  const o4 = subastaTotal * 0.015 * e2;
  const base = cifHNL + o3 + o4 + gateFee * e2;

  let dai = 0, isc = 0, isv = 0;
  if (!usaAmnistia) {
    if (vin === "otros") {
      if (tipo === "TURISMO") {
        dai = base * (motor === "1.5 Inferior" ? 0.05 : 0.15);
      } else if (["PICKUP", "MOTO", "CAMION"].includes(tipo)) {
        dai = base * 0.10;
      } else if (tipo === "AGRICOLA") {
        dai = base * 0.05;
      }
    }

    if (tipo !== "AGRICOLA") {
      if (tipo === "MOTO") {
        isc = base * 0.10;
      } else {
        if (cifUSD <= 7000) isc = base * 0.10;
        else if (cifUSD <= 10000) isc = base * 0.15;
        else if (cifUSD <= 20000) isc = base * 0.20;
        else if (cifUSD <= 30000) isc = base * 0.30;
        else isc = base * 0.45;
      }

      isv = (cifHNL + dai + isc + o3 + o4) * 0.15;
    }
  }

  const totalImpuestos = dai + isc + isv;

  let ecotasa = 0;
  if (!usaAmnistia) {
    if (c1 <= 15000) ecotasa = 5000;
    else if (c1 <= 25000) ecotasa = 7000;
    else ecotasa = 10000;
  }

  const aduanero = 4000;
  const votainer = 7500;
  const transferencia = 55 * e2;
  const matricula = (!usaAmnistia && año >= 2006) ? 4000 : 0;
  const fijoAmnistia = usaAmnistia ? 10000 : 0;

  const gastosFijos = fijoAmnistia + aduanero + votainer + transferencia + matricula + ecotasa;
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
    ['ISC', isc, 'hnl'],
    ['ISV', isv, 'hnl'],
    ['TOTAL IMPUESTOS HONDURAS', totalImpuestos, 'hnl'],
    ['ECOTASA', ecotasa, 'hnl'],
    ['ADUANERO', aduanero, 'hnl'],
    ['VOTAINER', votainer, 'hnl'],
    ['TRANSFERENCIA INT.', transferencia, 'hnl'],
    ['MATRÍCULA', matricula, 'hnl'],
    ['PAQUETE AMNISTÍA', fijoAmnistia, 'hnl'],
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
