// jshint esversion: 6

//set div(id=mapdiv) to same width and height like div(id=map)
/*var mapheight= $( "#map" ).height();
var mapwidth = $( "#map" ).width();
console.log("height = " + mapheight + " width = " + mapwidth);
//$("#mapdiv").height(600);
//$("#mapdiv").width(600);

console.log($( "#map" )[0].innerHTML);

*/

const geoJSONtemplate = '{ "type": "FeatureCollection", "features": [{"type": "Feature","properties": {},"geometry": {"type": "LineString","coordinates": []}}]}';

const start_latlng = [52, 9];
//var mapsec = $( "#mapdiv" )[0]
var map = L.map(mapdiv, {
  center: start_latlng,
  zoom: 12
});

//var shapes, used to keep track of the shapes on the map with their IDs
var shapes = [];

var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 13,
  attribution: 'Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors',
  id: "osm"
}).addTo(map);
//'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>
//Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors

var baseMaps = {
  "osm": osm,
};


L.control.layers(baseMaps).addTo(map);





/*
L.DomEvent.on(startBtn, 'click', function() {
       control.spliceWaypoints(0, 1, e.latlng);
       map1.closePopup();
   });

L.DomEvent.on(destBtn, 'click', function() {
    control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
    map1.closePopup();
  });
  */
/**
* @function createRoute
* @desc function that adds a given shape to the map.
* leaning on https://stackoverflow.com/questions/45931963/leaflet-remove-specific-marker
* BE SURE TO HAVE A GLOBAL VARIABLE shapes DECLARED AS AN ARRAY
* @param map the map id of the map
* @param inputCoords the GeoJSON of the shape to be added to the map
* @author f_nieb02@uni-muenster.de
*/
function createRoute(mapdiv, inputCoords){
  var id;
  var geoJSON = JSON.parse(geoJSONtemplate);
  inputCoords = JSON.parse(inputCoords);
  //parse the stringified array from mongoose once again...
  //inputCoords = JSON.parse(inputCoords)
  geoJSON.features[0].geometry.coordinates = inputCoords;

  //choose a fitting id for the current shape
  if (shapes.length < 1) id = 0;
  else id = shapes.length;

  //create a leaflet object from the given coordinates and colors
  var newRoute = new L.GeoJSON(geoJSON);
  newRoute._id = id;

  //add the shape to the map and the shape array.
  map.addLayer(newRoute);
  shapes.push(newRoute);
}

/**
* @function displayUserMap
* @desc gets called when the form updates and displays the entered geoJSON in the map
* @author f_nieb02@uni-muenster.de
*/
function displayUserMap(){
  var input = $('#routeGeoJSONInput').val();

  //parse the text inputCoords
  input = $.trim(input);

  try{
    input = JSON.parse(input);
    removeShape(map, 0);
    createRoute(map, input);
  } catch(error) {
    console.log(error);
    console.log(input);
    //and pretend nothing happened
  }
}

/**
* @function removeShape
* @desc function to remove a given shape object from a given map
* @author f_nieb02@uni-muenster.de
*/
function removeShape(map, id){
  var new_shapes = [];
  shapes.forEach(function(shape) {
    if (shape._id == id) map.removeLayer(shape);
    else new_shapes.push(shape);
  });
  shapes = new_shapes;
}

/**
* @function swapLatLon
* @param coords coordinate tuple to swap the entries of, or Array of coordinate tuples
* @desc calls itself recursively on an array of coordinates until it reaches a coordinate tuple for which it then swaps the two entries.
* @author f_nieb02@uni-muenster.de
* CURRENTLY NOT USED. REMOVE IF IT KEEPS BEING NOT USED
*/
function swapLatLon(coords){
  //look deeper if it appears to be an array of coordinates, call yourself recursively
  if(coords.length > 2 || (Array.isArray(coords[0]) || Array.isArray(coords[1]))){
    var newCoordArray = [];
    coords.forEach(function(element, index, Array){
        newCoordArray.push(swapLatLon(element));
    });
    return newCoordArray;

  }   //swap the two entries if the visited array is just an array of two
  else if(coords.length == 2){
    var newCoords = [];

    newCoords[0] = coords[1];
    newCoords[1] = coords[0];
    return newCoords;
  }   //return an error if none of the above applies
  else {
    TypeError(coords+"is not valid for swapLatLon");
  }
}
