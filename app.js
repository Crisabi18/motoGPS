let rutaActual = null;
let tallerActual = null;

const talleresIniciales = [
  {
    nombre: "Taller Jorge",
    lat: 19.8766952,
    lng: -98.9616700,
    telefono: "5512345678",
    direccion: "Haciendas de Tizayuca",
    horario: "08:00 - 18:00"
  },
  {
    nombre: "Taller Casa",
    lat: 19.8782307,
    lng: -98.9306489,
    telefono: "7713824121",
    direccion: "Casas Quma",
    horario: "08:00 - 18:00"
  }
];


if(
  !localStorage.getItem(
    "talleres"
  )
){

  localStorage.setItem(
    "talleres",
    JSON.stringify(
      talleresIniciales
    )
  );

}

function obtenerTalleres(){

  return JSON.parse(
    localStorage.getItem(
      "talleres"
    )
  ) || [];

}

const talleres =
obtenerTalleres();
let ultimaLat = 0;
let ultimaLng = 0;

// ======================
// BUSCAR TALLERES
// ======================

function buscarTalleres() {

  document.getElementById("resultado").innerHTML =
    "<p>📍 Obteniendo ubicación...</p>";

  navigator.geolocation.getCurrentPosition(
    mostrarTalleres,
    mostrarError,
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );

}

// ======================
// DISTANCIA
// ======================

function calcularDistancia(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat =
    (lat2 - lat1) * Math.PI / 180;

  const dLon =
    (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) *
    Math.sin(dLat / 2) +

    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *

    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;

}

// ======================
// MOSTRAR TALLERES
// ======================

function mostrarTalleres(posicion) {

  ultimaLat =
    posicion.coords.latitude;

  ultimaLng =
    posicion.coords.longitude;

  const talleres =
  obtenerTalleres();

  const lista = talleres.map(taller => {

    const distancia =
      calcularDistancia(
        ultimaLat,
        ultimaLng,
        taller.lat,
        taller.lng
      );

    return {
      ...taller,
      distancia
    };

  });

  lista.sort(
    (a,b) => a.distancia - b.distancia
  );

  let html = "";

  lista.forEach(taller => {

    const distanciaTexto =
      taller.distancia < 1
      ? Math.round(
          taller.distancia * 1000
        ) + " m"
      : taller.distancia.toFixed(2) +
        " km";

    html += `

      <div class="cardTaller">

        <h3>🔧 ${taller.nombre}</h3>

        <p>📏 ${distanciaTexto}</p>

        <button
          onclick="toggleInfo('${taller.nombre}')"
        >
          Ver más
        </button>

        <div
          id="detalle-${taller.nombre}"
          style="
            display:none;
            margin-top:15px;
          ">
        </div>

      </div>


    `;

  });

  document.getElementById(
    "resultado"
  ).innerHTML = html;

}


// guuardar taller

function obtenerUbicacion(){

navigator.geolocation.getCurrentPosition(
posicion=>{

document.getElementById(
"lat"
).value=
posicion.coords.latitude;

document.getElementById(
"lng"
).value=
posicion.coords.longitude;

});

}

function guardarTaller(){

const dias = [];

document
.querySelectorAll(
'.checks input[type="checkbox"]'
)
.forEach(check=>{

if(
check.checked &&
check.value
){
dias.push(
check.value
);
}

});

const tallerNuevo = {

nombre:
document.getElementById(
"nombre"
).value,

propietario:
document.getElementById(
"propietario"
).value,

telefono:
document.getElementById(
"telefono"
).value,

lat:
document.getElementById(
"lat"
).value,

lng:
document.getElementById(
"lng"
).value,

dias,

apertura:
document.getElementById(
"apertura"
).value,

cierre:
document.getElementById(
"cierre"
).value,

domicilio:
document.getElementById(
"domicilio"
).checked,

remolque:
document.getElementById(
"remolque"
).checked,

auxilio:
document.getElementById(
"auxilio"
).checked,

cobertura:
document.getElementById(
"cobertura"
).value

};

document.getElementById(
"json"
).textContent =
JSON.stringify(
tallerNuevo,
null,
2
);

console.log(tallerNuevo);



talleres.push(
  tallerNuevo
);

localStorage.setItem(
  "talleres",
  JSON.stringify(
    talleres
  )
);

alert(
  "✅ Taller registrado"
);

window.location.href =
  "usuario.html";

}

