//This file does not used a fixed length: all feature points and measurements need to be known.
function createAndDownloadJSON() {
    // var today = new Date();
    // var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    // var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    // var datetime = date + "-" + time;
    // var filename = "SaveData-" + datetime + ".JSON";

    // console.log('value:'+ document.getElementById("OBJImport").value);
    
    
    //var nameOfModel = findSelectedFiles("load");  
    //var fileNameToLoad = nameOfModel[0].replace(/\.[^/.]+$/, "");
    
    var fileNameToLoad = projectsList.options[projectsList.selectedIndex].text;
    
    console.log('File to load: ', fileNameToLoad);

    var filename = fileNameToLoad+ ".JSON";
    var metrics = "millimeters";
    var angleMetrics = "degrees";
    // var modelName = document.getElementById("OBJImport").value;
    var modelName = window.fileNameNoExtension;


    function createFeatureText() {
        //var featureText = JSON.stringify(fpoints);
        var valuableFPoints = [];
        for (var i = 0; i < fpoints.length; i++) {
            if (fpoints[i].xVal != "") {
                valuableFPoints.push(fpoints[i]);
            }
        }

        return valuableFPoints;
    }

    function createMeasurementText() {
        //var measurementText = JSON.stringify(measurementData);
        var measurementText = measurementData;
        var valuableMeasurements = [];
        for (var i = 0; i < measurementData.length; i++) {
            if (measurementData[i].value != "") {
                valuableMeasurements.push(measurementData[i]);
            }
        }
        return valuableMeasurements;
    }
    var jsonText = {
        threeDModel: modelName,
        gender: modelGender,
        age: modelAge,
        features: createFeatureText(),
        measurements: createMeasurementText()
    };
    var jsonReadyText = JSON.stringify(jsonText, null, 4);
    var pom = document.createElement('a');
    var bb = new Blob([jsonReadyText], {
        type: 'application/json'
    });

    // var files = document.getElementById('fileToUpload[]').files;

    // pom.setAttribute('href', window.URL.createObjectURL(bb));
    // pom.setAttribute('download', filename);

    // pom.dataset.downloadurl = ['application/json', pom.download, pom.href].join(':');
    // pom.draggable = true;
    // pom.classList.add('dragout');

    // pom.click();
    
    //Save json file to the S3 bucket of the authenticated user
    const bucketName = "digi-rhino";
    const bucketRegion = "us-east-2";
    const userPoolId = 'us-east-2_erDYNeJ0z';
    const loginString = 'cognito-idp.' + bucketRegion + '.amazonaws.com/' + userPoolId;
    var folderPrefixPath = AWS.config.credentials.identityId + '/' + filename;
    var s3 = new AWS.S3({
        params: {
            Bucket: bucketName
        }
    });
    var params = {
        Bucket: bucketName,
        Key: folderPrefixPath,
        ContentType: 'json',
        Body: bb
    };
    s3.putObject(params, function(err, data) { //We 'put' or upload the files with the parameters given to the prefix or folder path in the AWS S3 bucket.
        if (err) {
            alert(' Failed to upload json file, please contact admin.');
        } else {
            console.log('successfully uploaded json file'); //Implement a way that a person knows their file was uploaded visually.
            //alert('Succesfully uploaded json file.');
            mostRecentFilesListed = false;
        }
    });
}

//This gets and updates the jason folder whenever called (it also updates the ui elements too)
function getJSON() {

    var btn = document.getElementById("loadBtnImg");
    btn.src = "./img/importXML.png";
    
    //var nameOfModel = findSelectedFiles("load");
    //var fileNameToLoad = nameOfModel[0].replace(/\.[^/.]+$/, "");
    
    var fileNameToLoad = projectsList.options[projectsList.selectedIndex].text;
    
    console.log(fileNameToLoad);


    var filename = fileNameToLoad + ".JSON";
    //console.log(filename);

    var xhrJSON = new XMLHttpRequest();
    var method = 'GET';
    var overrideMimeType = 'application/json';

    //my edits to the topskal get jason func
    var folderPrefixPath = AWS.config.credentials.identityId + '/' + filename;
    var s3 = new AWS.S3({
        params: {
            Bucket: bucketName
        }
    });
    var params2 = {
        Bucket: bucketName,
        Key: folderPrefixPath,
        Expires: 120
    };
    var preSignedUrl = s3.getSignedUrl('getObject', params2);
    //alert(preSignedUrl);
    if(typeof(preSignedUrl) == 'string' && preSignedUrl != "")
    {
        var extension = ".JSON";
        folderPrefixPath = preSignedUrl;
    }
    //end my edits
    
    //alert(folderPrefixPath);
    xhrJSON.overrideMimeType(overrideMimeType);
    xhrJSON.onreadystatechange = function() {
        if(xhrJSON.readyState === XMLHttpRequest.DONE && xhrJSON.status === 200) {
            var jsonData = JSON.parse(xhrJSON.responseText);	
	    //jsonData.measurements has the measurements
            //jsonData.features has the features
            importFeaturePoints(jsonData.features, jsonData.measurements);
        } // end if
    }; // end xhr.onreadystatechange function


    xhrJSON.open(method, folderPrefixPath, true);

    xhrJSON.send();
}




