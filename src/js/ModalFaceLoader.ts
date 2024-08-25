var labelsClean = false;

//create a rounded rectangle based on the context. It's use in this project is for creating labels.
function roundRect(ctx, x, y, w, h, r, borderThickness) {
  //draws a rounded rectangle using coordinates.
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  //fills in text and background of rect.
  ctx.lineWidth = borderThickness;
  ctx.fill();
  ctx.stroke();
  //there is no return, because the 'context' var 'ctx' is a pass-by-reference.
}

//Creates a sprite THREE.js object and returns it. Message is a desired string and parameters is an array  of the parameters for creating a label.
//the sprite moves with the camera.
function makeTextSprite(message, parameters) {
  if (parameters === undefined) parameters = {};
  var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
  var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 100;
  var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
  var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : {
    r: 0,
    g: 0,
    b: 0,
    a: 1.0
  };
  var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : {
    r: 255,
    g: 255,
    b: 255,
    a: 1.0
  };
  var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : {
    r: 0,
    g: 0,
    b: 0,
    a: 1.0
  };

  var spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = 256;
  spriteCanvas.height = 128;
  var context = spriteCanvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;
  var metrics = context.measureText(message);
  var textWidth = metrics.width;

  context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  roundRect(context, borderThickness / 2, borderThickness / 2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8, borderThickness);

  context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
  context.fillText(message, borderThickness, fontsize + borderThickness);

  var texture = new THREE.Texture(spriteCanvas)
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial({
    map: texture
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.6 * fontsize * labelScaleVariable, 0.35 * fontsize * labelScaleVariable, 0.85 * fontsize * labelScaleVariable);
  sprite.material.depthTest = true;
  return sprite;
}



function showAllDots() {
  //only show all dots if a feature point has been recorded.
  if (dotCreated) {
    removeLines();
    centerAllDots();
    cleanUpLabels();
    var ID;
    var radios = document.getElementsByName('Point');



    //you can do this algorithm dot for dot.
    //1 -- find dots that are not null
    //2 -- find location of dots not null
    //3 -- create new dot objects for dots not null. using modalScene

    //1
    var ID;
    var fpX, fpY, fpZ
    var currentFeature;
    for (var i = 0; i < fixedFeaturePointLength; i++) {
      currentFeature = findRowElementFP(i);

      ID = currentFeature.id;
      fpX = currentFeature.xVal;
      document.getElementById("fp-" + ID).style["background-color"] = "initial";
      if (fpX != "") {
        document.getElementById("fp-" + ID).style["background-color"] = "yellow"; //highlights a unique fp that's been recorded
        //2
        fpY = currentFeature.yVal;
        fpZ = currentFeature.zVal;
        //3
        dotsGroup.children[i].children[0].position.x = (fpX / scaleFP);
        dotsGroup.children[i].children[0].position.y = (fpY / scaleFP);
        dotsGroup.children[i].children[0].position.z = (fpZ / scaleFP);
        //include sprites in the function to allow for easy reference
        var sprite = makeTextSprite(" " + (currentFeature.abbrv) + " ", {
          fontsize: 46,
          backgroundColor: {
            r: 100,
            g: 100,
            b: 255,
            a: 1
          }
        });
        sprite.position.x = fpX; //make sure it's not ontop of the points but distinctly close to them.
        sprite.position.y = fpY; //consider scalar multiplication
        sprite.position.z = fpZ;
        if(labelScaleVariable >= .8)
        {
          sprite.position.multiplyScalar(1.15);
          sprite.position.y = fpY;
          sprite.position.x = fpX + 10;
        }
        else
        {
          sprite.position.x =  (parseFloat(sprite.position.x) + labelScaleVariable * 6).toFixed(2);
          sprite.material.depthTest = false;
        }
        marksGroup.add(sprite);
        toggleLandmarks = true;
      }
    }
      scene.add(marksGroup); //you don't have to add the group marksGroup to dotsGroup.
      labelsClean = false;
  } else {
    alert("No feature points yet labeled!");
    toggleVisualizationOff();
  }
}

function showOnlyDots() {
    for (var i = 0; i < fixedFeaturePointLength; i++) {
        currentFeature = findRowElementFP(i);
        
        ID = currentFeature.id;
        fpX = currentFeature.xVal;
        document.getElementById("fp-" + ID).style["background-color"] = "initial";
        if (fpX != "") {
            document.getElementById("fp-" + ID).style["background-color"] = "yellow"; //highlights a unique fp that's been recorded
            //2
            fpY = currentFeature.yVal;
            fpZ = currentFeature.zVal;
            //3
            dotsGroup.children[i].children[0].position.x = (fpX / scaleFP);
            dotsGroup.children[i].children[0].position.y = (fpY / scaleFP);
            dotsGroup.children[i].children[0].position.z = (fpZ / scaleFP);
        }
    }
}

function showDotsForSelectedMeasurement() {
  //only show all dots if a feature point has been recorded.
  if (dotCreated && canvasSceneLoaded) {
    cleanUpLabels();
    centerAllDots();
    var radios = document.getElementsByName('Measurement');
    var measurementId;
    var currentMeasurement;
    var currentFeaturePoint;
    var allFeaturePointsExist = true;
    var iterationPointFound;

    for (var i = 0; i < fixedMeasurementLength; i++) {
      if (radios[i].checked) {
        currentMeasurement = findRowElementMeasurement(i);
        measurementId = i;
        for (var s = 0; s < currentMeasurement.usedFeatures.length; s++) //check if all feature points are in the list!!!
        {
          iterationPointFound = false;
          for (var j = 0; j < fpoints.length; j++) {
            currentFeaturePoint = fpoints[j];
            if ((currentMeasurement.usedFeatures[s] == currentFeaturePoint.id)) //CRITICAL DIFFERENCE
            {
              if (currentFeaturePoint.list == "Y") {
                iterationPointFound = true;
              }
              break;
            }
          }
          if (!iterationPointFound) {
            //missingFeaturePoints.push(currentFeaturePoint);
            allFeaturePointsExist = false;
          }
        }
        if (!allFeaturePointsExist) {
          displayMissingModal("noVisualization");
          return;
        }
      }
    }
    if (currentMeasurement.usedFeatures[0] != "") {
      var ID;
      var fpX, fpY, fpZ
      var currentFeatureNum;
      var tempFP;

      //the order of points for some measurements is incorrect, but we can't change the order of "usedFeatures"... We create another array "linePointsOrder"

      if (currentMeasurement.linePointsOrder != null) //if we have to change the order...
      {
         
        for (var i = 0; i < currentMeasurement.usedFeatures.length; i++) {
          for (var j = 0; j < fixedFeaturePointLength; j++) {
            tempFP = findRowElementFP(j);
            if ((currentMeasurement.linePointsOrder[i] == tempFP.id)) //CRITICAL DIFFERENCE
            {
              currentFeaturePoint = findRowElementFP(j);
                ID = currentFeaturePoint.id;
                fpX = Number(currentFeaturePoint.xVal + xPosition);
              break;
            }
          }
            if (fpX != "") {
                fpY = Number(currentFeaturePoint.yVal + yPosition);
                fpZ = Number(currentFeaturePoint.zVal + zPosition);
            dotsGroup.children[i].children[0].position.x = (fpX / scaleFP);
            dotsGroup.children[i].children[0].position.y = (fpY / scaleFP);
            dotsGroup.children[i].children[0].position.z = (fpZ / scaleFP);
            linePoints.push(new THREE.Vector3(fpX, fpY, fpZ));
            var sprite = makeTextSprite(" " + (currentFeaturePoint.abbrv) + " ", {
              fontsize: 46,
              backgroundColor: {
                r: 100,
                g: 100,
                b: 255,
                a: 1
              }
            });
            sprite.position.x = fpX + 10; //make sure it's not ontop of the points but distinctly close to them.
            sprite.position.y = fpY; //consider scalar multiplication
            sprite.position.z = fpZ;
            if(labelScaleVariable >= .3)
            {
              sprite.position.multiplyScalar(1.15);
              sprite.position.y = fpY;
              sprite.position.x = fpX + 10
            }
                marksGroup.add(sprite);

                //when i == 1, it is the middle point of the angle and we can place the angle value close to it
                //if ((i == 1) && (currentMeasurement.type == "Angles")) {
                //    var angle_sprite = makeTextSprite(" " + (currentMeasurement.value) + " ", {
                //        fontsize: 40,
                //        backgroundColor: {
                //            r: 255,
                //            g: 255,
                //            b: 0,
                //            a: 0.6
                //        }
                //    });
                //    angle_sprite.position.x = fpX + 10; //make sure it's not ontop of the points but distinctly close to them.
                //    angle_sprite.position.y = fpY - 10; //consider scalar multiplication
                //    angle_sprite.position.z = fpZ;
                //    if (labelScaleVariable >= .3) {
                //        angle_sprite.position.multiplyScalar(1.15);
                //        angle_sprite.position.y = fpY - 10;
                //        angle_sprite.position.x = fpX + 10
                //    }
                //    marksGroup.add(angle_sprite);
                //}

          }
        }
      } else {
        //the array linePointsOrder and usedFeatures should have the same length.
        for (var i = 0; i < currentMeasurement.usedFeatures.length; i++) {
          //search for the current feature point
          for (var j = 0; j < fixedFeaturePointLength; j++) {
              tempFP = findRowElementFP(j);
            if (currentMeasurement.usedFeatures[i] == tempFP.id) //CRITICAL DIFFERENCE
            {
                currentFeaturePoint = findRowElementFP(j);
                console.log(currentFeaturePoint);
              ID = currentFeaturePoint.id;
              fpX = Number(currentFeaturePoint.xVal);
              break;
            }
          }
          if (fpX != "") {
              fpY = Number(currentFeaturePoint.yVal);
              fpZ = Number(currentFeaturePoint.zVal);

            dotsGroup.children[i].children[0].position.x = (fpX / scaleFP);
            dotsGroup.children[i].children[0].position.y = (fpY / scaleFP);
            dotsGroup.children[i].children[0].position.z = (fpZ / scaleFP);
            linePoints.push(new THREE.Vector3(fpX, fpY, fpZ));
            var sprite = makeTextSprite(" " + (currentFeaturePoint.abbrv) + " ", {
              fontsize: 46,
              backgroundColor: {
                r: 100,
                g: 100,
                b: 255,
                a: 1
              }
            });
            sprite.position.x = fpX + 10; //make sure it's not ontop of the points but distinctly close to them.
            sprite.position.y = fpY; //consider scalar multiplication
            sprite.position.z = fpZ;
            if(labelScaleVariable >= .3)
            {
              sprite.position.multiplyScalar(1.15);
              sprite.position.y = fpY;
              sprite.position.x = fpX + 10
            }
              marksGroup.add(sprite);

              //when i == 1, it is the middle point of the angle and we can place the angle value close to it
              //if ((i == 1) && (currentMeasurement.type == "Angles")) {
              //    var angle_sprite = makeTextSprite(" " + (currentMeasurement.value) + " ", {
              //        fontsize: 40,
              //        backgroundColor: {
              //            r: 255,
              //            g: 255,
              //            b: 0,
              //            a: 0.6
              //        }
              //    });
              //    angle_sprite.position.x = fpX + 10; //make sure it's not ontop of the points but distinctly close to them.
              //    angle_sprite.position.y = fpY - 10; //consider scalar multiplication
              //    angle_sprite.position.z = fpZ;
              //    if (labelScaleVariable >= .3) {
              //        angle_sprite.position.multiplyScalar(1.15);
              //        angle_sprite.position.y = fpY - 10;
              //        angle_sprite.position.x = fpX + 10
              //    }
              //    marksGroup.add(angle_sprite);
              //}

          }
        }
      }
      scene.add(marksGroup); //you don't have to add the group marksGroup to dotsGroup.
    }
  }
}

function findLinepoints(currentMeasurement) {
  var fpX, fpY, fpZ
  var currentFeaturePoint;
  var tempFP;
  for (var i = 0; i < currentMeasurement.usedFeatures.length; i++) {
    //search for the current feature point
    for (var j = 0; j < fixedFeaturePointLength; j++) {
      tempFP = findRowElementFP(j);
      if (currentMeasurement.usedFeatures[i] == tempFP.id) {
        currentFeaturePoint = findRowElementFP(j);
        fpX = Number(currentFeaturePoint.xVal);
        break;
      }
    }
    if (fpX != "") {
      fpY = Number(currentFeaturePoint.yVal);
      fpZ = Number(currentFeaturePoint.zVal);
      linePoints.push(new THREE.Vector3(fpX, fpY, fpZ));
    }
  }
}

function toggleLabels() {
    if (labelsClean == false) {
        toggleLandmarks = false;
        labelsClean = true;
        cleanUpLabels();
        showOnlyDots();
    }
    else if (labelsClean == true) {
        labelsClean = false;
        showLabels();
    }
}

function showLabels() {
    var ID;
    var fpX, fpY, fpZ;

    for (var i = 4; i < fpoints.length; i++) {
        var currentFeature = fpoints[i];
        ID = currentFeature.id;
        fpX = currentFeature.xVal;
        if (fpX != "") {
            fpY = currentFeature.yVal;
            fpZ = currentFeature.zVal;
            //include sprites in the function to allow for easy reference
            var sprite = makeTextSprite(" " + (currentFeature.abbrv) + " ", {
                fontsize: 46,
                backgroundColor: {
                    r: 100,
                    g: 100,
                    b: 255,
                    a: 1
                }
            });
            sprite.position.x = fpX; //make sure it's not ontop of the points but distinctly close to them.
            sprite.position.y = fpY; //consider scalar multiplication
            sprite.position.z = fpZ;
            if(labelScaleVariable >= .8)
            {
                sprite.position.multiplyScalar(1.15);
                sprite.position.y = fpY;
                sprite.position.x = fpX + 10;
            }
            else
            {
                sprite.position.x = (parseFloat(sprite.position.x) + labelScaleVariable * 6).toFixed(2);
                sprite.material.depthTest = false;
            }
            marksGroup.add(sprite);
            scene.add(marksGroup);
        }
    }
}

//Used to toggle off the feature to display all points.
function cleanUpLabels() {
  if (marksGroup.children.length > 0 && canvasSceneLoaded) {
    centerAllDots();
    /*
    var staticInt = marksGroup.children.length; //using the actual "marksGroup.children.length" in the actual condition while decreasing the length in each iteration makes for buggy code.
    var i = 0;
    i = 0;
    for(i = 0; i < staticInt; i++) //why?
    {
    	marksGroup.children = [];
    }
    */
    if (marksGroup.children.length > 0) {
      for (var i = marksGroup.children.length - 1; i >= 0; i--) {
        var currentObject = marksGroup.children[i];
        marksGroup.remove(currentObject);
        currentObject.geometry.dispose();
        currentObject.material.dispose();
      }
    }
    scene.remove(marksGroup) //there is one last child: the group itself!
  }
}

function centerAllDots() //sets each dot object to 0, 0, 0
{
  for (i = 0; i < dotsGroup.children.length; i++) //remove all green dots from view.
  {
    if (dotsGroup.children[i].children[0].position.x != 0.0) //if the dot is already centered, don't use computing power to re-center it!
    {
      dotsGroup.children[i].children[0].position.x = 0.0;
      dotsGroup.children[i].children[0].position.y = 0.0;
      dotsGroup.children[i].children[0].position.z = 0.0;
    } else {
      continue;
    }
  }
}
