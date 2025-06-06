maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element in which the SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: lngLat, // starting position [lng, lat]
  zoom: 10 // starting zoom
});

const marker = new maptilersdk.Marker({color: "#EA4335"})
  .setLngLat(lngLat)
  .setPopup(new maptilersdk.Popup()
  .setHTML("<p>Exact location provided after booking</p>"))
  .addTo(map);
