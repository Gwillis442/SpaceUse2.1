const { get } = require('jquery');
const furnitureData = require('./data/furniture.json');
//setup global variables for map builder
var selected_marker;
var selected_furn;
var mapPopulated = false;
var floor_id_selection = -1;
var form_info = document.getElementById("floor_dropdown");
var floor_image = "local";
var polyArea;
var furn;
var ftype;
var coord;
var lat;
var lng;
var drawing = false;

//floor image placed from dropdown selection
var image;

//Varables to hold the room info
var roomName = "";
var roomId = "";

function areaMaker(e){
    if(drawing === false){
        //Turn on Drawing UI
        drawing = true;
        

    }
    else if(drawing === true){
        //Turn off Drawing UI
        drawing = false;
    }
}

function markerLayClick(e){
selected_marker = this;
  selected_furn  = furnMap.get(this.fid);

  // build HTML for popup
  const content = `
    <div>
      <div><strong>Type:</strong> ${selected_furn.ftype}</div>
      <div><strong>Seats:</strong> ${selected_furn.num_seats}</div>
      <div style="margin:0.5em 0;">
        <label for="rotateSlider">Rotate:</label><br/>
        <input type="range" id="rotateSlider" min="-180" max="180" step="10" 
               value="${selected_furn.degreeOffset}" style="width:100%;"/><br/>
        <span id="sliderValue">${selected_furn.degreeOffset}°</span>
      </div>
      <button id="deleteMarkerButton" style="margin-top:0.5em;">Delete</button>
    </div>`;

  // set and open
  selected_marker.setPopupContent(content);
  selected_marker.openPopup();

  // attach slider handler
  const slider = document.getElementById('rotateSlider');
  const display = document.getElementById('sliderValue');
  slider.oninput = () => {
    const angle = +slider.value;
    selected_furn.degreeOffset = angle;
    selected_marker.setRotationOrigin('center');
    selected_marker.setRotationAngle(angle);
    display.textContent = angle + '°';
  };

  // attach delete handler
  document.getElementById('deleteMarkerButton').onclick = () => {
    mymap.removeLayer(selected_marker);
    furnMap.delete(selected_furn.furn_id);
  };
}

function addAreas(areadata){
    //Add Areas to AreaMap
    //let areadata = global.shared.areadata['Areas'][sfloor];
    var curfloor = '';
    switch(sfloor){
        case 1: curfloor = "Floor 1"; break;
        case 2: curfloor = "Floor 2"; break;
        case 3: curfloor = "Floor 3"; break;
      }
    
    let areafloor = areadata.Areas[curfloor];
    for(i in areafloor){
        let cur_area_data = areafloor[i];
        let new_area = new Area(i, cur_area_data["facilities_id"], cur_area_data["name"]);
        let points = areafloor[i].points;
        for(j in points){
            curpoint = points[j];
            let x = curpoint.v_x;
            let y = curpoint.v_y;
            var newVert = new AreaVertices(x, y);
            new_area.area_vertices.push(newVert);
        }

        var polyItem = drawArea(new_area);
        new_area.polyArea = polyItem;
        areaMap.set(i, new_area);
        polyItem.addTo(areaLayer);
        
    }
    //Populate Map with Data from AreaMap
}

function createFurnObj(ftype, lat, lng, coord){
    mapKey++;
    const meta = furnitureData.find(m=>m.ftype===ftype) || {};
    var iconInstance = getIconObj(ftype);
    
    //create the furniture object and store in map
    var newFurn = new Furniture(mapKey, meta.seats || 0);
    newFurn.ftype = ftype;
    newFurn.x = lng;
    newFurn.y = lat;
    newFurn.degreeOffset = 0;
    console.log(newFurn);

    furnMap.set(mapKey, newFurn);
    console.log(`Furniture Map Contents After Creation:`, Array.from(furnMap.entries()));

    var marker = L.marker([lat, lng], {
    icon:          iconInstance,
    rotationAngle: newFurn.degreeOffset,
    draggable:    true
  }).addTo(furnitureLayer);

    marker.setIcon(iconInstance);
    marker.fid = newFurn.furn_id;
    marker.ftype = ftype;

    marker.bindPopup('', {minWidth:200, minHeight:200})
        .on('click', markerLayClick)
        .on('dragend', function(e) {
             const pos = e.target.getLatLng();
             const furn = furnMap.get(this.fid);
             furn.x = pos.lng;
             furn.y = pos.lat;
             console.log('dragend:', furn);
             setTimeout(()=> mymap.on('click', markerLayClick),10);
        });

    // Update the global array for the selected floor
    updateGlobalArrayForFloor(sfloorName);

    //TODO: check if furniture is in an area, if it is add the area_id

    if(document.getElementById("laypopup") == null){
            popupDiv = document.createElement("DIV");
            popupDiv.id = "laypopup";
            document.getElementById("popupHolder").appendChild(popupDiv);
    }

    var popup = document.getElementById("laypopup");
    var laypopupDim =
    {
        'minWidth': '200',
        'minHeight': '400'
    };//This is the dimensions for the popup

    // marker = L.marker(coord, {
    //         fid: mapKey,
    //         icon: selectedIcon,
    //         rotationAngle: 0,
    //         draggable: true
    // }).addTo(furnitureLayer).bindPopup(laypopup, laypopupDim);
    // //give it an onclick function
    // marker.on('click', markerLayClick);

    //define drag events
    marker.on('drag', function(e) {
        console.log('marker drag event');
    });
    marker.on('dragstart', function(e) {
        console.log('marker dragstart event');
        mymap.off('click', markerLayClick);
    });
    marker.on('dragend', function(e) {
        //update latlng for insert string
        var changedPos = e.target.getLatLng();
        var lat=changedPos.lat;
        var lng=changedPos.lng;

        selected_marker = this;
        selected_furn = furnMap.get(this.fid);
        selected_furn.x = lng;
        selected_furn.y = lat;

        //output to console to check values
        console.log('marker dragend event, updated coords:', selected_furn);

        setTimeout(function() {
            mymap.on('click', markerLayClick);
        }, 10);
    });
}

