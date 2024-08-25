let maxPointsInMeasurement = 20; //Temporary; replace this later

// For a given button "?" on the features list, find the assocaited feature point according to the number to the right of the button id.
let reply_click_fp = (feature_btn: any): void => {
    var currentFeature;

    for (var i = 0; i < fixedFeaturePointLength; i++) {
        currentFeature = findRowElementFP(i);
        if (feature_btn == ("fp-btn" + currentFeature.id)) {
            document.getElementById("featureName").innerHTML = currentFeature.name;
            document.getElementById("featureDescription").innerHTML = currentFeature.description;
            document.getElementById("featureReferences").innerHTML = currentFeature.references;
            document.getElementById("featureImage").src = "";
            document.getElementById("featureImage").src = "images/" + currentFeature.imageFile;
            //used jQuery to display modal.
            $(document).ready(function() {
                $("#featureModal").modal("show");
            });
            break;
        }
    }
}

// For a given button "?" on the measurements list, find the assocaited measurement according to the number to the right of the button id.
let reply_click_measurement = (measurement_btn: any): void => {
    var currentMeasurement;

    for (var i = 0; i < fixedMeasurementLength; i++) {
        currentMeasurement = findRowElementMeasurement(i);
        if (measurement_btn == ("measurement-btn" + currentMeasurement.id)) {
            document.getElementById("measurementName").innerHTML = currentMeasurement.name;
            document.getElementById("measurementDescription").innerHTML = currentMeasurement.description;
            document.getElementById("measurementImage").src = "";
            document.getElementById("measurementImage").src = "images/" + currentMeasurement.imageFile;
            //document.getElementById("measurementFormula").innerHTML = currentMeasurement.formula;
            //document.getElementById("measurementReferences").innerHTML = currentMeasurement.references;
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            $(document).ready(function(){ //used jQuery to display modal.
            	$("#measurementModal").modal("show");
            });
            break;
        }
    }
}

let reply_click_calculate = (calculate_btn: any): void => {
    for (var i = 0; i < fixedMeasurementLength; i++) {
        var currentMeasurement = findRowElementMeasurement(i);
        if (calculate_btn == ("calculate-btn" + currentMeasurement.id)) {
            computeMeasurement(currentMeasurement);
            break;
        }
    }
}

// When you click on a radio from the features list, this displays the green dot for the location recorded for an FP.
let placeDotForSelectedFeature = (): void => {
    var divString = "Measurements involved: ";
    highlightedMeasurements = [];
    removeHighlights();
    var radiosM = document.getElementsByName('Measurement');
    for(var i = 0; i < fixedMeasurementLength; i++)
    {
	if (radiosM[i].checked) {
	    radiosM[i].checked = false;
	    break;
	}
    }
    toggleCleanup("feature");
    var ID, numberId;
    var radios = document.getElementsByName('Point');
    var currentFeature;
    var currentMeasurement;
    for (var i = 0; i < fixedFeaturePointLength; i++) {
	if (radios[i].checked) {
	    currentFeature = findRowElementFP(i);
	    break;
	}
    }
    for(var i = 0; i < currentFeature.usedInMeasurements.length; i++)
    {
	for(var j = 0; j < fixedMeasurementLength; j++)
	{
	    currentMeasurement = findRowElementMeasurement(j);
	    if(currentMeasurement.id == currentFeature.usedInMeasurements[i])
	    {
		document.getElementById("measurement-" + currentMeasurement.id).style["background-color"] = "skyblue";
		highlightedMeasurements.push(currentMeasurement.name);
	    }
	}
    }
    if(canvasSceneLoaded)
    {
	if(currentFeature.cameraX) //change the camera according to the current feature's values. The camera should always point to the center of the model.
	{
	    camera.position.x = currentFeature.cameraX;
	    camera.position.y = currentFeature.cameraY;
	    camera.position.z = currentFeature.cameraZ;
	}
	//display one feature point using data from stored coordinates.
	dotsGroup.children[0].children[0].position.x = currentFeature.xVal + xPosition;
	dotsGroup.children[0].children[0].position.y = currentFeature.yVal + yPosition;
	dotsGroup.children[0].children[0].position.z = currentFeature.zVal + zPosition;
	//The reason why we only manipulate four is because four is the maximum number of FPs in any measurement as I am writing this, and when you click on a radio for a measurement, all of the FPs are also displayed. And so, these need to be wiped.
	dotsGroup.children[1].children[0].position.x = 0.0;
	dotsGroup.children[1].children[0].position.y = 0.0;
	dotsGroup.children[1].children[0].position.z = 0.0;

	dotsGroup.children[2].children[0].position.x = 0.0;
	dotsGroup.children[2].children[0].position.y = 0.0;
	dotsGroup.children[2].children[0].position.z = 0.0;

	dotsGroup.children[3].children[0].position.x = 0.0;
	dotsGroup.children[3].children[0].position.y = 0.0;
	dotsGroup.children[3].children[0].position.z = 0.0;
    }
    var uniqueNames = [];
    $.each(highlightedMeasurements, function(i, el){
	if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    var i = 0;
    if(uniqueNames.length > 3)
    {
	i += (uniqueNames.length - 2);
    }
    for(i; i < uniqueNames.length; i++)
    {
	if(i == uniqueNames.length - 1) //end
	{
	    divString += uniqueNames[i] + "."
	}
	else
	{
	    divString += uniqueNames[i] + ", ";
	}
    }
    if(uniqueNames.length > 3)
    {
	divString += " Includes many others measurements...";
    }
    if(uniqueNames.length == 0)
    {
	divString += " currently none.";
    }
    document.getElementById("highlightedMs").innerHTML = divString;
    document.getElementById("highlightedMs").style["visibility"] = "visible";
    if (currentFeature.type != "Points") {
	document.getElementById("highlightedMs").style["visibility"] = "hidden";
    }
}

let removeLines = (): void => {
    linePoints = [];
    var currentObject;
    if(lineGroup.children.length > 0)
    {
	for(var i = lineGroup.children.length - 1; i >= 0 ; i--)
	{
	    var currentObject = lineGroup.children[i];
	    lineGroup.remove(currentObject);
	    currentObject.geometry.dispose();
	    currentObject.material.dispose();
	}
    }
}

// When you click on a radio from the measurement list, if all of the FPs are in the list and if it has data for its lines, it displays the FPs and the lines for the measurement.
let updatePointsForSelectedMeasurement = (): void => {
    if (xPosition != 0 || yPosition != 0 || zPosition != 0) {
	//3D Model has been moved. Resetting its position. Please mark the location again.
	reset3dModelLocation(faceGroup);
    }
    highlightedFeaturePoints = [];
    missingFeaturePoints = [];
    toggleCleanup("measurement");
    removeHighlightsM();
    var radiosF = document.getElementsByName('Point');
    var divString = "Features involved: ";
    for(var i = 0; i < fixedFeaturePointLength; i++)
    {
	if (radiosF[i].checked) {
	    radiosF[i].checked = false;
	    break;
	}
    }
    var ID;
    allPointsEntered = false;
    var alertString = "";
    ifMeasurementRadioSelected = true;
    var currentMeasurement = null;
    //Cleans the 'background color' before the feature point radio buttons
    var radios = document.getElementsByName('Measurement');
    for (var i = 0; i < radios.length; i++) {
	if (radios[i].checked) {
	    currentMeasurement = findRowElementMeasurement(i);
	    index = i;
	    break;
	}
    }
    if(currentMeasurement == null)
    {
	alert("No measurement selected");
	return;
    }
    else
    {
	var featureOfIndex;
	var requiredPoints = [];
	var currentFP;
	for(var i = 0; i < currentMeasurement.usedFeatures.length; i++) //Go through all of the points and highlight the feature point "divs" and set the position of a point on the scene to the FP
	{
	    if(currentMeasurement.usedFeatures[0] != "") //checks if the usedFeatures array is empty.
	    {
		for(var j = 0; j < fpoints.length; j++)
		{
		    if(fpoints[j].id == currentMeasurement.usedFeatures[i])
		    {
			currentFP = fpoints[j];
		    }
		}
		if(currentFP.list == "Y")
		{
		    highlightedFeaturePoints.push(currentFP.name);
		    document.getElementById("fp-" + currentMeasurement.usedFeatures[i]).style["background-color"] = "skyblue";
		    //all FPs displayed for a measurement are done in the showDotsForSelectedMeasurement() function.
		}
		else
		{
		    requiredPoints.push(currentFP);
		}
	    }
	    else
	    {
		centerAllDots();
	    }
	}
	//If all points in usedFeatures aren't being used, alert the user and do nothing else!
	if(requiredPoints.length > 0)
	{
	    missingFeaturePoints = requiredPoints;
	    displayMissingModal("noVisualization");
	}
    }
    //If all points in usedFeatures are being used, display measurement visualization!
    if(alertString == "")
    {
	if(currentMeasurement.cameraX)//change the camera according to the current feature's values. The camera should always point to the center of the model.
	{
	    camera.position.x = currentMeasurement.cameraX;
	    camera.position.y = currentMeasurement.cameraY;
	    camera.position.z = currentMeasurement.cameraZ;
	}
	showDotsForSelectedMeasurement();
	displayLines(currentMeasurement);
	//uses the array linePoints, which is filled up in showDotsForSelectedMeasurement() in ModalFaceLoader.js
    }

    //create a string that displays which points are being used...
    for(var i = 0; i < highlightedFeaturePoints.length; i++)
    {
	if(i == highlightedFeaturePoints.length - 1) //end
	{
	    divString += highlightedFeaturePoints[i]+ "."
	}
	else
	{
	    divString += highlightedFeaturePoints[i]+ ", ";
	}
    }
    if(highlightedFeaturePoints.length == 0)
    {
	divString += " currently none.";
    }
    document.getElementById("highlightedFPs").innerHTML = divString;
    document.getElementById("highlightedFPs").style["visibility"] = "visible"
}

let cylinderMesh = (pointX: number, pointY: number, colorChosen: number): void => {
    var direction = new THREE.Vector3().subVectors(pointY, pointX);
    var orientation = new THREE.Matrix4();
    orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
		                                 0, 0, 1, 0,
		                                 0, -1, 0, 0,
		                                 0, 0, 0, 1));
    var edgeGeometry = new THREE.CylinderGeometry(.8, .8, direction.length(), 8, 1);
    var edge = new THREE.Mesh(edgeGeometry,  new THREE.LineBasicMaterial({color: colorChosen}));
    edge.applyMatrix(orientation);
    // position based on midpoints - there may be a better solution than this
    edge.position.x = (pointY.x + pointX.x) / 2;
    edge.position.y = (pointY.y + pointX.y) / 2;
    edge.position.z = (pointY.z + pointX.z) / 2;
    return edge;
}

// This function is used to optimize surface distance lines.
let cylinderMeshSurface = (pointX: number, pointY: number, colorChosen: number, directionLength: number): void => { 
    var orientation = new THREE.Matrix4();
    orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
		                                 0, 0, 1, 0,
		                                 0, -1, 0, 0,
		                                 0, 0, 0, 1));
    var edgeGeometry = new THREE.CylinderGeometry(.8, .8, directionLength, 8, 1);
    var edge = new THREE.Mesh(edgeGeometry,  new THREE.LineBasicMaterial({color: colorChosen}));
    edge.applyMatrix(orientation);
    // position based on midpoints - there may be a better solution than this
    edge.position.x = (pointY.x + pointX.x) / 2;
    edge.position.y = (pointY.y + pointX.y) / 2;
    edge.position.z = (pointY.z + pointX.z) / 2;
    return edge;
}

// This function removes some of the distance at the endpoints to indicate a distance.
let cylinderMeshMeasurements = (pointX: number, pointY: number, colorChosen: number, direction: number): void => {
    //the .extend jQuery methods clone an object without allowing references
    largerValVector = $.extend(true,{}, pointX);
    smallerValVector = $.extend(true,{}, pointY);
    if(direction == 'y')
    {
	largerValVector.y = largerValVector.y - 5;
	smallerValVector.y = smallerValVector.y + 5;
    }
    if(direction == 'x')
    {
	smallerValVector.x = smallerValVector.x - 5;
	largerValVector.x = largerValVector.x + 5;
    }
    var direction = new THREE.Vector3().subVectors(smallerValVector, largerValVector);
    var orientation = new THREE.Matrix4();
    orientation.lookAt(largerValVector, smallerValVector, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
		                                 0, 0, 1, 0,
		                                 0, -1, 0, 0,
		                                 0, 0, 0, 1));
    var edgeGeometry = new THREE.CylinderGeometry(.8, .8, direction.length(), 8, 1);
    var edge = new THREE.Mesh(edgeGeometry,  new THREE.LineBasicMaterial({color: colorChosen}));
    edge.applyMatrix(orientation);
    // position based on midpoints - there may be a better solution than this
    edge.position.x = (smallerValVector.x + largerValVector.x) / 2;
    edge.position.y = (smallerValVector.y + largerValVector.y) / 2;
    edge.position.z = (smallerValVector.z + largerValVector.z) / 2;
    edge.material.depthTest = false; //this makes it possible to see the lines through the face.
    return edge;
}

