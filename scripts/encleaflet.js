function showEnc(mapdiv, array){
  //array = JSON.parse(array);
  console.log("fererefefereferefrer" + array);
  for(var u = 0; u < array.length; u++){
    L.marker(array[u].coords).bindPopup('user1 : ' + array[u].user1 + 'user2 : ' + array[u].user2).addTo(map);

  }
}