function importFeaturePoints(featurePoints, allMeasurements) {
    
    //alert(`The jason has been imported`);
    console.log(featurePoints);
    deleteTableRows(document.getElementById("measurements"));
    deleteTableRows(document.getElementById("features"));
    var featurePoint;
    var featurePointImport;
    var fpDoesntExist;
    if (featurePoints.length > 0) {
        for (var i = 0; i < fpoints.length; i++) //Loops through the list of fpoints instead of the imported file.
        {
            //get feature point from fpoints and the imported file
            featurePoint = fpoints[i];
            for (var s = 0; s < featurePoints.length; s++) {
                featurePointImport = featurePoints[s];
                if (featurePoint.id == featurePointImport.id) {
                    fpDoesntExist = false;
                    break;
                } else {
                    fpDoesntExist = true;
                }

            }
            if (!fpDoesntExist) { //replace points from fpoints with the one ones found in the imported file only if they have data.

                fpoints[i].xVal = featurePointImport.xVal;
                fpoints[i].yVal = featurePointImport.yVal;
                fpoints[i].zVal = featurePointImport.zVal;
                if (featurePointImport.beginningPoint) {
                    fpoints[i].beginningPoint = featurePointImport.beginningPoint;
                }
                if (featurePointImport.endPoint) {
                    fpoints[i].endPoint = featurePointImport.endPoint;
                }
                if (featurePointImport.cameraX) {
                    fpoints[i].cameraX = featurePointImport.cameraX;
                    fpoints[i].cameraY = featurePointImport.cameraY;
                    fpoints[i].cameraZ = featurePointImport.cameraZ;
                }
                fpoints[i].list = "Y";
                dotCreated = true;
            } else {
                if (fpoints[i].list) {
                    fpoints[i].list = "N";
                }
            }
        }
    } else {
        for (var i = 0; i < fpoints.length; i++) {
            fpoints[i].list = "N";
        }
    }
    var measurement;
    var measurementImport;
    var measurementDoesntExist;
    if (allMeasurements.length > 0) {
        for (var i = 0; i < measurementData.length; i++) //Loops through the list of fpoints instead of the imported file.
        {
            measurementCreated = true;
            //get measurements from measurementData and the imported file
            measurement = measurementData[i];
            for (var s = 0; s < allMeasurements.length; s++) {
                measurementImport = allMeasurements[s];
                if (measurement.id == measurementImport.id) {
                    measurementDoesntExist = false;
                    break;
                } else {
                    measurementDoesntExist = true;
                }

            }
            if (!measurementDoesntExist) { //replace points from fpoints with the one ones found in the imported file only if they have data.
                measurementData[i].value = measurementImport.value;
                if (measurementImport.storedPoints) //do these attributes exist? If they do, consider them (used for older versions).
                {
                    measurementData[i].storedPoints = measurementImport.storedPoints;
                }
                if (measurementImport.numberOfSegments) {
                    measurementData[i].numberOfSegments = measurementImport.numberOfSegments;
                }
                if (measurementImport.cameraX) {
                    measurementData[i].cameraX = measurementImport.cameraX;
                    measurementData[i].cameraY = measurementImport.cameraY;
                    measurementData[i].cameraZ = measurementImport.cameraZ;
                }
                measurementData[i].list = "Y";
            } else {
                if (measurementData[i].list) {
                    measurementData[i].list = "N";
                }
            }
        }
    } else {
        for (var i = 0; i < measurementData.length; i++) {
            measurementData[i].list = "N";
        }
    }
    setTimeout(() => { //we use setTimeout. A weird synchronous programming problem.
        createFeatureList(false);
        createMeasurementList(false);
    }, 100)
    cleanUpLabels();
    if (toggleLandmarks) {
        toggleVisualizationOff();
    }
}



function readImport() {

    function handleFileSelect(evt) {
        file = evt.target.files; // FileList object
    }
    document.getElementById('JSONImport').addEventListener('change', handleFileSelect, false);
}

function importFiles() {

    var reader = new FileReader();

    reader.onload = function(e) {
        var tempPath = URL.createObjectUrl(e.target.files[0]);

        console.log(tempPath);
    }
    // const modelFile = document.getElementById('OBJImport').files[0];

    const textureFile = document.getElementById('MTLImport').files[0];
    // console.log(modelFile);
    console.log(textureFile);
}

