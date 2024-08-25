//The min and max values are the values that are used to create a tight box around the loaded model. These coordinates, when entered, can be used for anything.
var minX = 0;
var minY = 0;
var minZ = 0;
var maxX = 0;
var maxY = 0;
var maxZ = 0;
var cameraZ = 450;

function loadModel() {
  //This if statement stops the loadModel() function from creating another scene if one is already created.
  //modelGender = document.getElementById("genderInput").value;
  //modelAge = document.getElementById("ageInput").value;




  if (canvasSceneLoaded) {
     if (fileToLoad != document.getElementById("OBJImport").value) //if the face is different, just upload the new face.
     {
       console.log(fileToLoad);
       fileToLoad = document.getElementById("OBJImport").value;
       window.fileNameNoExtention = fileToLoad.replace(/\.[^/.]+$/, "");
       loadFaceModel();
     } else {
       alert("this is already being used on the scene!");
     }
    //alert('Already loaded');
  } else {

    console.log("fileToLoad:" + fileToLoad.length + " - no extension: " + window.fileNameNoExtention);
    init(); //create the scene by initializing variables. Once they are created, you must animate the scene. You must only create a scene once! You can create multiple different scenes, but never duplicate a scene.
    animate(); //Allow for continuous updating of the camera.
    canvasSceneLoaded = true
  }

  function loadFileAsText() {
    // fileToLoad = document.getElementById("OBJImport").files[0].name; //files[] is actually an array created in the input of the load popup.
    console.log("loadFileAsText " + fileToLoad);
  }

  function init() {
    //Gets the element that you want the scene to be on.
    container = document.getElementById('canvas');

    //Set dimensions based on the element size
    var w = container.offsetWidth;
    var h = container.offsetHeight;

    //Create a perspective using element dimensions.
    //Camera
    var SCREEN_WIDTH = window.innerWidth,
      SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 20;
    var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
      NEAR = 0.1,
      FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, w / h, NEAR, FAR);
    camera.position.z = 400;
    var cameraZ;

    //Scene
    scene = new THREE.Scene();
    lighting = true;
    ambient = new THREE.AmbientLight(0xf9f9f9, 1.0);
    scene.add(ambient);
    var i = 0;

    var objFiles = [];
    var mtlFiles = [];
    for (i = 0; i < fpoints.length; i++) { //adding copies of all the ball objects necessary, to use the "display all features" button, to the objFiles and mtlFiles arrays.
      objFiles.push('ball.obj');
      mtlFiles.push('ball.mtl');
    }
    loadFaceModel(); //loads a model of a possible file extension, or format. Uses the URLs found in the s3Connection.js files that are sent back to the createLists.js file.
    i = 0;

    //MTL and OBJ portion
    var mtlLoader = new THREE.MTLLoader();
    var objLoader = new THREE.OBJLoader();
    mtlLoader.crossOrigin = "anonymous";
    document.getElementById("UploadProgress").innerHTML = '0% loaded';
    //This function recursively loads each 3-D model ball to the scene.
    function loadNextFile() {
      if (i > objFiles.length) return;
      var baseUrl = "https://digi-rhino.s3.amazonaws.com/" + AWS.config.credentials.identityId + "/";
      //Load the ball.mtl and ball.obj file from the uploads folder and get the jpg from the S3 bucket
      if(mtlFiles[i] === "ball.mtl" || objFiles[i] === "ball.obj")
        baseUrl = "https://public-rhino-testing.s3.amazonaws.com/loaders/";
      else{
        console.log("Getting jpg file from S3");
        baseUrl = "https://digi-rhino.s3.amazonaws.com/" + AWS.config.credentials.identityId + "/";
      }
      mtlLoader.setBaseUrl(baseUrl);
      mtlLoader.setPath(baseUrl);
      mtlLoader.load(mtlFiles[i], function(materials) {
        materials.preload();

        //Model OBJ Loader
        objLoader.setMaterials(materials);
        objLoader.setPath(baseUrl);
        objLoader.load(objFiles[i], function(object) {
            dotsGroup.add(object);
            i++; //increment index and load the next obj
            loadNextFile();
          },
          // called when loading is in progress
          function(xhr) {

            //console.log(Math.round(xhr.loaded / (xhr.total + 0.0000000001) * 100) + '% loaded'); // 0.0000000001 is added to avoid division by zero
            document.getElementById("UploadProgress").innerHTML = Math.round(xhr.loaded / (xhr.total + 0.0000000001) * 100) + '% loaded'; // 0.0000000001 is added to avoid division by zero

            if (xhr.loaded == xhr.total) {
              document.getElementById("UploadProgress").innerHTML = ''; //fileToLoad;
            }
          },
          // called when loading has errors
          function(error) {

            document.getElementById("UploadProgress").innerHTML = 'An error happened';

          }
        );
      });
    }

    //Load the next 3D Model onto the screen
    loadNextFile();

    //Renderer
    renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true
    }); //for exporting images in the PDF.
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(new THREE.Color("hsl(10, 0%, 90%)"));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    scene.add(faceGroup);
    scene.add(dotsGroup);
    //Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;
    camera.lookAt(scene.position);


    //RayCaster
    raycaster = new THREE.Raycaster();

    //Events
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('dblclick', logClickLocation, false);
  }


  /*

  Known faults fixed:
  10/28/20: Don't apply console.log() statements near the dispose functions, it prevents them from properly recylcing the data.
  10/29/20: Don't use MeshBasicMaterial when applying lights in three.js. They don't actually affect the material.
  When loading the .ply files, make sure to compute its normals before applying lighting. Lighting is not able if normals don't exist.
  */
  function loadFaceModel() {
    //preventing memory leaks: data that becomes unused but isn't de-allocated.
    if (faceGroup.children[0]) {
      if (faceGroup.children[0].children[0]) //OBJ models have the 'mesh' within a child of a child of the faceGroup group.
      {
        if(faceGroup.children[0].children[0].geometry) //Sometimes a model doesn't have a geometry... somehow...
        {
            faceGroup.children[0].children[0].geometry.dispose();
        }
        if(faceGroup.children[0].children[0].material)
        {
          faceGroup.children[0].children[0].material.dispose();
        }
        scene.remove(faceGroup.children[0].children[0]);
        faceGroup.children[0].children = [];
      } else //Other models have the 'mesh' within just a child of the faceGroup group.
      {
        faceGroup.children[0].geometry.dispose();
        faceGroup.children[0].material.dispose();
      }
      scene.remove(faceGroup.children[0]);
      faceGroup.children = [];
    }
    if (faceGroup.materialLibraries) {
      faceGroup.materialLibraries.dispose();
    }
    //Before editing the section above, review documentation for this module.

    var validUploadTypes = []; //used to check which type to try and upload.

    for (var i = 0; i < currentUploadTypes.length; i++) {
      var currentExtension = '.' + selectedFiles[0].slice((selectedFiles[0].lastIndexOf(".") - 1 >>> 0) + 2);
      if (currentUploadTypes[i] == currentExtension) {
        validUploadTypes.push(currentExtension);
      }
    }

    loadFileExists = true;
    //introduce lighting if the current type is .fbx, .stl, or .ply
    var lightingNeeded = false;
    var manager = new THREE.LoadingManager();
    //Define manager functions
    manager.onLoad = function() {
      $(document).ready(function() {
        $("#fileSelect").modal("hide");
      });
    };

    //modelFileUrl is the 3D model, imageUrl is the image file, mtlUrl is the MTL file.

    //if the first valid upload type (has all required files) is obj...
    if (itemExistsInArray(".obj", validUploadTypes)) {
      var mtlLoaderModel = new THREE.MTLLoader();
      var objLoaderModel = new THREE.OBJLoader(manager);
      console.log("OBJ file used");

      var currentBaseUrl = "https://digi-rhino.s3.amazonaws.com/" + AWS.config.credentials.identityId + "/";
      mtlLoaderModel.setCrossOrigin("anonymous");
        mtlLoaderModel.setBaseUrl(currentBaseUrl);
      mtlLoaderModel.load((mtlUrl), function(materials) {
        materials.preload();
        objLoaderModel.setMaterials(materials);
        objLoaderModel.load((modelFileUrl), function(object) {
          object.traverse(function (child) { //aka setTextures
            if(child instanceof THREE.Mesh)
            {
              var textureLoader = new THREE.TextureLoader().load(imageUrl, texture => {
                child.material.map = texture; //Set the image/map we download to the current object's material variable.
                child.material.map.image.crossOrigin = ''; //Used to stop the operation from being unsecure: cross origin file.
                child.material.needsUpdate = true;
              });

            }
            scaleUpload(object);
          });
        }, );
      });
    } else if (itemExistsInArray(".dae", validUploadTypes)) {
      console.log("Collada file used");

      var loader = new THREE.ColladaLoader(manager);
      loader.options.convertUpAxis = true;
      loader.load(modelFileUrl, loadDae);

      function loadDae(collada) {
        var dae;
        dae = collada.scene;
        console.log(dae);

        //somehow, get the image in here...
        dae.traverse(function (child) { //aka setTextures
          if(child instanceof THREE.Mesh)
          {
            if(imageUrl != "")
            {
              var textureLoader = new THREE.TextureLoader().load(imageUrl, texture => {
                child.material.map = texture; //Set the image/map we download to the current object's material variable.
                child.material.map.image.crossOrigin = ''; //Used to stop the operation from being unsecure: cross origin file.
                child.material.needsUpdate = true;
              });
            }
          }
          scaleUpload(dae);
        });
        $(document).ready(function() { //We add this statement to the 'dae' uploader because it doesn't have an onload property.
          $("#fileSelect").modal("hide");
        });
      }
    } else if (itemExistsInArray(".stl", validUploadTypes)) {
      console.log("STL file used");
      lightingNeeded = true;

      var stlLoader = new THREE.STLLoader(manager);
      stlLoader.load(modelFileUrl , function(geometry) {
        //var material = new THREE.MeshNormalMaterial();
        var material = new THREE.MeshLambertMaterial({
          color: 0xc2c2d6
        });
        //MeshLambertMaterial when lighting for non mtl/.jpg file extensions are included
        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.set(-Math.PI / 2, 0, 0); // rotate it so that it is upright.
        scaleUpload(mesh);
      });
    } else if (itemExistsInArray(".ply", validUploadTypes)) {
      console.log("PLY file used");
      lightingNeeded = true;
      // prepare PLY loader and load the model
      var plyLoader = new THREE.PLYLoader(manager);
      plyLoader.load( modelFileUrl , function(geometry) {

        geometry.computeVertexNormals();
        //var material = new THREE.MeshStandardMaterial( { color: 0xc2c2d6, flatShading: true } );
        var material = new THREE.MeshLambertMaterial({
          color: 0xc2c2d6
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.set(-Math.PI / 2, 0, 0);
        scaleUpload(mesh);
      });
    } else if (itemExistsInArray(".fbx", validUploadTypes)) {
      console.log("FBX file used");
      lightingNeeded = true;
      var material = new THREE.MeshLambertMaterial({
        color: 0xc2c2d6
      });

      var fbxLoader = new THREE.FBXLoader(manager);
      fbxLoader.load(modelFileUrl , (object) => {
        if (object instanceof THREE.Mesh) {

          // apply texture
          child.material.map = texture
          child.material.needsUpdate = true;
        }
        //object.scale.set(.01, .01, .01)
        scaleUpload(object);
      });
    } else {
      alert("an error happened when picking what sort of extension to load");
    }
    if (lightingNeeded) {
      useLights();
    } else {
      removeLighting();
    }
  }
  
  

  
  //Call get jason
	getJSON();
	
    
	// stop load in and reset loading bar
	
}

//Finds max and min values and sets the z-value of the camera.
function findMaxAndMin(object) {
  var modelBox;
  modelBox = new THREE.Box3().setFromObject(object);
  minX = modelBox.min.x;
  minY = modelBox.min.y;
  minZ = modelBox.min.z;
  maxX = modelBox.max.x;
  maxY = modelBox.max.y;
  maxZ = modelBox.max.z;
  yDist = modelBox.size().y;
  zDist = modelBox.size().z;
  xDist = modelBox.size().x;
  //Set z position of camera to 4.5 * depth of model to be zoomed in enough
  cameraZ = (modelBox.size().z * 4.5);
  camera.position.set(0, 0, cameraZ);
  bottomLeftVector = new THREE.Vector3(minX, minY, maxZ);
  bottomRightVector = new THREE.Vector3(maxX, minY, maxZ);
  var browserZoomLevel = (window.devicePixelRatio);
  //console.log(browserZoomLevel);
}

function useLights() {
  if (directionalLight == null) {
    directionalLight = new THREE.DirectionalLight(0xFFFFFF, .25) //color, intensity.
    directionalLight.position.set(camera.position.x + 50, camera.position.y + 100, camera.position.z);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);
  }
}

