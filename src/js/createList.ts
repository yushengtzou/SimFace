
/*
This code first identifies the Features list on the website by finding the first instance of a <tbody> </tbody> element.
The code will then loop through all feature points in the json file known.
For each index, it will create a row according to a feature point.

Each row has a unique id for its buttons so that they can be referenced later.
*/
function createFeatureList(editTable) {
	removeHighlightsM();
	if (!editTable) {
	  fixedFeaturePointLength = 0;
	}
	var i = 0;
	var tabBody;
	tabBody = document.getElementById("features");
	if (editTable) {
	  toggleVisualizationOff();
	  tabBody = document.getElementById("editFeatures");
	}
	var title = "";
	for (i = 0; i < fpoints.length; i++) {
	  if (((fpoints[i].list == "Y") || editTable)) {
		if (fpoints[i].type != title) //create section "Generic Points"
		{
		  title = fpoints[i].type;
		  var rowSec = document.createElement("tr");
		  var rowHeadSec = document.createElement("th");
		  rowHeadSec.scope = "row";
		  var rowCellOneSec = document.createElement("td");
		  var titleSec = document.createElement("span");
		  titleSec.innerHTML = '<h4><u>' + title + '</u></h4>';
		  rowCellOneSec.appendChild(titleSec);
		  var rowCellTwoSec = document.createElement("td");
  
		  rowSec.appendChild(rowHeadSec);
		  rowSec.appendChild(rowCellOneSec);
		  rowSec.appendChild(rowCellTwoSec);
		  tabBody.appendChild(rowSec);
		}
		var row = document.createElement("tr");
		var rowHead = document.createElement("th");
		rowHead.scope = "row";
		var rowInput = document.createElement("span"); //radio
		if (!editTable) {
		  rowInput.innerHTML = '<input id="' + fpoints[i].id + '" type="radio" name="Point" onclick="placeDotForSelectedFeature()"/>';
		} else {
		  if (fpoints[i].list == "Y") {
			rowInput.innerHTML = '<input id="' + fpoints[i].id + 'EDIT" type="checkbox" checked/>';
		  } else {
			rowInput.innerHTML = '<input id="' + fpoints[i].id + 'EDIT" type="checkbox"/>';
		  }
		}
		rowHead.appendChild(rowInput);
  
		var rowCellOne = document.createElement("td");
		var textNode1;
		if (!editTable) {
		  rowCellOne.id = "fp-" + fpoints[i].id;
		  //textNode1 = document.createTextNode((i+1) + ") " + fpoints[i].name);
		  textNode1 = document.createTextNode(fpoints[i].name + " (" + fpoints[i].abbrv + ")");
		} else {
		  rowCellOne.id = "fp-" + fpoints[i].id + "EDIT";
		  //textNode1 = document.createTextNode((i+1) + ") " + fpoints[i].name)
		  textNode1 = document.createTextNode(fpoints[i].name + " (" + fpoints[i].abbrv + ")");
		}
		rowCellOne.appendChild(textNode1);
  
		var rowCellTwo = document.createElement("td");
		var rowInformation = document.createElement("span");
		rowInformation.innerHTML = ' ';
		if (!editTable) {
		  rowInformation.id = "fp-btn" + fpoints[i].id;
		  rowInformation.onclick = function() {
			reply_click_fp(this.id);
		  };
		  //"reply_click_fp(this.id)";
		  rowInformation.innerHTML = '<button type="button" class="btn-sm btn-outline-dark" style="transition: all 0.2s ease;"><b>?</b></button>';
		  rowCellTwo.classList.add("center-block");
		  rowCellTwo.classList.add("text-center");
		}
		rowCellTwo.appendChild(rowInformation);
  
		row.appendChild(rowHead);
		row.appendChild(rowCellOne);
		row.appendChild(rowCellTwo);
		tabBody.appendChild(row);
		if (!editTable) {
		  fixedFeaturePointLength++;
		}
		if (!featureTableCreated) //first table created
		{
		  defaultFeatures.push(fpoints[i].id);
		}
	  }
	}
	featureTableCreated = true;
	highlightRowsFP(editTable);
  }
  
  function createMeasurementList(editTable) {
	removeHighlights();
	if (!editTable) {
	  fixedMeasurementLength = 0;
	}
	var i = 0;
	var tabBody;
	tabBody = document.getElementById("measurements");
	if (editTable) {
	  toggleVisualizationOff();
	  tabBody = document.getElementById("editMeasurements");
	}
	var title = "";
	var group = "";
	for (i = 0; i < measurementData.length; i++) {
	  if ((measurementData[i].list == "Y" || editTable)) {
		if (measurementData[i].type != title && measurementData[i].group != group) //Does the current item represent the column before?
		{
		  title = measurementData[i].type;
		  group = measurementData[i].group;
		  var rowSec = document.createElement("tr");
		  var rowHeadSec = document.createElement("th");
		  rowHeadSec.scope = "row";
		  var rowCellOneSec = document.createElement("td");
		  var titleSec = document.createElement("span");
		  titleSec.innerHTML = '<h4><u>' + title + '</u></h4>';
		  rowCellOneSec.appendChild(titleSec);
		  var rowCellTwoSec = document.createElement("td");
  
		  rowSec.appendChild(rowHeadSec);
		  rowSec.appendChild(rowCellOneSec);
		  rowSec.appendChild(rowCellTwoSec);
		  tabBody.appendChild(rowSec);
		}
		var row = document.createElement("tr");
		var rowHead = document.createElement("th");
		rowHead.scope = "row";
		var rowInput = document.createElement("span"); //radio
		if (!editTable) {
		  rowInput.innerHTML = '<input id="' + measurementData[i].id + '" type="radio" name="Measurement" onclick="updatePointsForSelectedMeasurement()"/>';
		} else {
		  if (measurementData[i].list == "Y") {
			rowInput.innerHTML = '<input id="' + measurementData[i].id + 'EDIT" type="checkbox" checked/>';
		  } else {
			rowInput.innerHTML = '<input id="' + measurementData[i].id + 'EDIT" type="checkbox"/>';
		  }
		}
		rowHead.appendChild(rowInput);
  
		var rowCellOne = document.createElement("td");
		if (!editTable) {
		  rowCellOne.id = "measurement-" + measurementData[i].id;
		  rowCellOne.style = "background-color:initial;";
		  var textNode1 = document.createTextNode(measurementData[i].name + " ");
		} else {
		  rowCellOne.id = "measurement-" + measurementData[i].id + "EDIT";
		  rowCellOne.style = "background-color:initial;";
		  var textNode1 = document.createTextNode(measurementData[i].name + " ");
		}
		rowCellOne.appendChild(textNode1);
		if (!editTable) {
		  var valueSpan = document.createElement("span");
		  valueSpan.innerHTML = '<br><b><span id="val-' + measurementData[i].id + '" class="text-danger" /></b>'
		  rowCellOne.appendChild(valueSpan);
		}
  
		var rowCellTwo = document.createElement("td");
		var rowInformation = document.createElement("span");
		rowInformation.innerHTML = ' ';
		if (!editTable) {
		  rowInformation.id = "measurement-btn" + measurementData[i].id;
		  rowInformation.onclick = function() {
			reply_click_measurement(this.id);
		  };
		  rowInformation.innerHTML = '<button type="button" class="btn-sm btn-outline-dark" style="transition: all 0.2s ease;"><b>?</b></button>';
		  rowCellTwo.classList.add("center-block");
		  rowCellTwo.classList.add("text-center");
		}
		rowCellTwo.appendChild(rowInformation);
  
          
          //Add 'C' Calculate button if it is an area/volume measurement
          //'C' button is added because it might take a while to calculate area and volume and we do not want to block the webpage for this calculation by making it automatic
          var rowCalculate = document.createElement("span");
          rowCalculate.innerHTML = ' ';
          if(!editTable && (measurementData[i].group == "Areas" || measurementData[i].group == "Volumes"))
          {
              rowCalculate.id = "calculate-btn" + measurementData[i].id;
              rowCalculate.onclick = function() { reply_click_calculate(this.id); };
              rowCalculate.innerHTML = '<button type="button" class="btn-sm btn-outline-dark" style="transition: all 0.2s ease;"><b>C</b></button>';
              rowCellTwo.classList.add("center-block");
              rowCellTwo.classList.add("text-center");
          }
          rowCellTwo.appendChild(rowCalculate);
          
		row.appendChild(rowHead);
		row.appendChild(rowCellOne);
		row.appendChild(rowCellTwo);
		tabBody.appendChild(row);
		if (!editTable) {
		  fixedMeasurementLength++;
		}
		if (!measurementTableCreated) {
		  defaultMeasurements.push(measurementData[i].id);
		}
	  }
	}
	highlightRowsMeasurement(editTable);
	measurementTableCreated = true;
      
      $('#measurements tr').click(function(){
          $(this).find('input[type=radio]').prop('checked', true);
          updatePointsForSelectedMeasurement();
      });
      
  }
  
  function createFileList(data)
  {
	if(!mostRecentFilesListed)
	{
	  listOfFiles = data;
	}
  
	var tabBody = document.getElementById("fileList");
	var formattedList = [];
	var formattedAuxiliaryList = [];
  
	for(var i = 0; i < listOfFiles.length; i++)
	{
	  if(i == 0) //create a title row, because the table header doesn't work properly...
	  {
		title = fpoints[i].type;
		var rowSec = document.createElement("tr");
		var rowHeadSec = document.createElement("th");
		rowHeadSec.scope = "row";
  
		var rowCellOneSec = document.createElement("td");
		var titleSec1 = document.createElement("span");
		titleSec1.innerHTML = '<h4><u>' + 'File' + '</u></h4>';
		rowCellOneSec.appendChild(titleSec1);
  
		var rowCellTwoSec = document.createElement("td");
		var titleSec2 = document.createElement("span");
		titleSec2.innerHTML = '<h4><u>' + 'Size' + '</u></h4>';
		rowCellTwoSec.appendChild(titleSec2);
  
		rowSec.appendChild(rowHeadSec);
		rowSec.appendChild(rowCellOneSec);
		rowSec.appendChild(rowCellTwoSec);
		tabBody.appendChild(rowSec);
	  }
  
	  //get all variables we're going to list
	  var fileName = listOfFiles[i].Key.slice((listOfFiles[i].Key.lastIndexOf("/") - 1 >>> 0) + 2); //Get the file name from the prefix name.
	  var fileSize = (listOfFiles[i].Size / (1024)).toFixed(2);
	  var extension = '.' + fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
	  var params = {
		name: fileName,
		size: fileSize
	  };
  
	  //var lastUsed = listOfFiles.Contents[i].LastModified.toTimeString();
  
	  var includeInList = false; //Don't include files in the loading list that aren't needed: only include the 3D Model files like .obj and .ply and not .mtl or .png/.jpg.
	  if(extension != '.mtl' && extension != '.jpg' && extension != '.png') //common auxiliary file types.
	  {
		  for(var j = 0; j < currentUploadTypes.length; j++)
		  {
			if(extension == currentUploadTypes[j]) //also, check if the underlying files needed exist as well: .obj needs an .mtl at least and normally an image file type.
			{
			  includeInList = true;
			  formattedList.push(params); //added because we're including them.
			}
		  }
	  }
	  if(!includeInList) //if the file isn't a 3D model file, include it in a secondary list.
	  {
		formattedAuxiliaryList.push(params);
	  }
  
	//   if(includeInList) //If it's a 3D model file like .obj or .ply, include it.
	//   {
		//create row element and the respective header, th, span, and td elements and append them to the row and then the row to the table.
		var row = document.createElement("tr");
		var rowHead = document.createElement("th");
		rowHead.scope = "row";
  
		var rowInput = document.createElement("span"); //create the checkbox for the file, store it in the rowhead Later
		rowInput.innerHTML = '<input id="' + fileName + '.checkbox' +'EDIT" type="checkbox"/>'; //items have the ID 'filename.checkbox'
  
		rowHead.appendChild(rowInput);
  
		var rowCellOne = document.createElement("td"); //the second column
		var textNode1 = document.createTextNode(fileName);
		rowCellOne.id = 'file-' + fileName;  //the middle column has ID 'file-filename'
		rowCellOne.appendChild(textNode1);
  
		var rowCellTwo = document.createElement("td"); //the third column
		var textNode2 = document.createTextNode(fileSize + " KB");
		rowCellTwo.id = 'fileSize-' + fileName;
		rowCellTwo.appendChild(textNode2);
  
		row.appendChild(rowHead);
		row.appendChild(rowCellOne);
		row.appendChild(rowCellTwo);
		tabBody.appendChild(row);
		mostRecentFilesListed = true;
	  }
	// }
	listOfFileData = formattedList;
	listOfAuxiliaryFiles = formattedAuxiliaryList;
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
  
  //Despite its name, used to fill out the table with the selected values with the respected data for the rows in the measurements table. Done after the table is created in the table creation function.
  function highlightRowsMeasurement(editTable) {
	if (!editTable) {
	  var currentMeasurement;
	  var ID;
	  for (var i = 0; i < fixedMeasurementLength; i++) {
		currentMeasurement = findRowElementMeasurement(i);
		updateMeasurements(currentMeasurement.id);
		if (currentMeasurement.value != "") {
		  ID = currentMeasurement.id;
		  if (currentMeasurement.type == "Distances") {
			document.getElementById("val-" + ID).innerHTML = currentMeasurement.value + " mm";
		  }
		  if (currentMeasurement.type == "Angles") {
			document.getElementById("val-" + ID).innerHTML = currentMeasurement.value + " degrees";
		  }
		  if (currentMeasurement.type == "Ratios") {
			document.getElementById("val-" + ID).innerHTML = currentMeasurement.value + "";
		  }
		  if (currentMeasurement.type == "Distances - Surface") {
			document.getElementById("val-" + ID).innerHTML = currentMeasurement.value + " mm";
		  }
		}
	  }
	}
  }
  
  //Despite its name, used to show whether a row has data within the respective JSON object for the rows in the features table.  Done after the table is created in the table creation function.
  function highlightRowsFP(editTable) {
	if (!editTable) {
	  var currentFeaturePoint
	  var ID;
	  for (var i = 0; i < fixedFeaturePointLength; i++) {
		currentFeaturePoint = findRowElementFP(i);
		if (currentFeaturePoint.xVal != "") {
		  ID = currentFeaturePoint.id;
		  document.getElementById("fp-" + ID).style["font-weight"] = "bold";
		}
	  }
	}
  }
  
  //In the features -> select menu, used when the 'Submit' button is clicked to confirm and submit changes.
  function submitEditChangesFP() {
	for (var i = 0; i < fpoints.length; i++) {
	  var checkbox = document.getElementById(fpoints[i].id + "EDIT");
	  if (checkbox.checked) {
		fpoints[i].list = "Y";
	  } else {
		fpoints[i].list = "F";
	  }
	}
	deleteTableRows(document.getElementById("features"));
	createFeatureList(false);
	deleteTableRows(document.getElementById("editFeatures"));
	$(document).ready(function() {
	  $("#featureEdit").modal('toggle');
	});
  }
  
  //In the measurements -> select menu, used when the 'Submit' button is clicked to confirm and submit changes.
  function submitEditChangesMeasurements() {
	for (var i = 0; i < measurementData.length; i++) {
	  var checkbox = document.getElementById(measurementData[i].id + "EDIT");
	  if (checkbox.checked) {
		measurementData[i].list = "Y";
	  } else {
		measurementData[i].list = "F";
	  }
	}
	deleteTableRows(document.getElementById("measurements"));
	createMeasurementList(false);
	deleteTableRows(document.getElementById("editMeasurements"));
	$(document).ready(function() {
	  $("#measurementEdit").modal('toggle');
	});
  }
  
  //Finds the row for a respective JSON object based on row ID: ease table manipulation.
  function findRowElementFP(i)
  {
	var rowIndex = i;
	var numTitlesPassed = 0;
	var table = document.getElementById("features");
	var fpointRowId;
	var fpointRowIdTitle;
	//used to consider indexes that are titles.
	for (var a = 2; a < table.rows.length; a++) {
	  fpointRowIdTitle = table.rows[a].cells[1].id
	  if (fpointRowIdTitle == "") //title
	  {
		if ((i + 2 + numTitlesPassed) >= (a)) // how many titles have passed?
		{
		  numTitlesPassed += 1;
		}
	  }
	}
	//used to find the row, and the FP.
	if (table.rows.length >= 4) {
	  fpointRowId = table.rows[rowIndex + 2 + numTitlesPassed].cells[1].id; //start after theader, search bar. Get the middle cell.
	  var fpointIdArray = fpointRowId.split("fp-"); //should never = [""]
	  var obj = $.grep(fpoints, function(obj) {
		return obj.id == fpointIdArray[1];
	  })[0];
	  return obj;
	}
  }
  
  //Finds the row for a respective JSON object based on row ID: ease table manipulation.
  function findRowElementMeasurement(i)
  {
	var rowIndex = i;
	var table = document.getElementById("measurements");
	var measurementRowId;
	var measurementRowIdTitle;
	var numTitlesPassed = 0;
	for (var a = 2; a < table.rows.length; a++) {
	  measurementRowIdTitle = table.rows[a].cells[1].id
	  if (measurementRowIdTitle == "") //title
	  {
		if ((i + 2 + numTitlesPassed) >= (a)) // how many titles have passed?
		{
		  numTitlesPassed += 1;
		}
	  }
	}
	if (table.rows.length >= 4) {
	  measurementRowId = table.rows[rowIndex + 2 + numTitlesPassed].cells[1].id; //start after theader, search bar. Get the middle cell.
	  var measurementIdArray = measurementRowId.split("measurement-");
	  var obj = $.grep(measurementData, function(obj) {
		return obj.id == measurementIdArray[1];
	  })[0];
	  return obj;
	}
  }
  
  //removes all the colors from the list of features.
  function removeHighlights() {
	highlightedFeaturePoints = [];
	document.getElementById("highlightedFPs").style["visibility"] = "hidden";
	var ID;
	var i = 0;
	var currentFeaturePoint;
	var table = document.getElementById("features");
	if (table) {
	  if (table.rows.length > 2) {
		for (i = 0; i < fixedFeaturePointLength; i++) {
		  currentFeaturePoint = findRowElementFP(i); //the function returns the actual json object, in the order created by the dynamically generated list.
		  ID = currentFeaturePoint.id;
		  if (document.getElementById("fp-" + ID)) {
			document.getElementById("fp-" + ID).style["background-color"] = "initial";
		  }
		}
	  }
	}
  }
  
  //Removes all the colors from the list of select -> features.
  function removeHighlightsEDIT() {
	var ID;
	var i = 0;
	for (i = 0; i < fpoints.length; i++) {
	  ID = fpoints[i].id;
	  document.getElementById("fp-" + ID + "EDIT").style["background-color"] = "initial";
	}
  }
  
  
  //A function used to remove background colors from the list of measurements.
  function removeHighlightsM() {
	highlightedMeasurements = [];
	document.getElementById("highlightedMs").style["visibility"] = "hidden";
	var ID;
	var i = 0;
	var currentMeasurement;
	var table = document.getElementById("measurements");
	if (table) {
	  if (table.rows.length > 2) {
		for (i = 0; i < fixedMeasurementLength; i++) {
		  currentMeasurement = findRowElementMeasurement(i);
		  ID = currentMeasurement.id;
		  document.getElementById("measurement-" + ID).style["background-color"] = "initial";
		}
	  }
	}
  }
  
  //Removes all highlights from the select -> measurements table.
  function removeHighlightsMEDIT() {
	var ID;
	var i = 0;
	for (i = 0; i < measurementData.length; i++) {
	  ID = measurementData[i].id;
	  document.getElementById("measurement-" + ID + "EDIT").style["background-color"] = "initial";
	}
  }
  
  //Used for highlighting all of the elements in the select lists for features or elements.
  function onSelectClick(id) {
	var currentElement;
	//is it already toggled?
	if (document.getElementById(id).checked) {
	  if (id == "selectAllMeasurements") {
		for (var i = 0; i < measurementData.length; i++) {
		  currentElement = document.getElementById(measurementData[i].id + "EDIT");
		  currentElement.checked = true;
		}
	  } else {
		for (var i = 0; i < fpoints.length; i++) {
		  currentElement = document.getElementById(fpoints[i].id + "EDIT");
		  currentElement.checked = true;
		}
	  }
	} else {
	  if (id == "selectAllMeasurements") {
		for (var i = 0; i < measurementData.length; i++) {
		  currentElement = document.getElementById(measurementData[i].id + "EDIT");
		  currentElement.checked = false;
		}
	  } else {
		for (var i = 0; i < fpoints.length; i++) {
		  currentElement = document.getElementById(fpoints[i].id + "EDIT");
		  currentElement.checked = false;
		}
	  }
	}
  }
  
  //Used to replace the current selection list for features or measurements with the default list.
  function replaceList(id) {
	var currentElement;
	if (id == "measurementReplace") {
	  for (var i = 0; i < measurementData.length; i++) {
		currentElement = document.getElementById(measurementData[i].id + "EDIT");
		currentElement.checked = false;
		for (var j = 0; j < defaultMeasurements.length; j++) {
		  if (measurementData[i].id == defaultMeasurements[j]) {
			currentElement = document.getElementById(measurementData[i].id + "EDIT");
			currentElement.checked = true;
		  }
		}
	  }
	  submitEditChangesMeasurements();
	  $(document).ready(function() {
		$("#measurementEdit").modal('toggle');
	  });
	} else {
	  for (var i = 0; i < fpoints.length; i++) {
		currentElement = document.getElementById(fpoints[i].id + "EDIT");
		currentElement.checked = false;
		for (var j = 0; j < defaultFeatures.length; j++) {
		  if (fpoints[i].id == defaultFeatures[j]) {
			currentElement = document.getElementById(fpoints[i].id + "EDIT");
			currentElement.checked = true;
		  }
		}
	  }
	  submitEditChangesFP();
	  $(document).ready(function() {
		$("#featureEdit").modal('toggle');
	  });
	}
  }
  