// These two functions were used to make the lines smoother by tracing across the surface of the model. They are scrapped for now, because they inaccurately represent the measurments made.

// Formula is a sum of each dimension's values over 2
let findMidpoint = (pointA: number, pointB: number): void => {
    var x = (pointA.x + pointB.x)/2;
    var y = (pointA.y + pointB.y)/2;
    var z = (pointA.z + pointB.z)/2;
    var vector = new THREE.Vector3(x, y, z);
    return (vector);
}

let connectPoints = (beginning, arrayOfMidpoints, endPoint, doNotDisplayLines): void => {
    var numSegements = 2; //beginning and end
    var sum = 0;
    var currentLength;
    currentLength = (new THREE.Vector3().subVectors(beginning, arrayOfMidpoints[0])).length();
    sum += currentLength;
    if(!doNotDisplayLines)
    {
	var cylinder = cylinderMeshSurface(beginning, arrayOfMidpoints[0], 0x0000ff, currentLength);
	cylinder.material.depthTest = true;
	lineGroup.add(cylinder);
    }
    else
    {
	console.log("=============== all segments ===============");
	console.log("beginning segment: " + currentLength);
    }
    if(arrayOfMidpoints.length > 1)
    {
	for(var i = 1; i < arrayOfMidpoints.length; i++) //first dot is already connected to second dot. Now, connect second dot to third and so on until the last dot.
	{
	    currentLength = (new THREE.Vector3().subVectors(arrayOfMidpoints[i-1], arrayOfMidpoints[i])).length();
	    sum += currentLength;
	    if(!doNotDisplayLines)
	    {
		var newCylinder = cylinderMeshSurface(arrayOfMidpoints[i-1], arrayOfMidpoints[i], 0x0000ff, currentLength);
		newCylinder.material.depthTest = true;
		lineGroup.add(newCylinder);
	    }
	    else
	    {
		console.log("segment " + i + ": " + currentLength);
		numSegements++;
	    }
	}
    }

    currentLength = (new THREE.Vector3().subVectors(arrayOfMidpoints[arrayOfMidpoints.length - 1], endPoint)).length();
    sum += currentLength;
    if(!doNotDisplayLines)
    {
	var lastCylinder = cylinderMeshSurface(arrayOfMidpoints[arrayOfMidpoints.length - 1], endPoint, 0x0000ff, currentLength);
	lastCylinder.material.depthTest = true;
	lineGroup.add(lastCylinder);
    }
    else
    {
	console.log("end segment " + currentLength)
	console.log("=============== all segments ===============");
	console.log("total sum of segment lengths: " + sum);
	console.log("actual number of segments " + numSegements);
    }
    return sum;
}

let get_projection_point = (point: number, origin: number): void => {
    //Where does the ray from (0, 0, 0) to (point.x, point.y, point.z) intersect the model? (by default)
    //You can also do a custom origin, that's optional
    //return {x: point.x, y: point.y, z: point.z}; //To test speed without raycast
    var origin_vector;
    if(origin === undefined){
        //By default, it's super far out and facing the origin
        origin_vector = new THREE.Vector3(point.x, point.y, point.z);
        origin_vector.normalize();
        origin_vector.multiplyScalar(3000);
    }
    else{
        origin_vector = new THREE.Vector3(origin.x, origin.y, origin.z);
    }
    var direction_vector = new THREE.Vector3(point.x-origin_vector.x, point.y-origin_vector.y, point.z-origin_vector.z);
    direction_vector.normalize();
    var ray = new THREE.Raycaster(origin_vector, direction_vector);
    var intersection = ray.intersectObjects(scene.children, true);
    var intersect_index = 0;
    while(intersect_index < intersection.length && intersection[intersect_index].object.name == "Sphere" || String(intersection[intersect_index].object.type) != "Mesh"){
        intersect_index ++;
    }
    if(intersect_index == intersection.length){
        console.log("No intersection found, returning default point");
        return {x: point.x, y: point.y, z: point.z};
    }
    return {x: intersection[intersect_index].point.x, y: intersection[intersect_index].point.y, z: intersection[intersect_index].point.z};
}

//Surface area of a single triangle
//Last edited 3/23/2022 by Phil
let triangle_area = (p1: number, p2: number, p3: number): void => {
    //The points should be objects with variables {x, y, z}
    //First, find the vectors from point 1 to the other points
    var vec_1_2 = {x: p2.x-p1.x, y: p2.y-p1.y, z: p2.z-p1.z};
    var vec_1_3 = {x: p3.x-p1.x, y: p3.y-p1.y, z: p3.z-p1.z};
    //|vec_1_2 X vec_1_3| is the area of the parallelogram, double the area
    var area = Math.sqrt(Math.pow(vec_1_2.y*vec_1_3.z-vec_1_3.y*vec_1_2.z, 2)+
                         Math.pow(vec_1_2.x*vec_1_3.z-vec_1_3.x*vec_1_2.z, 2)+
                         Math.pow(vec_1_2.x*vec_1_3.y-vec_1_3.x*vec_1_2.y, 2));
    return area/2;
}

//Last edited 7/12/21 by Phil
let tetrahedron_volume = (p1: number, p2: number, p3: number, p4: number): number => {
    return Math.abs((p4.x-p1.x)*((p2.y-p1.y)*(p3.z-p1.z)-(p2.z-p1.z)*(p3.y-p1.y))+(p4.y-p1.y)*((p2.z-p1.z)*(p3.x-p1.x)-(p2.x-p1.x)*(p3.z-p1.z))+(p4.z-p1.z)*((p2.x-p1.x)*(p3.y-p1.y)-(p2.y-p1.y)*(p3.x-p1.x)))/6;
}

//Last edited 7/12/21 by Phil
let lerp = (x0: number, x1: number, alpha: number): number => {
    return ((x1 - x0)*alpha + x0);
}

let displayLines = (measurement, doNotDisplayLines): void => {
    if(canvasSceneLoaded) {
	var result = null;
	if(linePoints.length == measurement.usedFeatures.length)
	{
	    //in the educator app, change the position of the camera to the one the measurement may have data for.
	    //The camera already should point to the center of the model.
	    //for distances, create a line between two points
	    if(measurement.type == "Distances")
	    {
		var cylinder = cylinderMesh(linePoints[0], linePoints[1], 0x0000ff);
		cylinder.position.z = cylinder.position.z;
		cylinder.material.depthTest = false; //this makes it possible to see the lines through the face.
		lineGroup.add(cylinder);
	    }
	    if(measurement.type == "Distances - Surface")
	    {
		var dividedPoints = [];
		var xDistLine = linePoints[0].x - linePoints[1].x;
		var yDistLine = linePoints[0].y - linePoints[1].y;

		var numDivisions = measurement.numberOfSegments; // Math.floor(lineTracingDivisor/5);
		if(doNotDisplayLines)
		{ //only compute points when computing a measurement. If you're trying to display lines, don't compute the points again, just used the stored values of the computed points per measurement.
		    var xDistIncrement = xDistLine / numDivisions;
		    var yDistIncrement = yDistLine / numDivisions;
		    var pointRaycaster = new THREE.Raycaster();
		    var group = scene.children;
		    if(measurement.typeOfView == "front")
		    {
			for(var i = 1; i < numDivisions; i++) //use this for loop to get the points for a FRONT view
			{
			    var vector = new THREE.Vector3(linePoints[0].x - xDistIncrement * i, linePoints[0].y  - yDistIncrement * i, maxZ); //travelling from first point to second... make the z coordinate be at the tallest point on the face.
			    pointRaycaster.set(vector, new THREE.Vector3(0, 0, -1)); //towards negative z; pointing in the same direction that the camera starts in.
			    var intersect2 = pointRaycaster.intersectObjects(group, true);
			    if (intersect2.length > 0)
			    {
				if(Math.floor(Number(intersect2[0].point.x.toFixed(2))) == Math.floor(vector.x)) //when the raycaster seems to give an incorrect point, compare it's x coordinate to what it should be... They should be equal because the raycaster points straight into the model. If they aren't equal, the raycaster made a mistake; don't include the incorrect dot!
				{
				    if(intersect2[0].object.name == "Sphere")
				    {
					dividedPoints.push(new THREE.Vector3(vector.x, vector.y, Number(intersect2[1].point.z.toFixed(2))));
				    }
				    else
				    {
					dividedPoints.push(new THREE.Vector3(vector.x, vector.y, Number(intersect2[0].point.z.toFixed(2))));
				    }
				}
			    }
			}
			measurement.storedPoints = dividedPoints;
		    } else if (measurement.typeOfView == "steepBasal" || measurement.typeOfView == "basal")
		    {
			//1) set the raycaster to point from the origin (position of camera at basal view, doesn't move) to the point of the x, y, z coordinates.
			/*
			  1a) get subvector z.subVectors( eye, target ).normalize(); and use this as the direction.
			  1b) '.set ( origin : Vector3, direction : Vector3 )
			*/
			//2)get the z coordinate of the intersection, use x and y of orginial coordinates.
			var zCoord = linePoints[0].z;
			var direction;
			var directionVector;
			var previousCameraPositionx = camera.position.x;
			var previousCameraPositiony = camera.position.y;
			var previousCameraPositionz = camera.position.z;
			if(measurement.typeOfView == "basal")
			{
			    camera.position.set(0, -cameraZ * .2, cameraZ * .5);
			}
			if(measurement.typeOfView == "steepBasal")
			{
			    camera.position.set(0, -cameraZ * .8, cameraZ * .5);
			}
			var cameraPosition = camera.position;
			var intersect2;
			var vector;
			var zDistLine = linePoints[0].z - linePoints[1].z;
			var zDistIncrement = zDistLine / numDivisions;
			for(var i = 1; i < numDivisions; i++) //use this for loop to get the points for a FRONT view
			{
			    vector = new THREE.Vector3(linePoints[0].x - xDistIncrement * i, linePoints[0].y  - yDistIncrement * i, linePoints[0].z  - zDistIncrement * i); //travelling from first point to second...
			    direction = new THREE.Vector3().subVectors(cameraPosition, vector);
			    directionVector = direction.normalize();
			    directionVector.x = directionVector.x * -1;
			    directionVector.z = directionVector.z * -1; //all of the coordinates are in the incorrect direction
			    directionVector.y = directionVector.y * -1;
			    /*var arrow = new THREE.ArrowHelper(
			    // first argument is the direction
			    directionVector,
			    // second argument is the orgin
			    cameraPosition,
			    // length
			    600,
			    // color
			    0x00ff00);
			    lineGroup.add(arrow);*/ //used to help
			    pointRaycaster.set(cameraPosition, directionVector); //towards negative z; pointing in the same direction that the camera starts in.
			    intersect2 = pointRaycaster.intersectObjects(group, true);
			    if (intersect2.length > 0)
			    {
				if(Math.floor(Number(intersect2[0].point.x.toFixed(2))) == Math.floor(vector.x)) //when the raycaster seems to give an incorrect point, compare it's x coordinate to what it should be... They should be equal because the raycaster points straight into the model. If they aren't equal, the raycaster made a mistake; don't include the incorrect dot!
				{
				    dividedPoints.push(new THREE.Vector3(Number(intersect2[0].point.x.toFixed(2)), Number(intersect2[0].point.y.toFixed(2)), Number(intersect2[0].point.z.toFixed(2))));
				}
			    }
			}
			measurement.storedPoints = dividedPoints;
			setTimeout(() => {
			    camera.position.set(previousCameraPositionx, previousCameraPositiony, previousCameraPositionz);
			}, 100)
		    } else {
			alert("measurement typeOfView error");
			return -1;
		    }

		    //store the beginning and the end points in JSON attributes: if you don't, you won't be able to load surface distance lines from an uploaded JSON file.
		    if(linePoints[0] == null || linePoints[1] == null)
		    {
			console.log(highlightedFeaturePoints);
		    }
		    result = connectPoints(linePoints[0], dividedPoints, linePoints[1], doNotDisplayLines);
		}
		else
		{
		    result = connectPoints(linePoints[0], measurement.storedPoints, linePoints[1], doNotDisplayLines);
		}
		//now start making cylinders between points
		//start with the first point and the first dividedPoint. Go through a for loop if there is more than a single point in the dividedPoint array. End with last point in the dividedPoint array and the end point.
		if(doNotDisplayLines)
		{
		    console.log("intended number of segments " + numDivisions);
		    console.log("actual number of points " +  measurement.storedPoints.length);
		    console.log("average segment length " + result / numDivisions);
		}
	    }

	    if(measurement.type == "Angles" && measurement.usedFeatures.length == 3)
	    {
		for(var i = 1; i < linePoints.length; i++)
		{
		    var cylinder = cylinderMesh(linePoints[i-1], linePoints[i], 0x0000ff);
		    cylinder.material.depthTest = false; //this makes it possible to see the lines through the face.
		    cylinder.position.z = cylinder.position.z;
		    lineGroup.add(cylinder);
		}

		/* Disabled until angles are fixed.
		   var angle = angleMesh(linePoints[0], linePoints[2], linePoints[1], measurement);
		   lineGroup.add(angle);
		*/
	    }
	    if(measurement.type == "Ratios" || (measurement.type == "Angles" && measurement.usedFeatures.length == 4))
	    {
            if(linePoints.length == 3)
            {
                for(var i = 1; i < linePoints.length; i++)
                {
                var cylinder = cylinderMesh(linePoints[i-1], linePoints[i], 0x0000ff);
                cylinder.material.depthTest = false;
                cylinder.position.z = cylinder.position.z;
                lineGroup.add(cylinder);
                }
            }
            else if(linePoints.length == 4)
            {
                var cylinder = cylinderMesh(linePoints[0], linePoints[1], 0x0000ff);
                cylinder.material.depthTest = false;
                cylinder.position.z = cylinder.position.z;
                lineGroup.add(cylinder);

                var cylinder2 = cylinderMesh(linePoints[2], linePoints[3], 0x0000ff);
                cylinder2.material.depthTest = false;
                cylinder2.position.z = cylinder2.position.z;
                lineGroup.add(cylinder2);
            }
            else
            {
                alert("This is an error with the current measurement chosen! It is not required, but it would be helpful if you contacted the website admin and informed them of this and what you were doing before this happened."); //I put this here because I haven't tested all of the points yet.
            }
	    }
        
        if(measurement.type == "Areas")
        {
            if(doNotDisplayLines){
                findArea(mId);
            }
            result = connectPoints(linePoints[0], measurement.storedPoints, linePoints[0], doNotDisplayLines);
            console.log(linePoints[0]);
            console.log(measurement.storedPoints);
        }
        if(measurement.type == "Areas - Surface")
        {
            if(doNotDisplayLines){
                findArea(mId);
            }
            result = connectPoints(linePoints[0], measurement.storedPoints, linePoints[0], doNotDisplayLines);
        }
        if(measurement.type == "Volumes")
        {
            if(doNotDisplayLines){
                findVolume(mId);
            }
            result = connectPoints(linePoints[0], measurement.storedPoints, linePoints[0], doNotDisplayLines);
        }
        

	    scene.add(lineGroup);
	    //for angles, create a line between all three points. Then, create a plane at the second point using the angle created by the 1st and third point connecting with the second on a XY plane. The angles should face outward.
	    //for distances, figure out which two dots have to be connected. Then connect the pairs individually.
	    if(result)
	    {
		return result;
	    }
	}
    }
}