function removeLighting() {
  if (directionalLight != null) {
    scene.remove(directionalLight.target);
    scene.remove(directionalLight);
    directionalLight = null;
  }
}

function scaleUpload(object) //EDIT THIS FUNCTION: FIND MAX AND FIND RELATIVE RATIOS OF OTHERS. multiply (100% + ratio) -> more even.
{
  if (loadFileExists) {
    findMaxAndMin(object);


    var xScale = 1;
    var yScale = 1;
    var zScale = 1;
    var isScaled = false;
    /*
    if (xDist < 170) {
      xScale = 200 / xDist;
      isScaled = true;
    }
    if (yDist < 230) {
      yScale = 250 / yDist;
      isScaled = true;
    }
    if (zDist < 150) {
      zScale = 170 / zDist;
      isScaled = true;
    }
    if (isScaled) {
      console.log("xScale: " + xScale);
      console.log("yScale: " + yScale);
      console.log("zScale: " + zScale);
      object.scale.set(xScale, yScale, zScale);
      findMaxAndMin(object);
      alert("The face uploaded was considered to be too small, and has been resized. If this is the case, try resizing it manually in a 3-D modeling program.");
    }
    */
    faceGroup.add(object);
  }
}

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  var w = container.offsetWidth;
  var h = container.offsetHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  render();
}

