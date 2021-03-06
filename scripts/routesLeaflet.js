// jshint esversion: 6


// template for turf
const geoJSONtemplate = '{ "type": "FeatureCollection", "features": [{"type": "Feature","properties": {},"geometry": {"type": "LineString","coordinates": []}}]}';

//long lat in map center
const start_latlng = [0 ,0];
//var mapsec = $( "#mapdiv" )[0]
var map = L.map(mapdiv, {
  center: start_latlng,
  zoom: 2
});

//var shapes, used to keep track of the shapes on the map with their IDs
var shapes = [];

// create main layer
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

// add Layers to map
L.control.layers(baseMaps).addTo(map);






/**
* @function createRoute
* @desc function that adds a given shape to the map.
* leaning on https://stackoverflow.com/questions/45931963/leaflet-remove-specific-marker
* BE SURE TO HAVE A GLOBAL VARIABLE shapes DECLARED AS AN ARRAY
* @param map the map id of the map
* @param inputCoords the GeoJSON of the shape to be added to the map
*/
function createRoute(mapdiv, inputCoords){
  var id;
  var geoJSON = JSON.parse(geoJSONtemplate);
  inputCoords = JSON.parse(inputCoords);
  //flip the coordinates to fit geoJSON
  inputCoords = swapLatLon(inputCoords)

  //parse the stringified array from mongoose once again...
  //inputCoords = JSON.parse(inputCoords)
  geoJSON.features[0].geometry.coordinates = inputCoords;

  //choose a fitting id for the current shape
  if (shapes.length < 1) id = 0;
  else id = shapes.length;

  //create a leaflet object from the given coordinates and colors
  var newRoute = new L.GeoJSON(geoJSON);
  newRoute._id = id;
  newRoute.bindPopup("the coordinates are: " +  JSON.stringify(geoJSON.features[0].geometry.coordinates));
  //add the shape to the map and the shape array.
  map.addLayer(newRoute);
  shapes.push(newRoute);
}

/**
* @function displayUserMap
* @desc gets called when the form updates and displays the entered geoJSON in the map
*/
function displayUserMap(){
  var geoJson = JSON.parse(geoJSONtemplate);
  var input = $('#waypoints_input').val();

  //parse the text inputCoords
  input = $.trim(input);

  try{
    removeShape(map, 0);
    createRoute(map, input);
    input = JSON.parse(input);
    geoJson.features[0].geometry.coordinates = input;
    updateMapPosition(geoJson);
  } catch(error) {
    console.log(error)
    //pretend nothing happened
  }
}

/**
* @function updateMapPosition
* @desc pans the map to a new position
* @param route the route to whose center the map pans
*/
function updateMapPosition(route){
  //variable Declarations
  var point;
  var pointLatLng;
  console.log(route)

  //function body
  point = turf.centerOfMass(route);
  point = point.geometry.coordinates;
  pointLatLng = L.latLng(point[0], point[1]);
  //map.panTo(point[0],point[1]);
  map.setView(pointLatLng, 11, {animation: true})
}


/**
* @function removeShape
* @desc function to remove a given shape object from a given map
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
