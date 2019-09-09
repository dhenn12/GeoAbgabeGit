// jshint esversion: 6
// jshint browser: true
// jshint node: true
"use strict";

/**
* @function closeTo
* @desc function that takes a value and checks whether it is close to an expected value with a given tolerance
* @param value the value to test
* @param expected the expected value for which to test
* @param tolerance the tolerance between the value and the test
* @returns boolean whether it is close to or not
*/
function closeTo(value, expected, tolerance){
  var difference= Math.abs(expected-value);
  return (difference <= tolerance);
}

QUnit.test( "test parseArrayString", function( assert ) {

  var coords1 = "[[7.59585,52.25807],[7.59798,52.25724],[7.6,52.25783],[7.60048,52.25679],[7.60567,52.2537],[7.60759,52.25441],[7.60925,52.25582],[7.60895,52.25839]]";
  var coords2 = "[12,13]";
  var coords3 = "Hello there!";
  var coords4 = "This is getting out of hand. Now there are two of them! [[7.59585,52.25807],[7.59798,52.25724]] [[7.59585,52.25807],[7.59798,52.25724]";
  var coords5 = "[[12,23] ]; alert('these are not the droids you are looking for'); [ [21,22]]";
  var coords6 = "[[7.59585,52.25807,12],[7.59798,52.25724]]";
  var coords6 = "[['not a number',42],[7.59798,52.25724]]";

  assert.deepEqual(parseArrayString(coords1), [[7.59585,52.25807],[7.59798,52.25724],[7.6,52.25783],[7.60048,52.25679],[7.60567,52.2537],[7.60759,52.25441],[7.60925,52.25582],[7.60895,52.25839]]);
  assert.throws(function(){parseArrayString(coords2);});
  assert.throws(function(){parseArrayString(coords3);});
  assert.deepEqual(parseArrayString(coords4), [[7.59585,52.25807],[7.59798,52.25724]]);
  assert.throws(function(){parseArrayString(coords5);});
  assert.throws(function(){parseArrayString(coords6);});
  assert.throws(function(){parseArrayString(coords7);});
});

QUnit.test( "findEncounter working correctly?", function( assert ) {
  const linestring1 = {"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "LineString","coordinates": [[7.545204162597655,51.94913218923517],[7.6306915283203125,51.9838229175416]]}}]};
  //crossing linestring1 once
  const linestring2 = {"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "LineString","coordinates": [[7.610006332397461,51.95786028112509],[7.578935623168945,51.98292425890197]]}}]};
  //adjacent to linestring1, but not touching
  const linestring3 = {"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "LineString","coordinates": [[7.53387451171875,51.96129815389566],[7.591552734375,51.97028826703529],[7.621936798095703,51.989637331792146]]}}]};

  //function calls
  var test1 = findEncounter(linestring1,linestring2,500).intersects.features[0];
  var test2 = findEncounter(linestring1,linestring3,500).intersects.features;
    //encounter at around [7.59551,51.96955]
  console.log(test2)
  console.log(test2.length)
  assert.ok(closeTo(test1.geometry.coordinates[0], 7.59551, 0.001) && closeTo(test1.geometry.coordinates[1], 51.96955, 0.001), "compared "+test1.geometry.coordinates[0]+","+test1.geometry.coordinates[1]+" with expected 7.59551,51.96955");
  assert.deepEqual(test2.length, 0, "compared "+test2+" with 0")
});

//test swapLatLon
QUnit.test( "swapLatLon working correctly?", function( assert ) {

  var coords1 = ["first", "second"];
  var coords2 = [1,2];
  var coords3 = [0,0];
  var coords4 = [[1,2],[3,4],[5,6]]
  var coords5 = [[[7.59,51.97],[7.60,51.96]],[[7.63,51.96],[7.60,51.97]]]

  assert.deepEqual(swapLatLon(coords1), ["second","first"], "swap of string tuple successful");
  assert.deepEqual(swapLatLon(coords2), [2,1], "swap of integer tuple successful");
  assert.deepEqual(swapLatLon(coords3), [0,0], "swap of identical tuple successful");
  assert.deepEqual(swapLatLon(coords4), [[2,1],[4,3],[6,5]], "swap tuple array successful");
  assert.deepEqual(swapLatLon(coords5), [[[51.97,7.59],[51.96,7.60]],[[51.96,7.63],[51.97,7.60]]])
});
