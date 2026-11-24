// Base local de talleres
const talleres = [
  {
    nombre: "Taller Jorge",
    lat: 19.8766952,
    lng: -98.9616700,
    telefono: "5512345678"
  }
];

function findMe() {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta GPS");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    mostrarTallerMasCercano,
    mostrarError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// Distancia entre dos coordenadas (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function mostrarTallerMasCercano(posicion) {

  const miLat = posicion.coords.latitude;
  const miLng = posicion.coords.longitude;

  console.log(posicion.coords);

  let tallerMasCercano = null;
  let distanciaMinima = Infinity;

  talleres.forEach(taller => {

    const distancia = calcularDistancia(
      miLat,
      miLng,
      taller.lat,
      taller.lng
    );

    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      tallerMasCercano = taller;
    }
  });

  document.getElementById("resultado").innerHTML = `
    <h3>🔧 Taller más cercano</h3>

    <p><strong>${tallerMasCercano.nombre}</strong></p>

    <p>📏 ${distanciaMinima.toFixed(2)} km</p>

    <p>📞 ${tallerMasCercano.telefono}</p>

    <hr>

    <p>📍 Tu ubicación:</p>

    <p>${miLat.toFixed(6)}, ${miLng.toFixed(6)}</p>
  `;
}

function mostrarError(error) {
  console.log(error);
  alert(`
Código: ${error.code}
Mensaje: ${error.message}
  `);
}