// ======================
// DETALLE
// ======================

function toggleInfo(nombre){

  const detalle =
    document.getElementById(
      `detalle-${nombre}`
    );

  const taller =
    talleres.find(
      t => t.nombre === nombre
    );

  if(
    detalle.style.display ===
    "block"
  ){

    detalle.style.display =
      "none";

    detalle.innerHTML = "";

    return;

  }

  detalle.innerHTML = `

    <p>
      📍 ${taller.direccion}
    </p>

    <p>
      📞 ${taller.telefono}
    </p>

    <p>
      ⏰ ${taller.horario}
    </p>

    <div
      style="
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:10px;
      "
    >

      <button
        onclick="navegar('${taller.nombre}')"
      >
        🧭 Navegar
      </button>

      <button
        onclick="auxilio('${taller.nombre}')"
      >
        🚚 Auxilio
      </button>

    </div>

  `;

  detalle.style.display =
    "block";

}

// ======================
// NAVEGAR
// ======================

async function navegar(nombre){

  const taller =
    talleres.find(
      t => t.nombre === nombre
    );

  document.getElementById(
    "resultado"
  ).innerHTML = `
    <h2>🧭 Calculando ruta...</h2>
  `;

  try {

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${ultimaLng},${ultimaLat};` +
      `${taller.lng},${taller.lat}` +
      `?overview=full&geometries=geojson`;

    const respuesta =
      await fetch(url);

    const datos =
      await respuesta.json();

    const distanciaRuta =
      datos.routes[0].distance;

    const tiempoRuta =
      datos.routes[0].duration;

    const metros =
      Math.round(distanciaRuta);

    const minutos =
      Math.round(
        tiempoRuta / 60
      );

    const coords =
      datos.routes[0]
      .geometry.coordinates;

    document.getElementById(
      "resultado"
    ).innerHTML = `

      <h2>🧭 Navegación</h2>

      <h3>${taller.nombre}</h3>

      <p>📏 ${metros} m</p>

      <p>⏱️ ${minutos} min</p>

      <div
        id="mapa"
        style="
          height:500px;
          border-radius:15px;
          margin-top:15px;
        ">
      </div>

      <br>

      <button
        onclick="buscarTalleres()"
      >
        ← Volver a talleres
      </button>

    `;

    const mapa =
      L.map("mapa");

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "© OpenStreetMap"
      }
    ).addTo(mapa);

    L.marker([
      ultimaLat,
      ultimaLng
    ])
      .addTo(mapa)
      .bindPopup("🏍️ Tú");

    L.marker([
      taller.lat,
      taller.lng
    ])
      .addTo(mapa)
      .bindPopup(
        `🔧 ${taller.nombre}`
      );

    const ruta = coords.map(
      punto => [
        punto[1],
        punto[0]
      ]
    );

    const linea =
      L.polyline(
        ruta,
        {
          color: "red",
          weight: 5
        }
      ).addTo(mapa);

    mapa.fitBounds(
      linea.getBounds()
    );

  }
  catch(error){

    console.error(error);

    alert(
      "No se pudo obtener la ruta."
    );

  }

}

// ======================
// AUXILIO
// ======================

function auxilio(nombre){

  const taller =
    talleres.find(
      t => t.nombre === nombre
    );

  const mensaje =
    encodeURIComponent(
      "🏍️ AUXILIO\n\n" +
      "Necesito asistencia.\n\n" +
      "Ubicación:\n" +
      ultimaLat +
      "," +
      ultimaLng
    );

  location.href =
    `sms:${taller.telefono}?body=${mensaje}`;

}

// ======================
// ERROR GPS
// ======================

function mostrarError(error){

  console.error(error);

  alert(
    "Código: " +
    error.code +
    "\n\n" +
    error.message
  );

}