//This is where the rubber meets the road.
function logClickLocation(event) {
  
  
  var table = document.getElementsByTagName("tbody").item(0);
  var ID;
  var radios = document.getElementsByName('Point');
  var currentFeature = null;
  for (var i = 0; i < radios.length; i++) { //goes through each radio and finds the one selected
    if (radios[i].checked) {
      currentFeature = findRowElementFP(i);
      dotSelected = true;
      break;
    }
  }

  var w = container.offsetWidth;
  var h = container.offsetHeight;

  //Gets the dimensions of the actual HTML body element
  var bodyRect = document.body.getBoundingClientRect();
  //Gets the dimensions of the container of the scene
  var elemRect = container.getBoundingClientRect();

  //Find the difference between distances. Apply the offset to mouse position. Try commenting these lines out and try placing a feature point without them!
  //find the distance of the pixels hidden.
  var offsetL = elemRect.left - bodyRect.left;
  var offsetH = elemRect.top - bodyRect.top;
  var xPos = event.clientX - offsetL;
  var yPos = event.clientY - offsetH + window.pageYOffset;
  //Variables included in xPos and yPos so that the offset created by screen size or the zoom percentage of a page is taken into account in the mouse offset.
  mouse.x = (xPos / w) * 2 - 1;
  mouse.y = -(yPos / h) * 2 + 1;
  //console.log("mouse.x " + xPos + " mouse.y " + mouse.y + " - w: " + w + " h: " + h + " X: " + yPos);

  //raycaster = new THREE.Raycaster();//ADDED by OGUZHAN on 08 APR 22
  //Set the ray from camera position and mouse coordinates
  raycaster.setFromCamera(mouse, camera);
  // calculate objects intersecting the ray
  var group = scene.children;
  var intersect = raycaster.intersectObjects(group, true);

  intersection = (intersect.length) > 0 ? intersect[0] : null; //were there any intersections? If there were, only get the first one (the most front and first one will be the one to intersect with the face model).

  //document.getElementById("x_value").innerHTML = mouse.x.toFixed(3);
  //document.getElementById("y_value").innerHTML = mouse.y.toFixed(3);
  
  
  if (intersection != null) {
    toggleVisualizationOff();
    if (ifMeasurementRadioSelected) {
      if (toggleLandmarks) {
        toggleLandmarks = false;
      }
    }
    var radios = document.getElementsByName('Point');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        dotCreated = true; //only apply this truth if a radio is actually selected! If a radio isn't selected, don't apply this truth because a dot has been created but not recorded.
        break;
      }
    }
     
     
     
    //Simply check if there is an intersection. If there is, only use the values of the first one!
    if (intersect.length > 0) {
      if (currentFeature != null) //only apply coordinates to a FP if an FP is selected
      {
        document.getElementById("fp-" + currentFeature.id).style["font-weight"] = "bold";
        currentFeature.xVal = Number(intersect[0].point.x.toFixed(2));
        currentFeature.yVal = Number(intersect[0].point.y.toFixed(2));
        currentFeature.zVal = Number(intersect[0].point.z.toFixed(2));

        //document.getElementById("x_value").innerHTML = mouse.x.toFixed(3);
        //document.getElementById("y_value").innerHTML = mouse.y.toFixed(3);
      }
      dotsGroup.children[0].children[0].position.x = intersect[0].point.x.toFixed(2);
      dotsGroup.children[0].children[0].position.y = intersect[0].point.y.toFixed(2);
      dotsGroup.children[0].children[0].position.z = intersect[0].point.z.toFixed(2);
      var radios = document.getElementsByName('Point');
      for (var i = 0; i < radios.length; i++) { //update ONLY the measurements that include the point that data is being created for.
        if (radios[i].checked) {
          currentFeature = findRowElementFP(i);
          updateMeasurements(currentFeature.id);
          break;
        }
      }
    }
  }
  
  
  createAndDownloadJSON();	
}


