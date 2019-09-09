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

/**
* @function parseArrayString
* @desc parses a string and checks whether it contains a 2-dimensional array of coordinates.
* To be used to examine user input. throws an error if it doesn't contain an array of coordinates like specified.
* If the string contains several coordinate array it only returns the first one.
* @param inputString the string that represents a 2-dimensional array to be parsed. formatting: [[lon,lat], ... ,[lon,lat]]
* @returns array of coordinates if this is what the string represents. exception if otherwise
*/
/**
* @function checkIllegalChars
* @desc helping function, takes string and compares it against list of chars
* @returns true if an illegal character is found in the string
*/
function parseArrayString(inputString){

  function checkIllegalChars(string){
    cantInclude.forEach(function(e){
      if(string.includes()){
        return true;
      }
    });
  }
  //first, match only the text between the square brackets
  inputString = inputString.match(/\[\[.*?\]\]/);

  //the array of strings to look for that can't be included in the input, to prevent any possible injection.
  var cantInclude = [",","\"","\'",")","(","$","\\","/","!"];
  //foreign code,
  if(inputString == "" || inputString == null){
    throw new Error("input string contains no 2d array");
  }
  //check for illegal characters.
  else if (checkIllegalChars(inputString)){
    throw new Error("input string contains illegal characters");
  }
  //everything is okay. use JSON.parse
  else {
    var outputArray = JSON.parse(inputString);
    //now check if every sub-array is 2 elements and numbers
    if(function(){
      return outputArray.forEach(
        //for every sub-array...
        function(subArray){
          //check length of each string
          if(subArray.length != 2) return false;
          //check if they all contain numbers
          if(subArray.some(isNAN)) return false;
        }
      );
      //return true if none of the cases above are the case.
      return true;}) {
      //return the array. it is clean
    return(outputArray);
    } else {throw new Error("input String does not contain 2d-array containing numbers");}
  }
}

/**
* @function findEncounter
* @desc function to find the encounter between two routes
* routes should both contain metadata regarding the user/animal as well as start- and end-time for each route
* @param route1 GeoJSON FEATURE, representing route1.
* @param route2 GeoJSON FEATURE, representing route2.
* @param tolerance maximum distance in meters that can still count as an encounter
* @returns an objec that contains the two points closest to each other as well as their distance
*/
function findEncounter(route1, route2, tolerance){
  route1 = route1.features[0];
  route2 = route2.features[0];
  var closestEncounter = {};

  //initialise the object
  closestEncounter.intersects = null;
  closestEncounter.dist = null;
  closestEncounter.point1 = null;
  closestEncounter.point2 = null;
  closestEncounter.dist = Number.MAX_SAFE_INTEGER;
  //var dist;

  //find intersections
  closestEncounter.intersects = turf.lineIntersect(route1,route2);

  //check distance of every point of line1 to line2
  for(let i = 0; i < route1.geometry.coordinates.length; i++){
    let route1Point = turf.point(route1.geometry.coordinates[i]);
    let distance = turf.pointToLineDistance(route1Point, route2, {units: 'meters'});

    if(distance < closestEncounter.dist){
      closestEncounter.point1 = route1Point;
      closestEncounter.point2 = turf.nearestPointOnLine(route2, route1Point, {units: 'meters'});
      closestEncounter.dist = distance;
      console.log(distance)
    }
  }
  //to be sure we got the closest one, do the same for every point in line 2
  for(let i = 0; i < route2.geometry.coordinates.length; i++){
    let route2Point = turf.point(route2.geometry.coordinates[i]);
    let distance = turf.pointToLineDistance(route2Point, route1, {units: 'meters'});

    if(distance < closestEncounter.dist){
      closestEncounter.point1 = route2Point;
      closestEncounter.point2 = turf.nearestPointOnLine(route1, route2Point, {units: 'meters'});
      closestEncounter.dist = distance;
      console.log(distance);
    }
  }

  //if there are no points close enought to each other, there is no closest encounter
  if(closestEncounter.dist > tolerance){
    closestEncounter.dist = null;
  }
  //if there is an intersection, the distance is obviously 0 (elevation not counting)
  if(closestEncounter.intersects.features.length > 0){
    closestEncounter.dist = 0;
  }
  //if there is no closestEncounter, no points are there either
  if(closestEncounter.dist == null){
    closestEncounter.point1 = null;
    closestEncounter.point2 = null;
  }

  return closestEncounter;
}
