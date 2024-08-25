var zoomInterval;
var projectsListUpdated = false;

function fetchProjects(thelist)
{
    //alert("fetch Projects");
    allKeys = []

    if(!projectsListUpdated) {
        var projectsList = document.getElementById(thelist.id);
        deleteTableRows(projectsList);
        
        //if(!mostRecentFilesListed)
        //{
        var fileLoadPromise = listAllKeys();
        fileLoadPromise.then(
            data => popProjs(data, thelist),
            error => alert(`Error: ${error.message}`)
        );

        //}
    }
    projectsListUpdated = true;
    //alert(listOfFiles);
    //alert(fileList);
}


function popProjs(data , thelist)
{
    //if(!mostRecentFilesListed)
    //{
    listOfFiles = data;
    //}
    
    var projectsList = document.getElementById(thelist.id);

    for (a in projectsList.options) { projectsList.options.remove(0); }
    
    var prev;
    
    for(var i = 0; i < listOfFiles.length; i++)
    {
	
        var fileName = listOfFiles[i].Key.slice((listOfFiles[i].Key.lastIndexOf("/") - 1 >>> 0) + 2); //Get the file name from the prefix name.
	var NoExt = fileName.replace(/\.[^/.]+$/, "");
	var extension = '.' + fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
        
	if (prev != NoExt){    
	    var file = document.createElement('option');
            file.text = NoExt;
            file.value = i;
            projectsList.options.add(file);
	}
	prev = NoExt;
    }
    loadIfFromAnalyzer();
}

function loadIfFromAnalyzer() {
    if (window.location.href.includes('#')) {
        var tmpString = window.location.href;
        tmpString = tmpString.substring(tmpString.indexOf('#') + 1);
        var val;
        var list = document.getElementById('projectsList');
        for (var i = 0; i < list.options.length; i++) {
            if (list.options[i].text == tmpString) {
                console.log(list.options[i].value);
                val = list.options[i].value;
            }
        }
        document.getElementById('projectsList').value = val;
        loadFromDropDownFunc();
    }
}

function loadFromDropDownFunc()
{
    toggleTracker = false; // fetch jason on reset?
    resetData();
    
    var btn = document.getElementById("loadBtnImg");
    btn.src = "./img/hourglass.png";
    
    var projectsList = document.getElementById("projectsList");

    var g = 0;
    for(var i = listOfFiles.length-1; i >= 0; i--)
    {
	var fileName = listOfFiles[i].Key.slice((listOfFiles[i].Key.lastIndexOf("/") - 1 >>> 0) + 2); //Get the file name from the prefix name.
	var NoExt = fileName.replace(/\.[^/.]+$/, "");
	var extension = '.' + fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
	
	if((!fileName.indexOf(projectsList.options[projectsList.selectedIndex].text)) ){
	    selectedFiles[g] = fileName;
	    g++;
	}
    }

    //if we're loading, then we also need auxiliary files if the type supports them.
    window.fileNameNoExtention = projectsList.options[projectsList.selectedIndex].text;
    fileToLoad = selectedFiles[0];
    
    //alert("slked:s"+selectedFiles);

    //getJSON();
    

    var urlPromise = findFileUrls(selectedFiles); //s3Connections.js
    urlPromise.then(
        loadModel()
    );
    
}

function deleteTableRows(table) //input the actual DOM element.
{
    if (table.rows) {
	var staticInt = table.rows.length;	
	var limit = 2; //weird bug with the tables: if you set it to 1, the search bars are removed only for the lists that are used for the actual analyzer (not the edit lists).
	if (table.id == "editMeasurements" || table.id == "editFeatures" || table.id == "fileList") {
	    limit = 1;
	}
	for (var i = staticInt - 1; i >= limit; i--) //the third row element is where the rows actually begin.
	{
	    if (table.deleteRow(i)) {
		table.deleteRow(i);
	    }
	}
    }
}


// 
function fileDeleteConfirm(){
    allKeys = [];
    mostRecentFilesListed = false;
    $("#fileDeleteConfirm").modal("show");
    
}



