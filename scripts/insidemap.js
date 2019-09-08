function intersections(array1, array2){
  var intersectionPoints = [];

  for(var i = 0; i < (array1.length - 2); i++){
    for(var j = 0; j < (array2.length - 2); j++){
      if(array1[i][0] < array2[j][0] && array1[i + 1][0] > array2[j][0]
        || array1[i + 1][0] < array2[j][0] && array1[i][0] > array2[j][0]
        || array1[i][0] < array2[j + 1][0] && array1[i + 1][0] > array2[j + 1][0]
        || array1[i + 1][0] < array2[j + 1][0] && array1[i][0] > array2[j + 1][0]){
          if(array1[i][1] < array2[j][1] && array1[i + 1][1] > array2[j][1]
            || array1[i + 1][1] < array2[j][1] && array1[i][1] > array2[j][1]
            || array1[i][1] < array2[j + 1][1] && array1[i + 1][1] > array2[j + 1][1]
            || array1[i + 1][1] < array2[j + 1][1] && array1[i][1] > array2[j + 1][1]){
              intersectionPoints.push(findIntersection(array1[i], array1[i + 1], array2[j], array2[j + 1]));
            }

      }
    }
  }
  return intersectionPoints;
}



function findIntersection(pointAx, pointAy, pointBx, PointBy){
    var a1 = pointAy[1] - pointAx[1];
    var b1 = pointAx[0] - pointAy[0];
    var c1 = a1*pointAx[0] + b1 * pointAx[0];

    var a2 = pointBy[1] - pointBx[1];
    var b2 = pointBx[0] - pointBy[0];
    var c2 = a1*pointBx[0] + b1 * pointBx[0];

    var det = a1*b2 - a2*b1;

    var x = (b2*c1 - b1*c2)/det;
    var y = (a1*c2 - a2*c1)/det;

    var z = [x, y];
    return z;
}