/*
  function angleMesh(pointX, pointY, point, measurement) // How do we fit the arc between the lines appropriately? Beginning point and endpoint...
  {
  //var geometry = new THREE.RingBufferGeometry( 8, 10, 32, 1,0, degrees_to_radians(measurement.value)); Check up the THREE.js references for the RingBufferGeometry class, but the last value, degrees_to_radians(measurement.value), gives the correct arc length. We just don't know how to orient it between the lines.
  var geometry = new THREE.RingBufferGeometry( 8, 10, 32, 1,0, degrees_to_radians(measurement.value));
  var material = new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide } );
  var mesh = new THREE.Mesh( geometry, material );
  // position based on midpoints - there may be a better solution than this
  mesh.position.x = point.x;
  mesh.position.y = point.y;
  mesh.position.z = point.z;
  //create a triangle to get angle...
  var rotationPoint;
  if(pointX.z > pointY.z) //which one is foremost in the scene?
  {
  rotationPoint = pointX;
  }
  else
  {
  rotationPoint = pointY;
  }
  var extrudedPoint = $.extend(true,{}, point); //create a copy of the object without reference.
  var direction = new THREE.Vector3().subVectors(rotationPoint, point);
  extrudedPoint.z = extrudedPoint.z + direction.length();
  var firstPoint = extrudedPoint;
  var secondPoint = point;
  var thirdPoint = rotationPoint;
  var v1 = new Vector(
  (secondPoint.y) -
  (firstPoint.y),
  (secondPoint.z) -
  (firstPoint.z));


  var v2 = new Vector(
  (firstPoint.y) -
  (thirdPoint.y),
  (firstPoint.z) -
  (thirdPoint.z));


  // Find the dot product using vectors
  var dotProductVector = Vector.dot(v1, v2);

  // Convert the dot product vector into an array
  var dotProductArray = VectorMath.getArray(dotProductVector);

  // Sum the values in the array to obtain the dot product result
  var dotProduct = sum(dotProductArray) - 1;

  var v1Len = Math.abs(v1.len());
  var v2Len = Math.abs(v2.len());

  // Determine the angle in radians
  var radians = Math.acos(dotProduct / (v1Len * v2Len));

  // Convert radians to degrees
  var degrees = radians * (180 / Math.PI);

  console.log(degrees);
  mesh.rotation.x = mesh.rotation.x - degrees
  mesh.material.depthTest = false; //this makes it possible to see the lines through the face.
  return mesh;
  }
*/

let degrees_to_radians = (degrees: number): number => {
    var pi = Math.PI;
    return degrees * (pi/180);
}

let displayOneFifthsRule = (): void => {
    var importantPoints = 0;
    var oneFifthsPoints = [];
    var notIncludedArray = []; //used to alert which are not included
    //oneFifthsPoints.push(bottomLeftVector);
    var anyPointsExist = false;
    var currentFeature;
    for(var j = 0; j < 6; j++) {
	for(var i = 0; i < fpoints.length; i++)
	{
	    //This is done to get all of the points in the array to be left to right.
	    if((fpoints[i].id == 'Endocanthion/Medial_Canthus_left' && importantPoints == 3) ||
	       (fpoints[i].id == 'Endocanthion/Medial_Canthus_right' && importantPoints == 2)||
	       (fpoints[i].id == 'Exocanthion/Lateral_Canthus_left' &&  importantPoints == 4)||
	       (fpoints[i].id == 'Exocanthion/Lateral_Canthus_right' && importantPoints == 1)||
	       (fpoints[i].id == 'lateral_helix_of_ear_right' && importantPoints == 0)||
	       (fpoints[i].id == 'lateral_helix_of_ear_left' && importantPoints == 5))
	    {
		importantPoints++;
		if(fpoints[i].list == "Y")
		{
		    if(fpoints[i].xVal != '') //fix the Y and Z coordinates
		    {
			oneFifthsPoints.push(new THREE.Vector3(Number(fpoints[i].xVal), Number(minY), Number(maxZ))); //everything is at the bottom... oneFifthsPoints = bottomRow
			/*
			  if(oneFifthsPoints.length == 5)
			  {
			  oneFifthsPoints.push(bottomRightVector);
			  }
			*/
			break;
		    }
		}
		else
		{
		    notIncludedArray.push(fpoints[i]);
		    break;
		}
	    }
	}
    }
    //create two arrays for the top and bottom rows
    if(oneFifthsPoints.length == 6) {
	removeLines();
	cleanUpLabels();
	centerAllDots();
	//create rows of points
	var bottomRow = [];
	var topRow = [];
	for(var i = 0; i < oneFifthsPoints.length; i++)
	{
	    if(i == 0) //first point
	    {
		bottomRow.push(oneFifthsPoints[i]); //already at the bottom left
		var topVector = new THREE.Vector3(Number(oneFifthsPoints[i].x), Number(maxY), Number(maxZ));
		topRow.push(topVector);
	    }
	    else if(i == 5) //last point
	    {
		bottomRow.push(oneFifthsPoints[i]); //already at the bottom right
		var topVector = new THREE.Vector3(Number(oneFifthsPoints[i].x), Number(maxY), Number(maxZ));
		topRow.push(topVector);
	    }
	    else
	    {
		bottomRow.push(oneFifthsPoints[i]); //already at the bottom, somewhere  between leftmost and rightmost
		var topVector = new THREE.Vector3(Number(oneFifthsPoints[i].x), Number(maxY), Number(maxZ));
		topRow.push(topVector);
	    }
	}
	//display lines
	for(var i = 0 ; i < 6; i++)
	{
	    var cylinder = cylinderMesh(bottomRow[i], topRow[i], 0x0000ff);
	    lineGroup.add(cylinder);
	    var geometry = new THREE.PlaneGeometry(zDist, yDist);
	    var material = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide, opacity: 0.3, transparent: true} );
	    var plane = new THREE.Mesh( geometry, material );
	    plane.position.x = bottomRow[i].x;
	    plane.position.y = bottomRow[i].y + yDist * .5;
	    plane.position.z = bottomRow[i].z - zDist * .5;
	    plane.rotation.y = degrees_to_radians(90);
	    lineGroup.add(plane);
	}
	//create a distance between leftmost and rightmost points
	var bottomLeft = bottomRow[0];
	var bottomRight = bottomRow[5];
	var tempXDist = new THREE.Vector3().subVectors(bottomLeft, bottomRight);
	var tempXDistNum = tempXDist.length();
	for(var i = 0; i < bottomRow.length - 1; i++) //bottom lines
	{
	    var cylinder = cylinderMeshMeasurements(bottomRow[i], bottomRow[i + 1], 0x228B22, 'x');
	    lineGroup.add(cylinder);
	    var direction = new THREE.Vector3().subVectors(bottomRow[i+1], bottomRow[i]);
	    var halfDist = direction.length() * .5;
	    var percentDistance = Math.round(((direction.length() / tempXDistNum) * 100) * 10) / 10;
	    //the *10 and then  /10 is used to display up to a single decimal place.
	    var sprite = makeTextSprite( " " + (percentDistance) + "% ", { fontsize: 46, backgroundColor: {r:100, g:100, b:255, a:1 } } );
	    sprite.position.x = bottomRow[i].x + xDist * 0.02 + halfDist; // I use defined variables like yDist to have a dynamic sense of size in mind...
	    sprite.position.y = bottomRow[i].y + yDist * 0.05;
	    sprite.position.z = bottomRow[i].z;
	    marksGroup.add(sprite);
	}
	var divString = "Features involved: Lateral Helix of Ear (right), Exocanthion/Lateral Canthus (right), Endocanthion/Medial Canthus (right), Endocanthion/Medial Canthus (left), Exocanthion/Lateral Canthus (left), and Lateral Helix of Ear (left).";
	//document.getElementById("highlightedItems").innerHTML = divString;
	//document.getElementById("itemIdentity").style["visibility"] = "visible";
	document.getElementById("highlightedFPs").innerHTML = divString;
	document.getElementById("highlightedFPs").style["visibility"] = "visible"
	scene.add(marksGroup);
	scene.add(lineGroup);
    }
    else {
	toggleVisualizationOff();
	missingFeaturePoints = notIncludedArray;
	displayMissingModal("oneFifths");
    }
}

let alertMissingPoints = (missingPoints, anyPointsExist, visualization): void => {
    if(missingPoints.length > 0)
    {
	var alertString = "There are still missing points. Make sure to have recorded data for these points: ";
	for(var i = 0; i < missingPoints.length; i++)
	{
	    if(i == missingPoints.length - 1)
	    {
		alertString += missingPoints[i];
	    }
	    else
	    {
		alertString += missingPoints[i];
		alertString += ", ";
	    }
	}
	alert(alertString);
    }
}