function movePointUp() {
  var inputY = parseFloat(document.getElementById("y_value").innerHTML);
  document.getElementById("y_value").innerHTML = (inputY + moveAmount).toFixed(2);
  movePoint();
}

function movePointDown() {
  var inputY = parseFloat(document.getElementById("y_value").innerHTML);
  document.getElementById("y_value").innerHTML = (inputY - moveAmount).toFixed(2);
  movePoint();
}

function movePointLeft() {
  var inputX = parseFloat(document.getElementById("x_value").innerHTML);
  document.getElementById("x_value").innerHTML = (inputX - moveAmount).toFixed(2);
  movePoint();
}

function movePointRight() {
  var inputX = parseFloat(document.getElementById("x_value").innerHTML);
  document.getElementById("x_value").innerHTML = (inputX + moveAmount).toFixed(2);
  movePoint();
}

//Move the dot on the model. Assumes that the camera has not been moved.
function movePoint() {
  if (dotSelected && dotCreated) {
    var ID;
    var radios = document.getElementsByName('Point');
    var currentFeature = null;
    var raycaster2 = new THREE.Raycaster();
    var intersection2 = null;

    mouse.x = parseFloat(document.getElementById("x_value").innerHTML);
    mouse.y = parseFloat(document.getElementById("y_value").innerHTML);
    //var inputZ = document.getElementById("z_value");

    //Set mouse coordinates to given values in text box
    //console.log("mouse.x: " + mouse.x + " - mouse.y: " + mouse.y);

    //Set the ray from camera position and mouse coordinates
    raycaster2.setFromCamera(mouse, camera);

    //Compute intersections
    var group = scene.children;

    // calculate objects intersecting the ray
    var intersect2 = raycaster2.intersectObjects(group, true);
    var desiredObject;
    intersection2 = (intersect2.length) > 0 ? intersect2[0] : null;
    if (intersection2 != null) {
      if (intersect2.length > 0) {
        desiredObject = intersect2[0];
        if (desiredObject.object.name == "Sphere") {
          //We don't want the coordinates of the sphere: the first object to be intersected with is, at times, the sphere.
          desiredObject = intersect2[1];
        }
        //replaces coordinates of old dot
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked) {
            currentFeature = findRowElementFP(i);
            //update ONLY the measurements that include the point that data is being created for.
            updateMeasurements(currentFeature.id);
            break;
          }
        }
        dotsGroup.children[0].children[0].position.x = desiredObject.point.x.toFixed(2);
        dotsGroup.children[0].children[0].position.y = desiredObject.point.y.toFixed(2);
        dotsGroup.children[0].children[0].position.z = desiredObject.point.z.toFixed(2);
        currentFeature.xVal = desiredObject.point.x.toFixed(2);
        currentFeature.yVal = desiredObject.point.y.toFixed(2);
        currentFeature.zVal = desiredObject.point.z.toFixed(2);
      }
    }
  } else {
    alert("You must first select a feature point from the list and also place one somewhere in the scene.");
  }
}


