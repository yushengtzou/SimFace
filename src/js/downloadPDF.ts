function createPDF()
{		
	if(measurementCreated)
	{
		var doc = new jsPDF('l','pt','letter',true); //letter: [612, 792]
		var today = new Date();
		var date = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
		var time = today.getHours() + ":" + today.getMinutes();
		var datetime = "Date created: " + date + "\tTime created: " + time;
		
		var currentType = "";
		var anyMeasurementsFound = false;
		var currentName = "";
		doc.text("This report was printed at digitized-rhinoplasty.com", 380, 30, "center");
		if(renderer)
		{
			setTimeout(() => { //we use setTimeout because, otherwise, all of the pictures would be taken and then the camera would be rotated. A weird synchronous programming problem.
				camera.position.set(0, 0, cameraZ);	
				toggleVisualizationOn("landmarks");
				document.getElementById("highlightedFPs").style["visibility"] = "hidden";
				document.getElementById("timeProcess").style.visibility = "visible";
				controls.enableRotate = false;
			}, 50)
			setTimeout(() => { 
				var imgData = renderer.domElement.toDataURL('image/JPEG', 1.0);
				doc.addImage(imgData, 'JPEG', 100, 80, 580, 500);	
				doc.text("Frontal View", 370, 70, "center");
				doc.addPage();
				camera.position.set(cameraZ, 0, 0);	
			}, 800)
			setTimeout(() => {
				var imgData2 = renderer.domElement.toDataURL('image2/JPEG', 1.0);
				doc.addImage(imgData2, 'JPEG', 100, 80, 580, 500);	
				doc.text("Left Lateral View", 370, 45, "center");
				doc.addPage();
				camera.position.set(-cameraZ, 0, 0);
			}, 1600)
			setTimeout(() => {
				var imgData3 = renderer.domElement.toDataURL('image3/JPEG', 1.0);
				doc.addImage(imgData3, 'JPEG', 100, 80, 580, 500);
				doc.text("Right Lateral View", 370, 45, "center");
				doc.addPage();
				camera.position.set(0, -cameraZ, cameraZ * .7);						
			}, 2400)
			setTimeout(() => {
				var imgData4 = renderer.domElement.toDataURL('image4/JPEG', 1.0);
				doc.addImage(imgData4, 'JPEG', 100, 80, 580, 500);
				doc.text("Basal View", 370, 45, "center");
				camera.position.set(0, 0, cameraZ);
			}, 3200)
		}
		setTimeout(() => {
			doc.addPage();
		doc.text('Measurements recorded', 380, 40, "center");
		doc.cellInitialize();
		$.each(measurementData, function(i, row){
			$.each(row, function(j,cell){ //go through the attributes, where j is the name of the current attribute (not a number). Cell is the current value of the attribute.
				if(i == 0) //header row
				{
					if(j == "id")
					{
						doc.cell(70,60,350,20,"Measurement",-1);
						doc.cell(70,60,120,20,"Value", -1);
						doc.cell(70,60,160,20,"Measurement Type", -1);
					}
					if(j == "name")
					{
						currentName = cell;
					}
					if(j == "type")
					{
						currentType = cell;
					}
					if(j == "value" && cell != "")
					{
						doc.cell(70,60,350,20,currentName,i);	
						if(currentType == "Distances")
						{
							doc.cell(70,60,120,20,cell + " mm",i);	
						}
						else if(currentType == "Angles")
						{
							doc.cell(70,60,120,20,cell + " degrees",i);
						}
						else if(currentType == "Ratios")
						{
							doc.cell(70,60,120,20,cell,i);
						}
						else if(currentType == "Distances - Surface")
						{
							doc.cell(70,60,120,20,cell + " mm *",i);
						}
						else 
						{
							doc.cell(70,60,120,20,cell,i);
						}
						doc.cell(70,60,160,20,currentType,i);
						anyMeasurementsFound = true;
					}
				}
				else
				{
					if(j == "name")
					{
						currentName = cell;
					}
					if(j == "type")
					{
						currentType = cell;
					}
					if(j == "value" && cell != "")
					{
						doc.cell(70,60,350,20,currentName,i);	
						if(currentType == "Distances")
						{
							doc.cell(70,60,120,20,cell + " mm",i);	
						}
						else if(currentType == "Angles")
						{
							doc.cell(70,60,120,20,cell + " degrees",i);
						}
						else if(currentType == "Ratios")
						{
							doc.cell(70,60,120,20,cell,i);
						}
						else if(currentType == "Distances - Surface")
						{
							doc.cell(70,60,120,20,cell + " mm *",i);
						}
						else 
						{
							doc.cell(70,60,120,20,cell,i);
						}
						doc.cell(70,60,160,20,currentType,i);
						anyMeasurementsFound = true;
					}
				}
			});
		});
		var lMargin=15; //left margin in pt 
		var rMargin=15; //right margin in pt
		var pdfInMM=792;  // width of letter in pt
		doc.setFontSize(7);
		var paragraph = "* Surface distances are created by tracing a distance across the surface of the model provided from one point to another. The lines that are displayed in the scene after clicking on a surface distance measurement represent a visualization of how the distance is calculated. However, the actual method that outputs a result for a measurement and is used for computing the surface distance is more accurate than can be visually shown due to problems in displaying the surface lines."
		var lines =doc.splitTextToSize(paragraph, (pdfInMM-lMargin-rMargin)); //make the text wrap around the page.
		doc.text(lMargin,600,lines);
		toggleVisualizationOff();
		removeHighlights();
		var inputVal = (document.getElementById("pdfName").value);
		controls.enableRotate = true;
		document.getElementById("timeProcess").style.visibility = "hidden";
		if(inputVal == "")
		{
			doc.save('DigitizedRhinoplasty.pdf');
		}
		else
		{
			doc.save(inputVal + '.pdf');
		}
		document.getElementById("pdfName").value = "";
		}, 5000)
	}
	else
	{
		alert("No measurements have been recorded. Try recording some data before trying to create a report.");
	}
}