let displayMissingModal = (visualization): void => {
    var informationString = "The following feature points required for this visualization are not a part of your list: ";
    var onePointHasNoData = false;
    var allPointsAlreadyInList = true;
    var currentFeature;
    var matchesFound = 0;

    for(var i = 0; i < missingFeaturePoints.length; i++)
    {
	if(i != missingFeaturePoints.length - 1)
	{
	    informationString += missingFeaturePoints[i].name;
	    informationString += ", ";
	}
	else
	{
	    informationString += missingFeaturePoints[i].name;
	    informationString += ". ";
	}

	for(var j = 0; j < fixedFeaturePointLength; j++)
	{
	    currentFeature = findRowElementFP(j);
	    if(currentFeature.id == missingFeaturePoints[i].id)
	    {
		matchesFound++;
		break;
	    }
	}
    }
    if(visualization == "oneFifths" && missingFeaturePoints.length == matchesFound)
    {
	alert("Although all needed feature points are in your list, there is at least one that has no data. Please make sure that the following feature points have data recorded for them: Endocanthion/Medial Canthus - left, Endocanthion/Medial Canthus - right, Exocanthion/Lateral Canthus - left, Exocanthion/Lateral Canthus - right, lateral helix of ear - left, lateral helix of ear - right.");
	return;
    }
    if(visualization == "proportions" && missingFeaturePoints.length == matchesFound)
    {
	alert("Although all needed feature points are in your list, there is at least one that has no data. Please make sure that the following feature points have data recorded for them: Subnasale, Glabella, Stomion, Trichion, Menton/Gnathion.");
	return;
    }

    document.getElementById("missingPoints").innerHTML = informationString;
    $(document).ready(function(){
	$("#missingPointsModal").modal("show");
    });
}

//buttons in missingPointsModal: if you click on yes, include will be true.
let includeMissingFeaturePoints = (include): void => { 
    if(include)
    {
	for(var i = 0; i < missingFeaturePoints.length; i++)
	{
	    for(var j = 0; j < fpoints.length; j++)
	    {
		if(missingFeaturePoints[i].id == fpoints[j].id)
		{
		    fpoints[j].list = "Y"; //include the missing feature points
		}
	    }
	}
	localStorage.setItem("localFeaturesList", JSON.stringify(fpoints));
	deleteTableRows(document.getElementById("features"));
	createFeatureList(false);
    }
    else
    {
	$(document).ready(function(){
	    $("#missingPointsModal").modal("hide");
	});
    }
}

let displayProportions = (): void => {
    var importantPoints = 0;
    var proportionsPoints = [];
    var notIncludedArray = [];
    var anyPointsExist = false;
    var currentFeature;
    for(var j = 0; j < 5; j++)
    {
	for(var i = 0; i < fpoints.length; i++)
	{
	    //This is done to get all of the points in the array to be left to right: top to bottom
	    if((fpoints[i].id == 'Subnasale' && importantPoints == 2) ||
	       (fpoints[i].id == 'Glabella' && importantPoints == 1)||
	       (fpoints[i].id == 'Stomion' &&  importantPoints == 3)||
	       (fpoints[i].id == 'Trichion' && importantPoints == 0)||
	       (fpoints[i].id == 'Menton/Gnathion' && importantPoints == 4))
	    {
		importantPoints++;
		if(fpoints[i].list == "Y")
		{
		    if(fpoints[i].xVal != '') //fix the Y and Z coordinates
		    {
			proportionsPoints.push(new THREE.Vector3(Number(minX), Number(fpoints[i].yVal), Number(maxZ))); //everything is at the left... proportionsPoints = leftRow
			dotsGroup.children[i].children[0].position.x = Number(minX);
			dotsGroup.children[i].children[0].position.y = Number(fpoints[i].yVal);
			dotsGroup.children[i].children[0].position.z = Number(maxZ);
			break;
		    }
		}
		else
		{
		    notIncludedArray.push(fpoints[i]);
		    break;
		}
	    }
	}
    }
    if(proportionsPoints.length == 5) //create two arrays for the top and bottom rows
    {
	removeLines();
	cleanUpLabels();
	centerAllDots();
	//create rows of points
	var leftRow = [];
	var rightRow = [];
	for(var i = 0; i < proportionsPoints.length; i++)
	{
	    //You don't actually need these if statements; they're here to help you visualize the code.
	    if(i == 0) //first point
	    {
		leftRow.push(proportionsPoints[i]); //already at the top left
		var rightVector = new THREE.Vector3(Number(maxX), Number(proportionsPoints[i].y), Number(maxZ));
		rightRow.push(rightVector);
	    }
	    else if(i == 4) //last point
	    {
		leftRow.push(proportionsPoints[i]); //already at the bottom left
		var rightVector = new THREE.Vector3(Number(maxX), Number(proportionsPoints[i].y), Number(maxZ));
		rightRow.push(rightVector);
	    }
	    else
	    {
		leftRow.push(proportionsPoints[i]); //already at the left, somewhere  between top and bottom
		var rightVector = new THREE.Vector3(Number(maxX), Number(proportionsPoints[i].y), Number(maxZ));
		rightRow.push(rightVector);
	    }
	}


	for(var i = 0; i < 5; i++)
	{
	    if(i == 3) //lips; the width of the plane is different from the other planes.
	    {
		//the .extend jQuery methods clone an object without allowing references.
		var leftVector = $.extend(true,{}, leftRow[i]);
		var rightVector = $.extend(true,{}, rightRow[i]);
		leftVector.x = leftVector.x + 25;
		rightVector.x = rightVector.x - 25;
		var cylinder = cylinderMesh(leftVector, rightVector, 0x0000ff);
		var geometry = new THREE.PlaneGeometry(xDist - 50, zDist);
	    }
	    else
	    {
		var cylinder = cylinderMesh(leftRow[i], rightRow[i], 0x0000ff);
		var geometry = new THREE.PlaneGeometry(xDist, zDist);
	    }
	    lineGroup.add(cylinder);
	    var material = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide, opacity: 0.3, transparent: true} );
	    var plane = new THREE.Mesh( geometry, material );
	    if(i == 3)
	    {
		plane.position.x = leftRow[i].x + xDist * .5;
		plane.position.y = leftRow[i].y;
		plane.position.z = leftRow[i].z - zDist * .5;
		plane.rotation.x = degrees_to_radians(90);
	    }
	    else
	    {
		plane.position.x = leftRow[i].x + xDist * .5;
		plane.position.y = leftRow[i].y;
		plane.position.z = leftRow[i].z - zDist * .5;
		plane.rotation.x = degrees_to_radians(90);
	    }
	    lineGroup.add(plane);
	}

	//distances of each set of lines
	var directionOne = new THREE.Vector3().subVectors(rightRow[0], rightRow[4]);
	var threeFaceSectionsDist = directionOne.length();
	var directionTwo = new THREE.Vector3().subVectors(rightRow[1], rightRow[4]);
	var twoMidFaceSectionsDist = directionTwo.length();
	var directionThree = new THREE.Vector3().subVectors(rightRow[2], rightRow[4]);
	var twoLowerFaceSectionsDist = directionThree.length();

	//Change the sprite positions in these for loops, if need be.
	//threeFaceSections
	for(var i = 0; i < 3; i++)
	{
	    var direction;
	    if(i == 2)
	    {
		lineGroup.add(cylinderMeshMeasurements(rightRow[i], rightRow[i+2], 0x006400, 'y'));
		direction = new THREE.Vector3().subVectors(rightRow[i], rightRow[i + 2]);
	    }
	    else
	    {
		lineGroup.add(cylinderMeshMeasurements(rightRow[i], rightRow[i + 1], 0x006400, 'y'));
		direction = new THREE.Vector3().subVectors(rightRow[i+1], rightRow[i]);
	    }
	    var halfDist = direction.length() * .5;
	    var percentDistance = Math.round(((direction.length() / threeFaceSectionsDist) * 100) * 10) / 10;
	    var sprite = makeTextSprite( " " + (percentDistance) + "% ", { fontsize: 46, backgroundColor: {r:100, g:100, b:255, a:1 } } );
	    sprite.position.x = rightRow[i].x - xDist * .05;
	    sprite.position.y = rightRow[i].y - halfDist * 1.02;
	    sprite.position.z = rightRow[i].z;
	    marksGroup.add(sprite);
	}

	//twoMidFaceSections
	for(var i = 1; i < 3; i++)
	{
	    lineGroup.add(cylinderMeshMeasurements(leftRow[i], leftRow[i * 2], 0x228B22, 'y'));
	    direction = new THREE.Vector3().subVectors(leftRow[i], leftRow[i * 2]);
	    var halfDist = direction.length() * .5;
	    var percentDistance = Math.round(((direction.length() / twoMidFaceSectionsDist) * 100) * 10) / 10;
	    var sprite = makeTextSprite( " " + (percentDistance) + "% ", { fontsize: 46, backgroundColor: {r:100, g:100, b:255, a:1 } } );
	    sprite.position.x = leftRow[i].x + xDist * .07;
	    sprite.position.y = leftRow[i].y - halfDist * 1.02;
	    sprite.position.z = leftRow[i].z;
	    marksGroup.add(sprite);
	}

	//twoLowerFaceSections
	for(var i = 2; i < 4; i++)
	{
	    var cylinderOne = cylinderMeshMeasurements(rightRow[i], rightRow[i + 1], 0x32CD32, 'y');
	    cylinderOne.position.x = cylinderOne.position.x - 25;
	    lineGroup.add(cylinderOne);
	    direction = new THREE.Vector3().subVectors(rightRow[i], rightRow[i + 1]);
	    var halfDist = direction.length() * .5;
	    var percentDistance = Math.round(((direction.length() / twoLowerFaceSectionsDist) * 100) * 10) / 10;
	    var sprite = makeTextSprite( " " + (percentDistance) + "% ", { fontsize: 46, backgroundColor: {r:100, g:100, b:255, a:1 } } );
	    sprite.position.x = rightRow[i].x - xDist * .18;
	    sprite.position.y = rightRow[i].y - halfDist * 1.15;
	    sprite.position.z = rightRow[i].z;
	    marksGroup.add(sprite);
	}
	var divString = "Features involved: Trichion, Glabella, Subnasale, Stomion, and Menton/Gnathion.";
	//document.getElementById("highlightedItems").innerHTML = divString;
	//document.getElementById("itemIdentity").style["visibility"] = "visible";
	document.getElementById("highlightedFPs").innerHTML = divString;
	document.getElementById("highlightedFPs").style["visibility"] = "visible"
	scene.add(marksGroup);
	scene.add(lineGroup);
    }
    else
    {
	toggleVisualizationOff();
	missingFeaturePoints = notIncludedArray;
	displayMissingModal("proportions");
    }
}

let planeMeshPoints = (bottomPoint, topPoint) => {
    var geometry = new THREE.PlaneGeometry(zDist, yDist);
    var material = new THREE.MeshBasicMaterial( {color: 0x228B22, side: THREE.DoubleSide, opacity: 0.3, transparent: true} );
    var plane = new THREE.Mesh( geometry, material );
    return plane;
}
                                           
let updateMeasurementsAll = () => {
    //Find all measurements that have the point highlighted
    document.getElementById("timeProcess").style.visibility = "visible";
    setTimeout(() => { //we use setTimeout. A weird synchronous programming problem.
        var currentMeasurement;
        console.log("fixedMeasurementLength: " + fixedMeasurementLength);
        console.log("measurementData.length: " + measurementData.length);
        for(var i = 0; i < measurementData.length; i++)
        {
            currentMeasurement = measurementData[i];
            console.log("currentMeasurement: " + currentMeasurement.name);
            for(var j = 0; j < currentMeasurement.usedFeatures.length; j++)
            {
                console.log("currentMeasurement usedFeatures: " + j + ": " + currentMeasurement.usedFeatures[j] );
                computeMeasurement(currentMeasurement);
            }
        }
        document.getElementById("timeProcess").style.visibility = "hidden";
    }, 200)
}

let updateMeasurements = (id): void => {
    //Find all measurements that have the point highlighted
    document.getElementById("timeProcess").style.visibility = "visible";
    setTimeout(() => { //we use setTimeout. A weird synchronous programming problem.
	var currentMeasurement;
	for(var i = 0; i < fixedMeasurementLength; i++)
	{
	    currentMeasurement = findRowElementMeasurement(i);
	    for(var j = 0; j < currentMeasurement.usedFeatures.length; j++)
	    {
		if(currentMeasurement.usedFeatures[j] == id)
		{
            //passes an object from measurementData to the computeMeasurement function
            //if it is area or volume measurement, we do not auto compute
            //if(currentMeasurement.group != "Areas" && currentMeasurement.group != "Volumes")
                computeMeasurement(currentMeasurement);
            
		}
	    }
	}
	document.getElementById("timeProcess").style.visibility = "hidden";
    }, 50)

    /*
      Comments that seem important and were from an earlier version of this .js file.
      //radixProjection(); //TEMPORARLY COMMENTING OUT UNTIL THE FORMULA IS FIXED - //Bria's
      tipRotationAngle(); //Doesn't exist in this code
      nasolabialAngle2(); //Not implemented
      nasolabialAngle3(); //Not implemented
      //nasalTipProtrusion();
      nasalTipProjection(); //same as nasalTipProtrusion()
    */
}
              