//A function used to remove background colors from the list of features.
var toggleTracker = false//has this run before
function resetData() {
  //Go through all measurements and all feature points, remove all values.
  //Go through all feature points "fp-" divs and remove all bold indicators
  //Go through all measurements "measurement-" divs and remove all values
  removeHighlights();
  removeHighlightsM();
  centerAllDots();
  cleanUpLabels();
  removeLines();
  toggleVisualizationOff();
  measurementCreated = null;
  dotCreated = null;
  var currentFeature;
  var currentMeasurement;
  for (var i = 0; i < fpoints.length; i++) {
    currentFeature = fpoints[i];
    fpoints[i].xVal = "";
    fpoints[i].yVal = "";
    fpoints[i].zVal = "";
    if (fpoints[i].cameraX) {
      fpoints[i].cameraX = "";
      fpoints[i].cameraY = "";
      fpoints[i].cameraZ = "";
    }
    if (document.getElementById("fp-" + currentFeature.id)) {
      document.getElementById("fp-" + fpoints[i].id).style["font-weight"] = "normal";
    }

  }
  for (var i = 0; i < measurementData.length; i++) {
    measurementData[i].value = "";
    if (measurementData[i].storedPoints) {
      measurementData[i].storedPoints = [];
      measurementData[i].numberOfSegments = "";
    }
    if (measurementData[i].beginningPoint) {
      measurementData[i].beginningPoint = "";
    }
    if (measurementData[i].endPoint) {
      measurementData[i].endPoint = "";
    }
    if (measurementData[i].cameraX) {
      measurementData[i].cameraX = "";
      measurementData[i].cameraY = "";
      measurementData[i].cameraZ = "";
    }

    if (document.getElementById("val-" + measurementData[i].id)) {
      document.getElementById("val-" + measurementData[i].id).innerHTML = "";
    }
  }

  $(document).ready(function() {
    $("#resetModal").modal("hide");
  });
  
  
  if(toggleTracker){
  createAndDownloadJSON();
  }
  toggleTracker = true;
}

function itemExistsInArray(item, array) {
  for (var i = 0; i < array.length; i++) {
    if (item == array[i]) {
      return true;
    }
  }
  return false;
}

function fileExists(url) {
    if (url) {
        var req = new XMLHttpRequest();
        req.open('HEAD', url, false);
        try {
            req.send();
            return (req.status == 200);
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
}

function reset3dModelLocation(obj) {
    obj.position.x = 0;
    obj.position.y = 0;
    obj.position.z = 0;
    xPosition = 0;
    yPosition = 0;
    zPosition = 0;
}

function moveZneg(obj) {
    obj.position.z -= 20;
    zPosition -= 20;
}
function moveZpos(obj) {
    obj.position.z += 20;
    zPosition += 20;
}

function moveYpos(obj) {
    obj.position.y += 10;
    yPosition += 10;
}
function moveYneg(obj) {
    obj.position.y -= 10;
    yPosition -= 10;
}

function moveXpos(obj) {
    obj.position.x += 10;
    xPosition += 10;
}

function moveXneg(obj) {
    obj.position.x -= 10;
    xPosition -= 10;
}

