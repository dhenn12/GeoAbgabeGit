// showing each encounter on the Map
function showEnc(mapdiv, array){
  for(var u = 0; u < array.length; u++){
    L.marker(array[u].coords[0].geometry.coordinates).bindPopup('User : ' + array[u].user1 + '<br> might meet User: ' + array[u].user2 + '<br> Link to share: <a href=/routes/shareroute/' + array[u]._id +  '>Here').addTo(map);

  }
}