//Made a separate function to set the measurement points so I can call individual measurement functions without having to run computeMeasurement -Phil
let setMeasurementPoints = (mId): void => {
   measurementId = mId.id;
   measurementPoints = [];
   measurementPointExists = [];
   for(var a = 0; a < maxPointsInMeasurement; a ++){
       measurementPoints.push("");
       measurementPointExists.push(false);
   }
   for(var a = 0; a < mId.usedFeatures.length; a ++){
       var currentFeature;
       for(var i = 0; i < fixedFeaturePointLength; i++)
       {
           currentFeature = findRowElementFP(i);
           if(currentFeature.id == mId.usedFeatures[a])
           {
               measurementPoints[a] = currentFeature;
               measurementPointExists[a] = true;
               break;
           }
       }
   }
}


/*
 * IMPORTANT COMMENT from Rafael Nunez
 Something to keep in mind about the measurements that are made from these functions is that they are completely dependent on the order of the elements in the array "points" for each measurement.
 I spent time making sure that the order of all of the measurements worked properly by manipulating the order of the arrays. If the order of an array still cannot give a correct output, I set conditions in the functions below to specify measurements that needed some variables changed.

 For example, if you were to flip the order of the array "points" for the measurement with the id "Distance_First_Second", then the computation of findDistance() for Distance_First_Second would subtract the second point from the first point. Although this would not matter in the simple Distance calculations, it WOULD matter in the other calculation types.

 If you are ever changing this code and find it impossible to make a specific measurement work correctly according to the order of "points", try introducing if/else conditions like I did and manipulating variables that are incorrect in those conditions.

 I developed the different types to the findRatio() function by using the formats of the original functions. There are some patterns that are immediately visible if you try comparing them, and I used them.
*/
let computeMeasurement = (mId): void => {
    if(mId.usedFeatures == "")
    {
	return;
    }
    measurementId = mId.id;
    firstPointExists = false;
    secondPointExists = false;
    thirdPointExists = false;
    fourthPointExists = false;
    firstPoint = "";
    secondPoint = "";
    thirdPoint = "";
    fourthPoint = "";
            
    setMeasurementPoints(mId);

    if(mId.usedFeatures.length >= 1){
        var currentFeature;
        for(var i = 0; i < fixedFeaturePointLength; i++)
        {
            currentFeature = findRowElementFP(i);
            if(currentFeature.id == mId.usedFeatures[0])
            {
            firstPointExists = true;
            firstPoint = currentFeature;
            break;
            }
        }
    }
    if(mId.usedFeatures.length >= 2){
	var currentFeature;
	for(var i = 0; i < fixedFeaturePointLength; i++)
	{
	    currentFeature = findRowElementFP(i);
	    if(currentFeature.id == mId.usedFeatures[1])
	    {
		secondPointExists = true;
		secondPoint = currentFeature;
		break;
	    }
	}
    }
    if(mId.usedFeatures.length >= 3){
	var currentFeature;
	for(var i = 0; i < fixedFeaturePointLength; i++)
	{
	    currentFeature = findRowElementFP(i);
	    if(currentFeature.id == mId.usedFeatures[2])
	    {
		thirdPointExists = true;
		thirdPoint = currentFeature;
		break;
	    }
	}
    }
    if(mId.usedFeatures.length == 4){
	var currentFeature;
	for(var i = 0; i < fixedFeaturePointLength; i++)
	{
	    currentFeature = findRowElementFP(i);
	    if(currentFeature.id == mId.usedFeatures[3])
	    {
		fourthPointExists = true;
		fourthPoint = currentFeature;
		break;
	    }
	}
    }
    //there are multiple types of measurements, filter them.
    if((mId.type == "Distances") && (firstPointExists && secondPointExists))
    {
	findDistance(mId);
    }
    else if((mId.type == "Angles")  && (firstPointExists && secondPointExists && thirdPointExists))
    {
	findAngle(mId)
    }
    else if((mId.type == "Ratios") && (firstPointExists && secondPointExists && thirdPointExists))
    {
	findRatio(mId);
    }
    else if(mId.type == "Distances - Surface")
    {
	findSurfDist(mId);
    }
    else if(mId.type == "Areas - Surface" && measurementPointExists[2])
    {
        findSurfaceArea(mId);
    }
    else if(mId.type == "Volumes" && measurementPointExists[2])
    {
        findVolume(mId);
    }
}

// A comment from the Radix Projection distance... TO-DO: ATTENTION here: How should we calculate Corneal_Plane first? using Corneal_Plane's x , y ,z coordinates does not make much sense.
//This formula simply finds the distance between two points.
let findDistance = (mId): void => {
    //Are all of the points necessary highlighted? If they are, compute a number.
    if (firstPoint.xVal != "" && secondPoint.xVal != "") {
	mId.beginningPoint = new THREE.Vector3(Number(firstPoint.x), Number(firstPoint.y), Number(firstPoint.z));
	mId.endPoint = new THREE.Vector3(Number(secondPoint.x), Number(secondPoint.y), Number(secondPoint.z));
	var vector = new Vector((firstPoint.xVal) -
		                (secondPoint.xVal),
		                (firstPoint.yVal) -
		                (secondPoint.yVal),
		                (firstPoint.zVal) -
		                (secondPoint.zVal));
	if(document.getElementById("val-" + measurementId))
	{
	    document.getElementById("val-" + measurementId).innerHTML = vector.len().toFixed(2) + " mm";

	    //updated 
	    if(vector.len().toFixed(2) > mId.rangeStart && vector.len().toFixed(2) < mId.rangeEnd){ // if the value is within range
		document.getElementById("val-" + measurementId).style["background-color"] = ""; // keep the value text background clear
	    }
	    else{
		document.getElementById("val-" + measurementId).style["background-color"] = "orange"; // turn the value text background red
	    }

	}
	mId.value = vector.len().toFixed(2)
	measurementCreated = true;
	if(mId.surfaceDistId != "") //is there a surface measurement for the distance?
	{
	    //find the surface distance measurement, set the lineTracingDivisor
	    for(var i = 0; i < measurementData.length; i++)
	    {
		if(mId.surfaceDistId ==  measurementData[i].id)
		{
		    measurementData[i].numberOfSegments = lineTracingDivisor = Math.ceil(vector.len());
		}
	    }
	}
	var currentsLength = (new THREE.Vector3().subVectors(mId.beginningPoint, mId.endPoint)).length();
    }
}

let findSurfDist = (mId): void => {
    if ((firstPoint.xVal != "" && secondPoint.xVal != "") && (firstPoint.xVal != undefined && secondPoint.xVal != undefined)) {
	var currentMidID = measurementId; // the value measurementId becomes overwritten if there is no numberOfSegments
	if(mId.numberOfSegments == "")//if the regular fly distance for the corresponding measurement isn't on the list...
	{
	    for(var i = 0; i < measurementData.length; i++)
	    {
		if(mId.flyDistId ==  measurementData[i].id)
		{
		    computeMeasurement(measurementData[i]);
		}
	    }
	}
	linePoints = [];
	findLinepoints(mId);
	var result = displayLines(mId, true);
	document.getElementById("val-" + currentMidID).innerHTML = result.toFixed(2) + " mm";

	//updated 
	if(result.toFixed(2) > mId.rangeStart && result.toFixed(2) < mId.rangeEnd){ // if the value is within range
	    document.getElementById("val-" + measurementId).style["background-color"] = ""; // keep the value text background clear
	}
	else{
	    document.getElementById("val-" + measurementId).style["background-color"] = "orange"; // turn the value text background red
	}	

	mId.value = result.toFixed(2)
	measurementCreated = true;
    }
}

let findAngle = (mId): void => {
    if (firstPoint.xVal != "" && secondPoint.xVal != "" && thirdPoint.xVal != "") {
	var v1 = new Vector((secondPoint.xVal) -
		            (firstPoint.xVal),
		            (secondPoint.yVal) -
		            (firstPoint.yVal),
		            (secondPoint.zVal) -
		            (firstPoint.zVal));


	var v2 = new Vector((firstPoint.xVal) -   //1, 3 pattern
		            (thirdPoint.xVal),
		            (firstPoint.yVal) -
		            (thirdPoint.yVal),
		            (firstPoint.zVal) -
		            (thirdPoint.zVal));

	//Some angles have different formulas for v2...
	if(measurementId == "Nasofacial_Angle" || measurementId == "Nasofrontal_Angle" || measurementId == "Degree_of_Deviation_(I-type)" || measurementId == "Columellar_Labial_Angle" || measurementId == "Columellar_Lobular_Angle" || measurementId == "Angle_First_Second_Third")
	{
	    v2 = new Vector((secondPoint.xVal) -  //2, 3 pattern
			    (thirdPoint.xVal),
			    (secondPoint.yVal) -
			    (thirdPoint.yVal),
			    (secondPoint.zVal) -
			    (thirdPoint.zVal));
	}
	//Some other angles have different formulas for v2...
	if(measurementId == "Columellar_Lobular_Angle" || measurementId == "Nasolabial_Angle_1")
	{
	    v2 = new Vector((thirdPoint.xVal) -  //3, 2 pattern
			    (secondPoint.xVal),
			    (thirdPoint.yVal) -
			    (secondPoint.yVal),
			    (thirdPoint.zVal) -
			    (secondPoint.zVal));
	}
	if(measurementId == "Total_Facial_Convexity_Angle")
	{
	    v2 = new Vector((thirdPoint.xVal) -  //3, 2 pattern
			    (firstPoint.xVal),
			    (thirdPoint.yVal) -
			    (firstPoint.yVal),
			    (thirdPoint.zVal) -
			    (firstPoint.zVal));
	}

	//Some angles have four points, such as Nasolabial_Angle_4 and about 3 others.
	if(fourthPointExists)
	{
	    if((mId.usedFeatures.length == 4) && fourthPoint.xVal != "")
	    {
		v2 = new Vector((thirdPoint.xVal) -
				(fourthPoint.xVal),
				(thirdPoint.yVal) -
				(fourthPoint.yVal),
				(thirdPoint.zVal) -
				(fourthPoint.zVal));
		if(measurementId == "Mentocervical_Angle")
		{
		    v2 = new Vector((fourthPoint.xVal) -
				    (thirdPoint.xVal),
				    (fourthPoint.yVal) -
				    (thirdPoint.yVal),
				    (fourthPoint.zVal) -
				    (thirdPoint.zVal));
		}
	    }
	}

	// Find the dot product using vectors
	var dotProductVector = Vector.dot(v1, v2);

	// Convert the dot product vector into an array
	var dotProductArray = VectorMath.getArray(dotProductVector);

	// Sum the values in the array to obtain the dot product result
	var dotProduct = sum(dotProductArray) - 1;

	var v1Len = Math.abs(v1.len());
	var v2Len = Math.abs(v2.len());

	// Determine the angle in radians
	var radians = Math.acos(dotProduct / (v1Len * v2Len));

	// Convert radians to degrees
	var degrees = radians * (180 / Math.PI);

	document.getElementById("val-" + measurementId).innerHTML = degrees.toFixed(2) + " degrees";

	//updated - working but not for some values
	if(degrees.toFixed(2) > mId.rangeStart && degrees.toFixed(2) < mId.rangeEnd){ // if the value is within range
	    document.getElementById("val-" + measurementId).style["background-color"] = ""; // keep the value text background clear
	}
	else{
	    document.getElementById("val-" + measurementId).style["background-color"] = "orange"; // turn the value text background red
	}				

	mId.value = degrees.toFixed(2);
	measurementCreated = true;
    }

}

let findRatio = (mId): void => {
    //The ratio function don't include this if statement; we just have to use it once here.
    if (firstPoint.xVal != "" && secondPoint.xVal != "" && thirdPoint.xVal != "") {
	//Some ratios use different formulas
	if(measurementId == "Nasal_Tip_Projection:_Byrd_and_Hobar" || measurementId == "Nasal_Tip_Projection:_Crumley_and_Lanser_I" || measurementId == "Nasal_Tip_Projection:_Crumley_and_Lanser_II"|| measurementId == "Nasal_Tip_Projection:_Powell_and_Humphries")
	{
	    findRatioTypeTwo(mId);
	}
	else if(measurementId == "Nasal_Tip_Projection:_Baum")
	{
	    findRatioTypeThree(mId);
	}
	else
	{
	    findRatioTypeOne(mId);
	}
    }
}