//This function deals with all button presses that happen on the scene.
function reply_click_modal(m_btn) {
    allKeys = [];
    
    if (m_btn == "selectFeatures") {
        var table = document.getElementById("editFeatures");
        deleteTableRows(table);
        $(document).ready(function() {
            $("#featureEdit").modal("show");
        });
        createFeatureList(true);
        return;
    }
    if (m_btn == "selectMeasurements") {
        var table = document.getElementById("editMeasurements");
        deleteTableRows(table);
        $(document).ready(function() {
            $("#measurementEdit").modal("show");
        });
        createMeasurementList(true);
        return;
    }
    if (m_btn == "load") {
        var table = document.getElementById("fileList");
        deleteTableRows(table);
        $(document).ready(function() {
            $("#fileSelect").modal("show");
        });
        if(!mostRecentFilesListed)
        {
            var fileLoadPromise = listAllKeys();
            fileLoadPromise.then(
                data => createFileList(data),
                error => alert(`Error: ${error.message}`)
            );
        }
        else
        {
            createFileList(listOfFiles);
        }
        //createMeasurementList(true);
        return;
    }
    /*
      if (m_btn == "load") {
      $(document).ready(function() {
      $("#loadModal").modal("show");
      });
      return;
      }*/
    if (m_btn == "upload") {
        $(document).ready(function() {
            $("#uploadModal").modal("show");
        });
	
	//update dropdown
	deleteTableRows(projectsList);
        projectsListUpdated = false;
        if(!mostRecentFilesListed)
        {
            var fileLoadPromise = listAllKeys();
            fileLoadPromise.then(
                data => popProjs(data,"projectsList"),
                error => alert(`Error: ${error.message}`)
            );
        }
	
        return;
    }
    if (m_btn == "downloadPDF") {
        $(document).ready(function() {
            $("#createPdfModal").modal("show");
        });
    }
    if (m_btn == "continue") {
        $(document).ready(function() {
            $("#importModal").modal("show");
        });
        return;
    }
    if (m_btn == "camera") //used to find the positions of the camera that should be set for the educator page.
    {
        /*
          console.log(camera.position);
          var tempCamX = camera.position.x;
          var tempCamY = camera.position.y;
          var tempCamZ = camera.position.z;
          var radios = document.getElementsByName('Point');
          var radiosM = document.getElementsByName('Measurement');
          var currentFeature = null;
          var currentMeasurement = null;
          var currentSurMeasurement = null;
          for (var i = 0; i < fixedFeaturePointLength; i++) {
    	  if (radios[i].checked) {
    	  currentFeature = findRowElementFP(i);
    	  break;
    	  }
          }
          if(currentFeature)
          {
    	  currentFeature.cameraX = tempCamX;
    	  currentFeature.cameraY = tempCamY;
    	  currentFeature.cameraZ = tempCamZ;
          }
          else
          {
    	  for(var i = 0; i < fixedMeasurementLength; i++)
    	  {
    	  if (radiosM[i].checked) {
    	  currentMeasurement = findRowElementMeasurement(i);
    	  if(currentMeasurement.surfaceDistId != "") //is there a surface measurement for the distance?
    	  {
    	  //find the surface distance measurement, set the lineTracingDivisor
    	  for(var i = 0; i < measurementData.length; i++)
    	  {
    	  if(mId.surfaceDistId ==  measurementData[i].id)
    	  {
    	  currentSurMeasurement = measurementData[i];
    	  }
    	  }
    	  }
    	  break;
    	  }
    	  }
    	  if(currentMeasurement)
    	  {
    	  currentMeasurement.cameraX = tempCamX;
    	  currentMeasurement.cameraY = tempCamY;
    	  currentMeasurement.cameraZ = tempCamZ;
    	  if(currentMeasurement)
    	  {
    	  currentSurMeasurement.cameraX = tempCamX;
    	  currentSurMeasurement.cameraY = tempCamY;
    	  currentSurMeasurement.cameraZ = tempCamZ;
    	  }
    	  }
          }*/

        return;
    }
    if (m_btn == "save") {
        if (dotCreated) {
            $(document).ready(function() {
                $("#exportModal").modal("show");		
            });
        } else {
            alert("No unique feature points yet recorded!");
        }
        return;
    }
    if (m_btn == "arrows") {
        if (canvasSceneLoaded) {
            if (toggleBtn) {
                document.getElementById("arrowButtons").style.visibility = "hidden";
                toggleBtn = false;
            } else {
                document.getElementById("arrowButtons").style.visibility = "visible";
                toggleBtn = true;
            }
        } else {
            alert("No scene yet loaded!");
        }
        return;
    }
    if (m_btn == "landmarks") {
        if (canvasSceneLoaded) {
            var buttonGroup = document.getElementById("visualTools");
            if (toggleLandmarks && lastVisualization == m_btn || labelsClean == true) {
                toggleVisualizationOff();
                removeHighlights();
                document.getElementById('toggleLabels').style.visibility = 'hidden';
                document.getElementById('toggleLabels').checked = true;
                document.getElementById('abbreviationsLabel').style.display = 'none';
                labelsClean = false;

            } else {
                toggleVisualizationOn(m_btn);
                document.getElementById('toggleLabels').style.visibility = 'visible';
                document.getElementById('abbreviationsLabel').style.display = 'inline';

            }
        } else {
            alert("No scene yet loaded!");
        }
        lastVisualization = m_btn;
    }
    if (m_btn == "lock") {
        //removeHighlights();
        /*	var image = document.getElementById("lockImg");
    	        if(!currentlyLocked)
    	        {
    		image.src = "./img/lock_closed.png";  //in the Digitized-Rhinoplasty.js file, this disables the logging of click events.
    		currentlyLocked = true;
    		$(document).ready(function(){
    		$('#lock[data-toggle="tooltip"]').tooltip().attr('data-original-title', "click to enable placing feature points (green dots)");
    		$('#lock[data-toggle="tooltip"]').tooltip('hide');
    		$('#lock[data-toggle="tooltip"]').tooltip('show');
    		});
    	        }
    	        else
    	        {
    		image.src = "./img/lock_open.png";
    		currentlyLocked = false;
    		$(document).ready(function(){ //used to change the content of the tooltip.
    		$('#lock[data-toggle="tooltip"]').tooltip().attr('data-original-title', "click to disable placing feature points (green dots)");
    		$('#lock[data-toggle="tooltip"]').tooltip('hide');
    		$('#lock[data-toggle="tooltip"]').tooltip('show');
    		});
    	        }
    	*/
        return;
    }
    if (m_btn == "restart") {
        $(document).ready(function() {
            $("#resetModal").modal("show");
        });
        return;
    }
    if (m_btn == "oneFifths" || m_btn == "oneFifths1") {
        if (canvasSceneLoaded) {
            var buttonGroup = document.getElementById("visualTools");
            if (toggleLandmarks && lastVisualization == m_btn) {
                toggleVisualizationOff();
                removeHighlights();
            } else {
                toggleVisualizationOn(m_btn);
            }
        } else {
            alert("You must load the scene before you are able to visualize one fifth's rule.");
        }
        lastVisualization = m_btn;
    }
    if (m_btn == "proportions") {
        if (canvasSceneLoaded) {
            if (toggleLandmarks && lastVisualization == m_btn) {
                toggleVisualizationOff();
                removeHighlights();
            } else {
                toggleVisualizationOn(m_btn);
            }
        } else {
            alert("You must load the scene before you are able to visualize proportions.");
        }
        lastVisualization = m_btn;
    }
}

