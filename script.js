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

// Funciones auxiliares y tablas de fees
const formatear = v => new Intl.NumberFormat("es-HN", {style: "currency", currency: "HNL"}).format(v);
const formatearUSD = v => new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(v);
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
  for (let i = tabla.length - 1; i >= 0; i--) if (valor >= tabla[i][0]) return tabla[i][1];
  return 0;
};
const buscarBuyerFee = c1 => c1 > 15000 ? +(c1 * 0.06).toFixed(2) : buscarValor(buyerFees, c1);
const buscarVirtualBidFee = c1 => c1 > 8000 ? 160 : buscarValor(virtualBidFees, c1);

// Carga inicial y configuración de formulario
document.addEventListener("DOMContentLoaded", () => {
  // Mostrar contenido
  document.getElementById("content").style.display = "block";
  // Obtener datos externos
  obtenerTipoCambioAutomatico();
  obtenerContador();
  // Configurar ocultar motor según híbrido
  const hibridoSelect = document.getElementById("hibrido");
  const motorGroup = document.getElementById("grupoMotor");
  const manejarMotor = () => {
    if (hibridoSelect.value === "si") {
      motorGroup.style.display = "none";
      document.getElementById("motor").value = "";
    } else {
      motorGroup.style.display = "block";
    }
  };
  hibridoSelect.addEventListener("change", manejarMotor);
  manejarMotor(); // aplicar al cargar
});

function logout() {
  firebase.auth().signOut().then(() => location.reload());
}
function toggleMenu() {
  document.getElementById('mobile-menu-links').classList.toggle('open');
}

// Fetch tipo de cambio
async function obtenerTipoCambioAutomatico() {
  try {
    const res = await fetch("https://subastacar-bch-api.onrender.com/api/tipo-cambio-bch");
    const json = await res.json();
    if (json.valor) {
      const e2 = document.getElementById("e2");
      e2.value = json.valor;
      e2.readOnly = true;
    }
  } catch(e) { console.error(e); }
}

// Contador de clics
const endpoint = "https://contador-clics-backend.onrender.com/contador";
async function obtenerContador() {
  try {
    const res = await fetch(endpoint);
    const {clics} = await res.json();
    document.getElementById('contadorClics').textContent = `Cálculos: ${clics}`;
  } catch(e) { console.error(e); }
}
async function registrarClic() {
  try {
    const res = await fetch(endpoint, {method:"POST"});
    const {clics} = await res.json();
    document.getElementById('contadorClics').textContent = `Cálculos: ${clics}`;
  } catch(e) { console.error(e); }
}

// Función principal de cálculo
def function calcular() {
  registrarClic();
  // Leer inputs
  const c1 = parseFloat(document.getElementById('c1').value) || 0;
  const c7 = parseFloat(document.getElementById('c7').value) || 0;
  const c8 = parseFloat(document.getElementById('c8').value) || 0;
  const e2 = parseFloat(document.getElementById('e2').value) || 0;
  const vin = document.getElementById('vin').value;
  const tipo = document.getElementById('tipoVehiculo').value;
  const año = parseInt(document.getElementById('año').value,10);
  const motor = document.getElementById('motor').value;
  const esHibrido = document.getElementById('hibrido').value === 'si';
  const usaAmnistia = año <= 2005;
  // Validación básica
  if (!c1||!c7||!c8||!e2||!vin||!tipo||(tipo==='TURISMO'&&!esHibrido&&!motor)) {
    return alert('Completa todos los campos.');
  }
  // Bases
  const environmentalFee=15, gateFee=115;
  const vf=buscarVirtualBidFee(c1), bf=buscarBuyerFee(c1);
  const subastaTotal=c1+environmentalFee+vf+bf+gateFee;
  const envioTotal=c7+c8, cifUSD=subastaTotal+envioTotal;
  const cifHNL=cifUSD*e2;
  const o3=50*e2, o4=subastaTotal*0.015*e2;
  const base=cifHNL+o3+o4+gateFee*e2;
  // Impuestos
  let dai=0, isc=0, isv=0;
  if (!usaAmnistia && !esHibrido) {
    // DAI
    if (vin==='otros') {
      if (tipo==='TURISMO') dai=base*(motor==='1.5 Inferior'?0.05:0.15);
      else if (['PICKUP','CAMION','MOTO'].includes(tipo)) dai=base*0.10;
      else if (tipo==='AGRICOLA') dai=base*0.05;
    }
    // ISC exento pick-up, camión, maquinaria
    if (!['PICKUP','CAMION','AGRICOLA'].includes(tipo)) {
      if (tipo==='MOTO') isc=base*0.10;
      else if (cifUSD<=7000) isc=base*0.10;
      else if (cifUSD<=10000) isc=base*0.15;
      else if (cifUSD<=20000) isc=base*0.20;
      else if (cifUSD<=30000) isc=base*0.30;
      else isc=base*0.45;
    }
  }
  // ISV: exento maquinaria agrícola y hibridos
  if (!esHibrido && tipo!=='AGRICOLA') {
    isv=(cifHNL+dai+isc+o3+o4)*0.15;
  }
  // Ecotasa
  let ecotasa=0;
  if (!usaAmnistia && !esHibrido) ecotasa = c1<=15000?5000:c1<=25000?7000:10000;
  // Gastos fijos
  const aduanero=4000, votainer=7500, transferencia=55*e2;
  const matricula=(!usaAmnistia&&año>=2006)?4000:0;
  const fijoAmnistia=usaAmnistia?10000:0;
  const gastosFijos=fijoAmnistia+aduanero+votainer+transferencia+matricula+ecotasa;
  // Total final
  const totalFinal=cifHNL+dai+isc+isv+gastosFijos;
  // Detalles
  const detalles=[
    ['MONTO DE OFERTA',c1,'usd'],['ENVIRONMENTAL FEE',environmentalFee,'usd'],
    ['VIRTUAL BID FEE',vf,'usd'],['BUYER FEE',bf,'usd'],['GATE FEE',gateFee,'usd'],
    ['TOTAL PRECIO SUBASTA',subastaTotal,'usd'],['VALOR DE BARCO',c7,'usd'],
    ['PRECIO DE GRÚA',c8,'usd'],['TOTAL ENVÍO MARÍTIMO',envioTotal,'usd'],
    ['TOTAL CIF EN USD',cifUSD,'usd'],['TOTAL CIF EN HNL',cifHNL,'hnl'],
    ['DAI',dai,'hnl'],['ISC',isc,'hnl'],['ISV',isv,'hnl'],
    ['TOTAL IMPUESTOS HONDURAS',dai+isc+isv,'hnl'],['ECOTASA',ecotasa,'hnl'],
    ['ADUANERO',aduanero,'hnl'],['VOTAINER',votainer,'hnl'],['TRANSFERENCIA INT.',transferencia,'hnl'],
    ['MATRÍCULA',matricula,'hnl'],['PAQUETE AMNISTÍA',fijoAmnistia,'hnl'],
    ['TOTAL GASTOS FIJOS',gastosFijos,'hnl'],['TOTAL FINAL',totalFinal,'hnl']
  ];
  mostrarResultados(detalles);
  guardarHistorial(detalles.map(([t,v,un])=>({titulo:t,valor:un==='usd'?formatearUSD(v):formatear(v)})),formatear(totalFinal));
}