let findRatioTypeOne = (mId): void => {
    var v1 = new Vector((firstPoint.xVal) -
	                (secondPoint.xVal),
	                firstPoint.yVal -
	                (secondPoint.yVal),
	                (firstPoint.zVal) -
	                (secondPoint.zVal));

    var v2 = new Vector((thirdPoint.xVal) -
	                (firstPoint.xVal),
	                (thirdPoint.yVal) -
	                (firstPoint.yVal),
	                (thirdPoint.zVal) -
	                (firstPoint.zVal));
    if(mId.usedFeatures.length == 4)
    {
	if(fourthPointExists && (fourthPoint.xVal != ""))
	{
	    v2 = new Vector((thirdPoint.xVal) -
			    (fourthPoint.xVal),
			    (thirdPoint.yVal) -
			    (fourthPoint.yVal),
			    (thirdPoint.zVal) -
			    (fourthPoint.zVal));
	}
	else
	{
	    return;
	}
    }
    //Some measurements have different formulas for v2...
    if(measurementId == "Nasal_Tip_Projection:_Goode")
    {
	v2 = new Vector((firstPoint.xVal) -
		        (thirdPoint.xVal),
		        (firstPoint.yVal) -
		        (thirdPoint.yVal),
		        (firstPoint.zVal) -
		        (thirdPoint.zVal));
    }
    var v1Len = v1.len();
    var v2Len = v2.len();
    var result = v2Len / v1Len;
    //the result fraction varies between measurements
    if(measurementId == "Nasal_Width-Length_Ratio" || measurementId == "Nasal_Width–Intercanthal_Distance_Ratio" || measurementId == "Lobule_-_Base_Ratio")
    {
	result = v1Len / v2Len;
    }
    document.getElementById("val-" + measurementId).innerHTML = result.toFixed(2) + "";

    //updated - working
    if(result.toFixed(2) > mId.rangeStart && result.toFixed(2) < mId.rangeEnd){ // if the value is within range
	document.getElementById("val-" + measurementId).style["background-color"] = ""; // keep the value text background clear
    }
    else{
	document.getElementById("val-" + measurementId).style["background-color"] = "orange"; // turn the value text background red
    }

    mId.value = result.toFixed(2);
    measurementCreated = true;
}

let findRatioTypeTwo = (mId): void => {
    var v1 = new Vector((firstPoint.xVal) -
		        (secondPoint.xVal),
		        (firstPoint.yVal) -
		        (secondPoint.yVal),
		        (firstPoint.zVal) -
		        (secondPoint.zVal));

    var v2 = new Vector((firstPoint.xVal) -
		        (thirdPoint.xVal),
		        (firstPoint.yVal) -
		        (thirdPoint.yVal),
		        (firstPoint.zVal) -
		        (thirdPoint.zVal));

    var v3 = new Vector((thirdPoint.xVal) -
		        (firstPoint.xVal),
		        (thirdPoint.yVal) -
		        (firstPoint.yVal),
		        (thirdPoint.zVal) -
		        (firstPoint.zVal));

    var v4 = new Vector((firstPoint.xVal) -
		        (secondPoint.xVal),
		        (firstPoint.yVal) -
		        (secondPoint.yVal),
		        (firstPoint.zVal) -
		        (secondPoint.zVal));

    if(mId.usedFeatures.length == 4)
    {
	if(fourthPointExists && (fourthPoint.xVal != ""))
	{
	    v3 = new Vector((firstPoint.xVal) -
			    (fourthPoint.xVal),
			    (firstPoint.yVal) -
			    (fourthPoint.yVal),
			    (firstPoint.zVal) -
			    (fourthPoint.zVal));

	    v4 = new Vector((fourthPoint.xVal) -
			    (thirdPoint.xVal),
			    (fourthPoint.yVal) -
			    (thirdPoint.yVal),
			    (fourthPoint.zVal) -
			    (thirdPoint.zVal));
	}
    }
    //some points have different formulas for the vectors
    if(measurementId == "Nasal_Tip_Projection:_Crumley_and_Lanser_I" || measurementId == "Nasal_Tip_Projection:_Crumley_and_Lanser_II" || measurementId == "Nasal_Tip_Projection:_Powell_and_Humphries")
    {
	v2 = new Vector((thirdPoint.xVal) -
			(secondPoint.xVal),
			(thirdPoint.yVal) -
			(secondPoint.yVal),
			(thirdPoint.zVal) -
			(secondPoint.zVal));
    }

    var distOne = v1.len();
    var crossProductVector = Vector.cross(v2, v3);
    var crossProductLen = crossProductVector.len();
    var v4Len = v4.len();
    var distTwo = crossProductLen / v4Len;
    var projection = distTwo / distOne;
    //Some measurements differ in how projection is calculated...
    if(measurementId == "Nasal_Tip_Projection:_Powell_and_Humphries" || measurementId == "Nasal_Tip_Projection:_Crumley_and_Lanser_II" || measurementId == "Nasal_Tip_Projection:_Crumley_and_Lanser_I")
    {
	projection = distOne/distTwo;
    }

    document.getElementById("val-" + measurementId).innerHTML = projection.toFixed(2) + "";

    //updated - working
    if(projection.toFixed(2) > mId.rangeStart && projection.toFixed(2) < mId.rangeEnd){ // if the value is within range
	document.getElementById("val-" + measurementId).style["background-color"] = ""; // keep the value text background clear
    }
    else{
	document.getElementById("val-" + measurementId).style["background-color"] = "orange"; // turn the value text background red
    }

    mId.value = projection.toFixed(2);
    measurementCreated = true;
}

let findRatioTypeThree = (mId): void => {
    var v1 = new Vector((firstPoint.xVal) -
	                (secondPoint.xVal),
	                (firstPoint.yVal) -
	                (secondPoint.yVal),
	                (firstPoint.zVal) -
	                (secondPoint.zVal));

    var v2 = new Vector((secondPoint.xVal) -
	                (thirdPoint.xVal),
	                (secondPoint.yVal) -
	                (thirdPoint.yVal),
	                (secondPoint.zVal) -
	                (thirdPoint.zVal));

    var v3 = new Vector((firstPoint.xVal) -
	                (thirdPoint.xVal),
	                (firstPoint.yVal) -
	                (thirdPoint.yVal),
	                (firstPoint.zVal) -
	                (thirdPoint.zVal));

    var AD = v1.len();
    var crossProductVector = Vector.cross(v1, v2);
    var crossProductLen = crossProductVector.len();
    var v3Len = v3.len();
    var BD = crossProductLen / v3Len;
    var AB = Math.sqrt((AD * AD) - (BD * BD));
    var projection = AB / BD;

    document.getElementById("val-" + measurementId).innerHTML = projection.toFixed(2) + "";

    //updated - working
    if(projection.toFixed(2) > mId.rangeStart && projection.toFixed(2) < mId.rangeEnd){ // if the value is within range
	document.getElementById("val-" + measurementId).style["background-color"] = ""; // keep the value text background clear
    }
    else{
	document.getElementById("val-" + measurementId).style["background-color"] = "orange"; // turn the value text background red
    }

    mId.value = projection.toFixed(2);
    measurementCreated = true;
}

// Function for adding two numbers
let sum = (arr): void => {
    return arr.reduce(function (a, b) { return a + b }, 0);
}

//This should return the mesh object of the main face
//Don't put in any arguments, the arguments are used for recursion
//Last updated 3/22/2022 by Phil
let getFaceMesh = (root, largestSize, largestObject): void => {
    if(root === undefined){
        root = scene;
    }
    for(var a = 0; a < root.children.length; a ++){
        if(root.children[a].type ==="Mesh"){
            if(root.children[a].geometry === undefined || root.children[a].geometry.type !== "BufferGeometry"){
                continue;
            }
            var count = root.children[a].geometry.getAttribute('position').count;
            if(largestSize == undefined || count > largestSize){
                largestObject = root.children[a];
                largestSize = count;
            }
        }
        else{
            var temp = getFaceMesh(root.children[a]);
            if(temp !== undefined){
                var s = temp.geometry.getAttribute('position').count;
                if(s > largestSize || largestSize === undefined){
                    largestObject = temp;
                    largestSize = s;
                }
            }
        }
    }
    return largestObject;
}
                                       
//Is the given point within a tetrahedron?
//Used by pointInRegion
//https://stackoverflow.com/questions/25179693/how-to-check-whether-the-point-is-in-the-tetrahedron-or-not
//Last edited 3/23/2022 by Phil
let pointInTetrahedron = (point, t1, t2, t3, t4): void => {
    return sameSide(point, t1, t2, t3, t4) &&
    sameSide(point, t2, t3, t4, t1) &&
    sameSide(point, t3, t4, t1, t2) &&
    sameSide(point, t4, t1, t2, t3);
}
                                       
let sameSide = (point, t1, t2, t3, t4): void => {
    /*
     var normal = {x: (t2.y-t1.y)*(t3.z-t1.z) - (t2.z-t1.z)-(t3.y-t1.y),
     y: (t2.z-t1.z)*(t3.x-t1.x) - (t2.x-t1.x)*(t3.z-t1.z),
     z: (t2.x-t1.x)*(t3.y-t1.y) - (t2.y-t1.y)*(t3.x-t1.x)};
     var dotV4 = normal.x*(t4.x-t1.x) + normal.y*(t4.y-t1.y) + normal.z*(t4.z-t1.z);
     var dotP = normal.x*(point.x-t1.x) + normal.y*(point.y-t1.y) + normal.z*(point.z-t1.z);
     */
    var a = {x: (t2.x-t1.x), y: (t2.y-t1.y), z: (t2.z-t1.z)};
    var b = {x: (t3.x-t1.x), y: (t3.y-t1.y), z: (t3.z-t1.z)};
    var c = {x: (t4.x-t1.x), y: (t4.y-t1.y), z: (t4.z-t1.z)};
    var d = {x: (point.x-t1.x), y: (point.y-t1.y), z: (point.z-t1.z)};
    var normal = {x: a.y*b.z-a.z*b.y, y: a.z*b.x-a.x*b.z, z: a.x*b.y-a.y*b.x};
    var dotV4 = normal.x*c.x + normal.y*c.y + normal.z*c.z;
    var dotP  = normal.x*d.x + normal.y*d.y + normal.z*d.z;
    return (Math.sign(dotV4) == Math.sign(dotP));
}
                                       
//Is a point within the region outlined by a set of points?
//E.g. is this point between the sn, al_l, n, and al_r?
//You can optionally pass in a pre-defined center to these points to reduce computation
//Used by the new findAreaOrVolume function
//Last edited 3/23/2022 by Phil
let pointInRegion = (point, region_points, region_center): void => {
    if(region_center === undefined){
        region_center = {x: 0, y: 0, z: 0};
        for(var a = 0; a < region_points.length; a ++){
            region_center.x += region_points[a].x/region_points.length;
            region_center.y += region_points[a].y/region_points.length;
            region_center.z += region_points[a].z/region_points.length;
        }
    }
    
    for(var a = 0; a < region_points.length-1; a ++){
        if(pointInTetrahedron(point,
                              {x: 0, y: 0, z: 0},
                              {x: region_points[a].x*2, y: region_points[a].y*2, z: region_points[a].z*2},
                              {x: region_points[a+1].x*2, y: region_points[a+1].y*2, z: region_points[a+1].z*2},
                              region_center)){
            return true;
        }
    }
    return pointInTetrahedron(point,
                              {x: 0, y: 0, z: 0},
                              {x: region_points[0].x*2, y: region_points[0].y*2, z: region_points[0].z*2},
                              {x: region_points[region_points.length-1].x*2, y: region_points[region_points.length-1].y*2, z: region_points[region_points.length-1].z*2},
                              region_center);
}
                                   
