var input = document.getElementById('starttime_input');
var picker = new Picker(input, {
  controls : true,
  format: 'YYYY/MM/DD HH:mm',
});

var input2 = document.getElementById('endtime_input');
var picker = new Picker(input2, {
  controls : true,
  format: 'YYYY/MM/DD HH:mm',
});
//const start_latlng1 = [57.74, 11.94];

/*
var map = L.map(mapdiv, {
  center: start_latlng1,
  zoom: 12
});

L.Routing.control({
  waypoints: [
    L.latLng(57.74, 11.94),
    L.latLng(57.6792, 11.949)
  ]
}).addTo(map);
*/
