// const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; OpenStreetMap contributors',
// }).addTo(map);

// locations.forEach((loc) => {
//   L.marker([loc.lat, loc.lng]).addTo(map);
// });
const mapEl = document.getElementById('map');

if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);
  console.log('locations:', locations);

  const map = L.map('map', {
    zoomControl: false,
    touchZoom: false,
    scrollWheelZoom: false,
  }).setView([locations[0].coordinates[1], locations[0].coordinates[0]], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  locations.forEach((loc) => {
    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map)
      .bindPopup(`${loc.description}`);
  });
}