function resetCamera() {
    dotsGroup.children[0].children[0].position.x = 0;
    dotsGroup.children[0].children[0].position.y = 0;
    dotsGroup.children[0].children[0].position.z = 0;
    camera.fov = originalFOV;
    camera.updateProjectionMatrix();
    camera.position.set(0, 0, cameraZ);
    controls.target.set(dotsGroup.children[0].children[0].position.x, dotsGroup.children[0].children[0].position.y, dotsGroup.children[0].children[0].position.z);
}

function toggleVisualizationOn(visualizationName) {
    //lock the placement of FPs until toggled off
    if (originalFOV != 1.0) {
        resetCamera();
    }
    removeHighlights();
    if (document.getElementById("highlightedFPs")) {
        document.getElementById("highlightedFPs").style["visibility"] = "hidden";
    }
    if (document.getElementById("highlightedMs")) {
        document.getElementById("highlightedMs").style["visibility"] = "hidden";
    }
    if (document.getElementById("itemIdentity")) {
        document.getElementById("itemIdentity").style["visibility"] = "hidden";
    }
    var buttonGroup = document.getElementById("visualTools");
    //buttonGroup.style["background-color"] = "red";
    toggleLandmarks = true;
    if (visualizationName == "proportions") {
        destroyInterval();
        displayProportions();
    }
    if (visualizationName == "oneFifths" || visualizationName == "oneFifths1") {
        destroyInterval();
        displayOneFifthsRule();
    }
    if (visualizationName == "landmarks") {
        if (toggleLandmarks) {
            labelScaleVariable = 1;
            zoomInterval = setInterval(labelSize, 1000); //execute 'labelSize' every second when a visualization is on.
        }
        showAllDots();
    }
    //if a visualization is toggled, create a function that calls itself based on an interval

    //lockToggle();
}