// Renderizado y utilidades
function mostrarResultados(detalles) {
  const html=detalles.map(([t,v,un])=>`<tr><td>${t}</td><td>${un==='usd'?formatearUSD(v):formatear(v)}</td></tr>`).join('');
  document.getElementById('results').innerHTML=`<div style="text-align:center;"><p><strong>Total Final:</strong> ${formatear(detalles.slice(-1)[0][1])}</p><div class="botones-detalle"><button onclick="mostrarDetalles()" id="toggleBtn" class="styled-btn">Ver detalles</button><button onclick="descargarPDF()" class="styled-btn">Descargar en PDF</button><button onclick="compartirWhatsApp()" class="styled-btn">Compartir por WhatsApp</button></div><div id="detalleResultados" style="display:none;"><table class="tabla-detalles"><tr><th>Concepto</th><th>Valor</th></tr>${html}</table></div></div>`;
}
function mostrarDetalles(){const det=document.getElementById('detalleResultados'),btn=document.getElementById('toggleBtn'),show=det.style.display==='block';det.style.display=show?'none':'block';btn.textContent=show?'Ver detalles':'Ocultar detalles';}
function descargarPDF(){const det=document.getElementById('detalleResultados');if(det.style.display==='none')mostrarDetalles();const content=document.getElementById('results').innerHTML,w=window.open('','_blank','width=800,height=600');w.document.write(`<html><head><title>PDF</title><style>body{font-family:Helvetica;margin:20px;} .tabla-detalles{margin:20px auto;border-collapse:collapse;width:100%;max-width:600px;} .tabla-detalles th,.tabla-detalles td{padding:8px 12px;border:1px solid #ddd;} .tabla-detalles th{background:#f2f2f2;} th:first-child,td:first-child{text-align:left;} th:last-child,td:last-child{text-align:right;}</style></head><body>${content}</body></html>`);w.document.close();setTimeout(()=>w.print(),500);}
function compartirWhatsApp(){let txt="¡Hola! Cálculo de importación:\n\n";document.querySelectorAll('#detalleResultados table tr').forEach(r=>{const c=r.querySelectorAll('td,th');if(c.length===2)txt+=`${c[0].innerText}: ${c[1].innerText}\n`;});window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,'_blank');}
function reiniciar(){['c1','c7','c8','e2','vin','tipoVehiculo','año','motor'].forEach(id=>{const el=document.getElementById(id);if(el.tagName==='SELECT')el.selectedIndex=0;else el.value=id==='e2'?'25.90':'';});document.getElementById('hibrido').value='no';document.getElementById('results').innerHTML='';const motorGroup=document.getElementById('grupoMotor');motorGroup.style.display='block';}
async function guardarHistorial(detalles,total){const user=auth.currentUser;if(!user)return;try{const ref=db.collection('clients').doc(user.uid).collection('historial'),snap=await ref.orderBy('fecha','desc').get();if(snap.size>=100)await ref.doc(snap.docs.pop().id).delete();await ref.add({nombre:'Sin título',fecha:firebase.firestore.FieldValue.serverTimestamp(),detalles,total});}catch(e){console.error('Error guardando historial:',e);} }
