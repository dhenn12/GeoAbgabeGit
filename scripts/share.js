/**
* @function encShared
* @desc adds a single marker to map
*/
function encShared(obj){
  L.marker(obj.coords[0].geometry.coordinates).bindPopup('User : ' + obj.user1 + '<br> might meet User: ' + obj.user2).addTo(map);
}