function destroyInterval() {
    if (zoomInterval) {
        labelScaleVariable = 1;
        clearInterval(zoomInterval);
        zoomInterval = null;
    }
}

function labelSize() {
    if (toggleLandmarks) {
        showAllDots();
        var cameraPos = new Vector((camera.position.x),
                                   (camera.position.y),
                                   (camera.position.z));
        var centerPos = new Vector(0, 0, 0);
        var toCamera = new THREE.Vector3().subVectors(centerPos, cameraPos);
        var cameraDistance = toCamera.length();
        labelScaleVariable = cameraDistance / 1000;
    }
}


function toggleVisualizationOff() {
    var buttonGroup = document.getElementById("visualTools");
    removeLines();
    buttonGroup.style["background-color"] = "initial";
    cleanUpLabels();
    toggleLandmarks = false;
    centerAllDots();
    //if a visualization is untoggled, remove the timer function.
    destroyInterval();
    //lockToggle();
}


/*
  function lockToggle()
  {
  if(document.getElementById("lockImg"))
  {
  var image = document.getElementById("lockImg");
  var lockButton = document.getElementById("lock");
  if(!currentlyLocked && toggleLandmarks)
  {
  image.src = "./img/lock_closed.png";
  currentlyLocked = true; //in the Digitized-Rhinoplasty.js file, this disables the logging of click events.
  $(document).ready(function(){
  $('#lock[data-toggle="tooltip"]').tooltip().attr('data-original-title', "Unlock to mark (green dots)");
  $('#lock[data-toggle="tooltip"]').tooltip('show');
  $('#lock[data-toggle="tooltip"]').tooltip().attr('data-original-title', "click to enable placing feature points (green dots)");
  });
  }
  if(currentlyLocked && !toggleLandmarks)
  {
  image.src = "./img/lock_open.png";
  currentlyLocked = false;
  $(document).ready(function(){ //used to change the content of the tooltip.
  $('#lock[data-toggle="tooltip"]').tooltip().attr('data-original-title', "click to disable placing feature points (green dots)");
  $('#lock[data-toggle="tooltip"]').tooltip('hide');
  });
  }
  }

  }
*/

//For radios
function toggleCleanup(type) {
    if (toggleLandmarks) {
        toggleVisualizationOff();
        removeHighlights();
    } else {
        centerAllDots();
        cleanUpLabels();
        if (type == "feature") {
            removeHighlightsM();
        }
        if (type == "measurement") {
            removeHighlights();
        } else {

        }
        removeLines();
    }
}