//Updated version of findAreaOrVolume that doesn't use raycasting
//Last edited 5/9/2022 by Phil
let findAreaOrVolume = (mId, isVolume, resolution): void => {
    //To Do:
    //Make the boarder around the measured region, don't know how to do this
    
    var avg_area = 0, min_area = 0, max_area = 0, weighted_area = 0;
    var avg_volume = 0, min_volume = 0, max_volume = 0, weighted_volume = 0;
    var current_date = new Date(); //For performance analysis
    var current_millis = current_date.getTime();
    var total_points = 0;
    
    //Find the minimum and maximum x and y points to quickly skip over points outside the region
    var min_x, min_y, max_x, max_y; //These are the maximums among the feature points
    //var feature_center = {x:0, y:0, z:0};
    var feature_points = []; //Stored here for formatting reasons
    for(var a = 0; a < mId.usedFeatures.length; a ++){
        if(measurementPoints[a] == "" || measurementPoints[a].xVal == ""){
            return; //Make sure all points are defined
        }
        if(min_x === undefined || measurementPoints[a].xVal < min_x){ min_x = measurementPoints[a].xVal; }
        if(max_x === undefined || measurementPoints[a].xVal > max_x){ max_x = measurementPoints[a].xVal; }
        if(min_y === undefined || measurementPoints[a].yVal < min_y){ min_y = measurementPoints[a].yVal; }
        if(max_y === undefined || measurementPoints[a].yVal > max_y){ max_y = measurementPoints[a].yVal; }
        //feature_center.x += measurementPoints[a].xVal/mId.usedFeatures.length;
        //feature_center.y += measurementPoints[a].yVal/mId.usedFeatures.length;
        //feature_center.z += measurementPoints[a].zVal/mId.usedFeatures.length;
        feature_points.push({x: measurementPoints[a].xVal, y: measurementPoints[a].yVal, z: measurementPoints[a].zVal});
    }
    
    //If its V5H3, we need to define the corner points
    if(mId.id === "Vertical_Fifths_Horizontal_Thirds_Area" || mId.id === "Vertical_Fifths_Horizontal_Thirds_Volume"){
        //0 and 2 are left and right, 1 and 3 are top and bottom
        var p0 = {x: feature_points[1].x,  y: feature_points[2].y,  z: feature_points[1].z};
        var p1 = {x: feature_points[3].x,  y: feature_points[2].y,  z: feature_points[3].z};
        var p2 = {x: feature_points[3].x,  y: feature_points[0].y,  z: feature_points[3].z};
        var p3 = {x: feature_points[1].x,  y: feature_points[0].y,  z: feature_points[1].z};
        feature_points[0] = get_projection_point(p0, {x:p0.x, y:p0.y, z:p0.z*2});
        feature_points[1] = get_projection_point(p1, {x:p1.x, y:p1.y, z:p1.z*2});
        feature_points[2] = get_projection_point(p2, {x:p2.x, y:p2.y, z:p2.z*2});
        feature_points[3] = get_projection_point(p3, {x:p3.x, y:p3.y, z:p3.z*2});
    }
    
    //Find the center of the feature points
    //Right between the first point and the middle point
    var middle_point = feature_points[Math.floor(feature_points.length/2)];
    var feature_center = {x: (feature_points[0].x+middle_point.x)/2, y: (feature_points[0].y+middle_point.y)/2, z: (feature_points[0].z+middle_point.z)/2};
    
    /*console.log("Min x: "+min_x);
     console.log("Max x: "+max_x);
     console.log("Min y: "+min_y);
     console.log("Max y: "+max_y);
     console.log("Center: ("+feature_center.x+", "+feature_center.y+", "+feature_center.z+")");*/
    
    //Iterate over all the triangles of the face
    //I don't think we're storing the face mesh so I made a function to find it
    var realFace = getFaceMesh();
    var points = realFace.geometry.getAttribute('position').array;
    
    //Find min_z
    var min_z; //Minimum over ALL points in region
    for(var a = 0; a < points.length; a += 3){
        if(points[a] >= min_x && points[a] <= max_x && points[a+1] >= min_y && points[a+1] <= max_y){
            if(pointInRegion({x: points[a], y: points[a+1], z: points[a+2]}, feature_points, feature_center)){
                if(points[a+2] < min_z || min_z === undefined){
                    min_z = points[a+2];
                }
            }
        }
    }
    //console.log("Min z: "+min_z);
    
    //Nine elements of the point array make up each triangle: p1's (x,y,z), then p2 and p3
    //Iterate over each triangle to find the areas
    for(var a = 0; a < points.length; a += 9){
        //Iterate over each point in this triangle to see how many points are in the region
        var inCount = 0;
        for(var b = a; b < a+9; b += 3){
            if(points[b] >= min_x && points[b] <= max_x && points[b+1] >= min_y && points[b+1] <= max_y){
                if(pointInRegion({x: points[b], y: points[b+1], z: points[b+2]}, feature_points, feature_center)){
                    inCount ++;
                }
            }
        }
        //Add up the total area and volume from this triangle
        if(inCount > 0){
            //Define surface and base points
            var surf1 = {x: points[a+0], y: points[a+1], z: points[a+2]};
            var surf2 = {x: points[a+3], y: points[a+4], z: points[a+5]};
            var surf3 = {x: points[a+6], y: points[a+7], z: points[a+8]};
            var base1 = {x: points[a+0], y: points[a+1], z: min_z};
            var base2 = {x: points[a+3], y: points[a+4], z: min_z};
            var base3 = {x: points[a+6], y: points[a+7], z: min_z};
            
            var temp_area = triangle_area(surf1, surf2, surf3);
            var temp_volume = 0;
            temp_volume += tetrahedron_volume(surf1, surf2, surf3, base1);
            temp_volume += tetrahedron_volume(surf2, surf3, base1, base2);
            temp_volume += tetrahedron_volume(surf3, base1, base2, base3);
            max_area += temp_area;
            max_volume += temp_volume;
            if(inCount === 3){
                min_area += temp_area;
                min_volume += temp_volume;
            }
            weighted_area += (inCount/3) * temp_area;
            weighted_volume += (inCount/3) * temp_volume;
            total_points += inCount; //Many of these will be counted multiple times
        }
    }
    avg_area = (min_area + max_area) / 2;
    avg_volume = (min_volume + max_volume) / 2;
    
    //Simple outline that doesn't follow the curvature of the face
    mId.storedPoints = [];
    for(var a = 0; a < feature_points.length; a ++){
        mId.storedPoints.push(new THREE.Vector3(feature_points[a].x, feature_points[a].y, feature_points[a].z));
    }
    mId.storedPoints.push(new THREE.Vector3(feature_points[0].x, feature_points[0].y, feature_points[0].z));
    
    //Output the data
    var linkedMeasurement = "";
    for(var i = 0; i < fixedMeasurementLength; i++){
        var lm_temp = findRowElementMeasurement(i);
        if(lm_temp.id === mId.linkedMeasurement){
            linkedMeasurement = lm_temp;
            break;
        }
    }
    if(linkedMeasurement === ""){
        console.log("No feature found: "+mId.linkedMeasurement);
    }
    if(isVolume){
        //document.getElementById("val-" + mId.id).innerHTML = avg_volume.toFixed(2) + " mm^3 [" + min_volume.toFixed(2) + " - " + max_volume.toFixed(2) + "]";
        document.getElementById("val-" + mId.id).innerHTML = avg_volume.toFixed(2) + " mm^3"; // + "[" + min_volume.toFixed(2) + " - " + max_volume.toFixed(2) + "]";
        mId.value = avg_volume.toFixed(2);
        console.log("Finished volume calculation: " + mId.name);
        console.log("Value: " + mId.value);
        if(linkedMeasurement != ""){
            // document.getElementById("val-" + linkedMeasurement.id).innerHTML = avg_area.toFixed(2) + " mm^2 [" + min_area.toFixed(2) + " - " + max_area.toFixed(2) + "]";
            document.getElementById("val-" + linkedMeasurement.id).innerHTML = avg_area.toFixed(2) + " mm^2"; // + "[" + min_area.toFixed(2) + " - " + max_area.toFixed(2) + "]";
            linkedMeasurement.value = avg_area.toFixed(2);
            linkedMeasurement.storedPoints = mId.storedPoints;
        } else{
            console.log("No linked measurements found");
        }
    }
    else{
        //document.getElementById("val-" + mId.id).innerHTML = avg_area.toFixed(2) + " mm^2 [" + min_area.toFixed(2) + " - " + max_area.toFixed(2) + "]";
        document.getElementById("val-" + mId.id).innerHTML = avg_area.toFixed(2) + " mm^2 "; // + "[" + min_area.toFixed(2) + " - " + max_area.toFixed(2) + "]";
        mId.value = avg_area.toFixed(2);
        console.log("Finished area calculation: " + mId.name);
        console.log("Value: " + mId.value);
        if(linkedMeasurement != ""){
            // document.getElementById("val-" + linkedMeasurement.id).innerHTML = avg_volume.toFixed(2) + " mm^3 [" + min_volume.toFixed(2) + " - " + max_volume.toFixed(2) + "]";
            document.getElementById("val-" + linkedMeasurement.id).innerHTML = avg_volume.toFixed(2) + " mm^3"; // + "[" + min_volume.toFixed(2) + " - " + max_volume.toFixed(2) + "]";
            linkedMeasurement.value = avg_volume.toFixed(2);
            linkedMeasurement.storedPoints = mId.storedPoints;
        } else{
            console.log("No linked measurements found");
        }
    }
    measurementCreated = true;
    current_date = new Date();
    var time_elapsed = current_date.getTime() - current_millis;
    console.log("Time: "+time_elapsed);
    console.log("Points: "+total_points);
    return {a_val: avg_area.toFixed(2), v_val: avg_volume.toFixed(2), points: total_points, time: time_elapsed}; //For generating CSV for measurement data
}
                                       