//Deletes the selected marker
function deleteHelper()
{
	mymap.removeLayer(selected_marker);
	furnMap.delete(selected_furn.furn_id);
}

function seatAddHelper(thisFurn){

    if(document.getElementById("seatTracker") != null){
        document.getElementById("seatTracker").remove();
    }
    
    let parentDiv = "seataddDiv";

    var seatTracker = document.createElement('input');
    seatTracker.type = "number";
    seatTracker.id = "seatTracker";
    seatTracker.max = "10";
    seatTracker.min = "0";
    seatTracker.value = thisFurn.num_seats;

    document.getElementById(parentDiv).appendChild(seatTracker);

    seatTracker.oninput = function(){
        selected_furn.num_seats = seatTracker.value;
    }

}



//Rotation Functionality
//This function helps rotate the furniture and appends the div after the furniture has been rotated.
function rotateHelper(parentDiv)
{
	if(document.getElementById("rotateSlider") == null)
	{
		var rotateSlider = document.createElement("input");
		rotateSlider.type = "range";
		rotateSlider.min = "-180";
		rotateSlider.max = "180";
		rotateSlider.value = "0";
		rotateSlider.step = "10";
		rotateSlider.id = "rotateSlider";
		rotateSlider.value = selected_furn.degreeOffset;
		
		var sliderValue = document.createElement("p");
		sliderValue.id = "sliderValue";
		sliderValue.innerText = "Value: "+selected_furn.degreeOffset;
		
		document.getElementById(parentDiv).appendChild(sliderValue);
		document.getElementById(parentDiv).appendChild(rotateSlider);
	
			
		rotateSlider.oninput = function()
		{
			selected_marker.setRotationOrigin("center");
			selected_furn.degreeOffset =rotateSlider.value;
			selected_marker.options.degree_offset = rotateSlider.value;
			selected_marker.setRotationAngle(rotateSlider.value);
			sliderValue.innerText = "Value: " + rotateSlider.value;
		}
	}
	
	else
	{
		document.getElementById("rotateSlider").remove();
		document.getElementById("sliderValue").remove();
	}

}

// Added in 2.1
// Update the global array dynamically based on the selected floor
function updateGlobalArrayForFloor(floorName) {
    if (!global.shared.createLayout) {
        global.shared.createLayout = [];
    }

    // Check if the floor already exists in the global array
    let floorIndex = global.shared.createLayout.findIndex(layout => layout[floorName]);

    if (floorIndex === -1) {
        let newFloorData = {};
        newFloorData[floorName] = []; // Initialize an empty array for furniture
        global.shared.createLayout.push(newFloorData);
        floorIndex = global.shared.createLayout.length - 1;
        console.log(`Initialized layout structure for ${floorName}`);
    }

    const furnData = Array.from(furnMap.values().map(furn => {
        const meta = furnitureData.find(item => item.ftype === furn.ftype);
        return{
            fid: furn.furn_id,
            num_seats: meta ? meta.seats : (parseInt(furn.num_seats)||0),
            x: furn.x,
            y: furn.y,
            ftype: furn.ftype,
            degree_offset: parseInt(furn.degreeOffset) || 0 // Ensure degree_offset is a number
        };
    }));

    global.shared.createLayout[floorIndex][floorName] = furnData;
    console.log(`Updated layout structure for ${floorName}:`, global.shared.createLayout[floorIndex][floorName]);
    console.log(`Global Layout Array Contents:`, global.shared.createLayout);

}

// Modify the chooseImageBtn click event to use the new function
chooseImageBtn.addEventListener('click', function(event) {
    event.preventDefault();

    if (!imagepath) {
        console.error("No image path selected");
        return;
    }

    console.log("Initializing layout structure for floor:", sfloor, sfloorName);

    // Update the global array for the selected floor
    updateGlobalArrayForFloor(sfloorName);

    mapView.style.display = "block";
    isLayoutEdit = true;
    isSurvey = false;
    isMulti = false;
    addMapPic();
});

// Function to save the global array as a JSON file
function saveLayoutData() {
    const date = new Date();
  // merge your array of { Floor X: [...] } entries into one object
  const floors = Object.assign({}, ...global.shared.createLayout);
  // prepend the Layout flag
  const outObj = Object.assign({ Layout: true }, floors);

    console.log("Saving Layout Data:", outObj);

    // Use the File System API to save the JSON file
    const fs = require('fs');
    const filePath = `./Layouts/${sfloorName}_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;

    fs.writeFile(filePath, JSON.stringify(outObj, null, 2), (err) => {
        if (err) {
            console.error("Error saving layout data:", err);
        } else {
            console.log(`Layout data for ${sfloorName} saved successfully to ${filePath}`);
        }
    });
    alert(`Layout data for ${sfloorName} saved successfully!`);
}

// Modify the layoutSaveLay button click event to call the save function
layoutSaveLay.addEventListener('click', function(event) {
    event.preventDefault();
    saveLayoutData();
});