//Last edited 8/1/21 by Phil
let findAreaOrVolume_old = (mId, isVolume, resolution): void => {
    //Make sure all points are defined before beginning calculation
    for(var a = 0; a < mId.usedFeatures.length; a ++){
        if(measurementPoints[a] == "" || measurementPoints[a].xVal == ""){
            return;
        }
    }
    if(resolution === undefined){
        var select = document.getElementById("precisionSelect");
        resolution = parseInt(select.options[select.selectedIndex].value);
    }
    var current_date = new Date(); //For performance analysis
    var current_millis = current_date.getTime();
    var total_points = 0;
    //We need 2 arrays to calculate the area one strip at a time
    var old_array = [];
    var new_array = [];
    //The base arrays hold points corresponding to the flat surface before using the raycaster, for volume measurement
    var old_base_array = [];
    var new_base_array = [];
    var total_area = 0;
    var base_area = 0;
    var total_volume = 0;
    var min_z = 999;
    //Arrays to store the border points for displaying the lines later
    var left_array  = [];
    var right_array = [];
    var top_array   = [];
    var bottom_array= [];
    
    //Make a clone of each of the required points
    var clonedPoints = [];
    for(var a = 0; a < mId.usedFeatures.length; a ++){
        clonedPoints[a] = {x: measurementPoints[a].xVal, y: measurementPoints[a].yVal, z: measurementPoints[a].zVal};
    }
    //Split it into a bunch of quads, calculate each quad independently
    for(var a = 0; a < mId.usedFeatures.length-2; a += 2){
        //First, define the four corner points
        //a is the bottom-left or bottom_right point (it alternates)
        //Maybe I should make these THREE.Vector3 instead of standard objects?
        if(mId.id === "Vertical_Fifths_Horizontal_Thirds_Area" || mId.id === "Vertical_Fifths_Horizontal_Thirds_Volume"){
            //0 and 2 are left and right, 1 and 3 are top and bottom
            var p0 = {x: clonedPoints[0].x,  y:clonedPoints[1].y,  z:clonedPoints[0].z};
            var p1 = {x: clonedPoints[2].x,  y:clonedPoints[1].y,  z:clonedPoints[2].z};
            var p2 = {x: clonedPoints[2].x,  y:clonedPoints[3].y,  z:clonedPoints[2].z};
            var p3 = {x: clonedPoints[0].x,  y:clonedPoints[3].y,  z:clonedPoints[0].z};
            p0 = get_projection_point(p0, {x:p0.x, y:p0.y, z:p0.z*2});
            p1 = get_projection_point(p1, {x:p1.x, y:p1.y, z:p1.z*2});
            p2 = get_projection_point(p2, {x:p2.x, y:p2.y, z:p2.z*2});
            p3 = get_projection_point(p3, {x:p3.x, y:p3.y, z:p3.z*2});
        }
        else{
            var p0 = {x: clonedPoints[a].x,   y:clonedPoints[a].y,   z:clonedPoints[a].z};
            var p1 = {x: clonedPoints[a+1].x, y:clonedPoints[a+1].y, z:clonedPoints[a+1].z};
            var p2 = {x: clonedPoints[a+2].x, y:clonedPoints[a+2].y, z:clonedPoints[a+2].z};
            var p3 = p2;
            if(a+3 < mId.usedFeatures.length){
                //For odd-numbered polygons, the last point will be repeated twice to make a triangle
                p3 = {x: clonedPoints[a+3].x,  y:clonedPoints[a+3].y,  z:clonedPoints[a+3].z};
            }
            if(a%4 === 2){
                //Every even-numbered quadrilateral needs to be flipped horizontally
                var t = p0;
                p0 = p1;
                p1 = t;
                t = p3;
                p3 = p2;
                p2 = t;
            }
        }
        
        var distance_0_1 = Math.sqrt(Math.pow(p0.x-p1.x, 2)+Math.pow(p0.y-p1.y, 2)+Math.pow(p0.z-p1.z, 2));
        var distance_3_2 = Math.sqrt(Math.pow(p3.x-p2.x, 2)+Math.pow(p3.y-p2.y, 2)+Math.pow(p3.z-p2.z, 2));
        var distance_0_3 = Math.sqrt(Math.pow(p0.x-p3.x, 2)+Math.pow(p0.y-p3.y, 2)+Math.pow(p0.z-p3.z, 2));
        var distance_2_1 = Math.sqrt(Math.pow(p2.x-p1.x, 2)+Math.pow(p2.y-p1.y, 2)+Math.pow(p2.z-p1.z, 2));
        var x_split = Math.ceil(Math.max(distance_0_1, distance_3_2)/resolution); //How many squares will there be?
        var y_split = Math.ceil(Math.max(distance_0_3, distance_2_1)/resolution); //There will be split+1 points across the axis
        //Note that those aren't the actual x and y axes, in this context I call "x" 0->1 and 3->2 and "y" 0->3 and 1->2
        
        //Iterate over x_split points left/right and y_split points up/down
        //Find the area or volume of each quad, sum them all up
        for(var c_y = 0; c_y <= y_split; c_y ++){
            new_array.length = 0; //Empty the current array
            new_base_array.length = 0;
            //Left point; between p0 and p3
            var lp = {x: lerp(p0.x, p3.x, c_y/y_split), y: lerp(p0.y, p3.y, c_y/y_split), z: lerp(p0.z, p3.z, c_y/y_split)};
            //Right point; between p1 and p2
            var rp = {x: lerp(p1.x, p2.x, c_y/y_split), y:lerp(p1.y, p2.y, c_y/y_split), z:lerp(p1.z, p2.z, c_y/y_split)};
            for(var c_x = 0; c_x <= x_split; c_x ++){
                //Between the left and right points
                var base_point = {x: lerp(lp.x, rp.x, c_x/x_split), y: lerp(lp.y, rp.y, c_x/x_split), z: lerp(lp.z, rp.z, c_x/x_split)};
                var real_point;
                if(mId.id === "Alar_Base_Area" || mId.id === "Alar_Base_Volume"){
                    real_point = get_projection_point(base_point, {x:0, y:-50, z:200});
                }
                else if(mId.id === "Vertical_Fifths_Horizontal_Thirds_Area" || mId.id === "Vertical_Fifths_Horizontal_Thirds_Volume"){
                    real_point = get_projection_point(base_point, {x:base_point.x, y:base_point.y, z:base_point.z*2});
                }
                else{
                    real_point = get_projection_point(base_point);
                }
                new_array.push(real_point);
                base_point = {x:base_point.x, y:base_point.y, z:0};
                new_base_array.push(base_point);
                //Don't add the areas of the leftmost and bottommost points, the arrays will be out of range
                if(c_y > 0 && c_x > 0){
                    var l = new_array.length;
                    total_volume += tetrahedron_volume(new_array[l-2], new_array[l-1], old_array[l-1], new_base_array[l-1]);
                    total_volume += tetrahedron_volume(new_array[l-2], old_array[l-2], old_array[l-1], old_base_array[l-2]);
                    total_volume += tetrahedron_volume(new_base_array[l-1], old_base_array[l-1], old_base_array[l-2], old_array[l-1]);
                    total_volume += tetrahedron_volume(new_base_array[l-1], new_base_array[l-2], old_base_array[l-2], new_array[l-2]);
                    total_volume += tetrahedron_volume(new_base_array[l-1], new_array[l-2], old_base_array[l-2], old_array[l-1]);
                    total_area += triangle_area(new_array[l-1], new_array[l-2], old_array[l-2]);
                    total_area += triangle_area(new_array[l-1], old_array[l-2], old_array[l-1]);
                    base_area  += triangle_area(new_base_array[l-1], new_base_array[l-2], old_base_array[l-2]);
                    base_area  += triangle_area(new_base_array[l-1], old_base_array[l-2], old_base_array[l-1]);
                }
                if(real_point.z < min_z){
                    min_z = real_point.z;
                }
                //Add the border points to arrays to draw (in Vector3 form)
                if(c_x === 0){
                    left_array.push(new THREE.Vector3(real_point.x, real_point.y, real_point.z));
                }
                if(c_y === 0 && a === 0){
                    bottom_array.push(new THREE.Vector3(real_point.x, real_point.y, real_point.z));
                }
                if(c_x === x_split){
                    right_array.push(new THREE.Vector3(real_point.x, real_point.y, real_point.z));
                }
                if(c_y === y_split && a+4 >= mId.usedFeatures.length){
                    left_array.push(new THREE.Vector3(real_point.x, real_point.y, real_point.z));
                }
                total_points ++;
            }
            //This is swapping the pointers, not the values
            var t = old_array;
            old_array = new_array;
            new_array = t;
            t = old_base_array;
            old_base_array = new_base_array;
            new_base_array = t;
        }
    }
    //console.log("Volume before subtraction: "+total_volume);
    //Total volume is volume from surface to z=0
    total_volume -= min_z*base_area; //so we subtract the area from z=0 to where the new base is
    //Construct the border
    mId.storedPoints = bottom_array;
    Array.prototype.push.apply(mId.storedPoints, right_array);
    Array.prototype.push.apply(mId.storedPoints, top_array.reverse());
    Array.prototype.push.apply(mId.storedPoints, left_array.reverse());
    
    //Both the volume and area are calculated at the same time
    var linkedMeasurement = "";
    for(var i = 0; i < fixedMeasurementLength; i++){
        var lm_temp = findRowElementMeasurement(i);
        if(lm_temp.id === mId.linkedMeasurement){
            linkedMeasurement = lm_temp;
            break;
        }
    }
    if(linkedMeasurement === ""){
        console.log("No feature found: "+mId.linkedMeasurement);
    }
    if(isVolume){
        document.getElementById("val-" + mId.id).innerHTML = total_volume.toFixed(2) + " mm^3";
        mId.value = total_volume.toFixed(2);
        console.log("Finished volume calculation: " + mId.name);
        console.log("Value: " + mId.value);
        if(linkedMeasurement != ""){
            document.getElementById("val-" + linkedMeasurement.id).innerHTML = total_area.toFixed(2) + " mm^3";
            linkedMeasurement.value = total_area.toFixed(2);
            linkedMeasurement.storedPoints = mId.storedPoints;
        } else{
            console.log("No linked measurements found");
        }
    }
    else{
        document.getElementById("val-" + mId.id).innerHTML = total_area.toFixed(2) + " mm^2";
        mId.value = total_area.toFixed(2);
        console.log("Finished area calculation: " + mId.name);
        console.log("Value: " + mId.value);
        if(linkedMeasurement != ""){
            document.getElementById("val-" + linkedMeasurement.id).innerHTML = total_volume.toFixed(2) + " mm^2";
            linkedMeasurement.value = total_volume.toFixed(2);
            linkedMeasurement.storedPoints = mId.storedPoints;
        } else{
            console.log("No linked measurements found");
        }
    }
    measurementCreated = true;
    
    current_date = new Date();
    var time_elapsed = current_date.getTime() - current_millis;
    console.log("Elapsed milliseconds: " + time_elapsed);
    console.log("Total points calculated: " + total_points);
    //console.log("Min Z: "+min_z);
    //console.log("Base Area: "+base_area);
    return {a_val: total_area.toFixed(2), v_val: total_volume.toFixed(2), points: total_points, time: time_elapsed}; //For generating CSV for measurement data
}

//Last edited 7/12/21 by Phil
let findSurfaceArea = (mId): void => {
    findAreaOrVolume(mId, 0);
}

//Last edited 7/12/21 by Phil
let findArea = (mId): void => { //Change this to polygonal calculation
    //This needs to be edited:
    //Find the midpoint of all involved points and find areas of triangles that make up the polygon
    findAreaOrVolume(mId, 0);
}

//Last edited 7/12/21 by Phil
let findVolume = (mId): void => {
    findAreaOrVolume(mId, 1);
}
                                       
//Last edited 8/1/21 by Phil
let generateMeasurementCSV1 = (): void => {
    var current_date = new Date(); //For performance analysis
    var current_millis = current_date.getTime();
    
    var testedMeasurements = ["Tip_Surface_Area", "Nasal_Dorsum_Area", "Entire_Nose_Area", "Dorsal_Hump_Area","Vertical_Fifths_Horizontal_Thirds_Area", "Alar_Base_Area", "Root_of_the_Nose_Area"];
    var print = "";
    //Iterate for each measurement
    for(var a = 0; a < testedMeasurements.length; a ++){
        //Find the measurement in question
        var currentMeasurement = "";
        for(var i = 0; i < fixedMeasurementLength; i++){
            var cm_temp = findRowElementMeasurement(i);
            if(cm_temp.id === testedMeasurements[a]){
                currentMeasurement = cm_temp;
                break;
            }
        }
        //Add area_4mm_val + area_4mm_time + area_4mm_vertices
        //Then for 2mm 1mm
        //Then for volume
        setMeasurementPoints(currentMeasurement);
        var vals_4mm = findAreaOrVolume(currentMeasurement, 0, 4);
        setMeasurementPoints(currentMeasurement);
        var vals_2mm = findAreaOrVolume(currentMeasurement, 0, 2);
        setMeasurementPoints(currentMeasurement);
        var vals_1mm = findAreaOrVolume(currentMeasurement, 0, 1);
        
        print += vals_4mm.a_val + "\t\t" + (vals_4mm.time/1000) + "\t" + vals_4mm.points + "\r\n";
        print += vals_2mm.a_val + "\t\t" + (vals_2mm.time/1000) + "\t" + vals_2mm.points + "\r\n";
        print += vals_1mm.a_val + "\t\t" + (vals_1mm.time/1000) + "\t" + vals_1mm.points + "\r\n";
        
        print += vals_4mm.v_val + "\t\t" + (vals_4mm.time/1000) + "\t" + vals_4mm.points + "\r\n";
        print += vals_2mm.v_val + "\t\t" + (vals_2mm.time/1000) + "\t" + vals_2mm.points + "\r\n";
        print += vals_1mm.v_val + "\t\t" + (vals_1mm.time/1000) + "\t" + vals_1mm.points + "\r\n";
    }
    console.log(print);
    
    current_date = new Date();
    var time_elapsed = current_date.getTime() - current_millis;
    console.log("Elapsed milliseconds: " + time_elapsed);
}
                                        
//Last edited 8/1/21 by Phil
let generateMeasurementCSV2 = (): void => {
    var current_date = new Date(); //For performance analysis
    var current_millis = current_date.getTime();
    
    var testedMeasurements = ["Tip_Surface_Area", "Nasal_Dorsum_Area", "Entire_Nose_Area", "Dorsal_Hump_Area","Vertical_Fifths_Horizontal_Thirds_Area", "Alar_Base_Area", "Root_of_the_Nose_Area"];
    var print_area_val = "";
    var print_area_time= "";
    var print_vol_val  = "";
    var print_vol_time = "";
    //Iterate for each measurement
    for(var a = 0; a < testedMeasurements.length; a ++){
        //Find the measurement in question
        var currentMeasurement = "";
        for(var i = 0; i < fixedMeasurementLength; i++){
            var cm_temp = findRowElementMeasurement(i);
            if(cm_temp.id === testedMeasurements[a]){
                currentMeasurement = cm_temp;
                break;
            }
        }
        //Add area_4mm_val + area_4mm_time + area_4mm_vertices
        //Then for 2mm 1mm
        //Then for volume
        setMeasurementPoints(currentMeasurement);
        var vals= findAreaOrVolume(currentMeasurement, 0);
        print_area_val  += vals.a_val + "\t";
        print_vol_val   += vals.v_val + "\t";
        print_area_time += (vals.time/1000) + "\t";
        print_vol_time  += (vals.time/1000) + "\t";
    }
    console.log("Area values:");
    console.log(print_area_val);
    console.log("Area times:");
    console.log(print_area_time);
    console.log("Volume values:");
    console.log(print_vol_val);
    console.log("Volume times:");
    console.log(print_vol_time);
    
    current_date = new Date();
    var time_elapsed = current_date.getTime() - current_millis;
    console.log("Elapsed milliseconds: " + time_elapsed);
}

