//All Map functions:
//Initalize Map

/*
Created By Verja Miller
MIT LISCENSE
*/
var L = require('leaflet');
window.$ = window.jQuery = require('jquery');

var imagepath = "";
var sfloor = "";
var isSurvey = false;
var isMulti = false;
var isLayoutEdit = false;
var selected_furn;
var selected_marker;
var seat_num;
var floor_path;

//Info For Uploaded Surveys
var SurveyStartTime;
var SurveyEndTime;

//Buttons from DOM to apply helpers too
var SaveBtn = document.getElementById('save');
var LockBtn = document.getElementById('lock');
var RotateBtn = document.getElementById('rotate');
var CheckAllBtn = document.getElementById('checkall');
var MinusBtn = document.getElementById('minus');
var PlusBtn = document.getElementById('plus');

// expose addMapPic to renderer
window.addMapPic = addMapPic;

// Helper functions to show and hide popup
function showPopup() {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('popup-overlay');
    console.log('showPopup called - popup element:', popup);
    console.log('showPopup called - overlay element:', overlay);
    
    if(popup && overlay) {
        overlay.style.display = 'block';
        popup.style.display = 'block';
        console.log('Popup shown');
    } else {
        console.error('Popup elements not found! popup:', popup, 'overlay:', overlay);
        // Try to create popup if it doesn't exist
        if(!popup || !overlay) {
            console.log('Attempting to reinitialize popup...');
            reinializePop();
            // Try again after reinitializing
            const newPopup = document.getElementById('popup');
            const newOverlay = document.getElementById('popup-overlay');
            if(newPopup && newOverlay) {
                newOverlay.style.display = 'block';
                newPopup.style.display = 'block';
                console.log('Popup shown after reinitializing');
            }
        }
    }
}

function hidePopup() {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('popup-overlay');
    if(popup && overlay) {
        popup.style.display = 'none';
        overlay.style.display = 'none';
        console.log('Popup hidden');
    }
}

function reinializePop(){
    let obj = document.getElementById('MapContainer');
    obj.insertAdjacentHTML('afterend', '<div id="popup-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;"></div><div id="popup" style="display: none;"><button id="closePopup" style="position: absolute; top: 10px; right: 10px; background: #ff4444; color: white; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer; font-weight: bold; z-index: 1001;">✕</button><div id="seat_div"></div><div id="wb_div"></div><button id="save" style="display:none">Save and Exit</button><button id="lock">Unlock</button><button id="checkall" style="display:none">Check All</button><label id="seat_operator"></label><button id="minus" style="display:none">-</button><button id="plus" style="display:none">+</button></div>');
    let popup= document.getElementById('popup');

    SaveBtn = document.getElementById('save');
    LockBtn = document.getElementById('lock');
    //RotateBtn = document.getElementById('rotate');
    CheckAllBtn = document.getElementById('checkall');
    MinusBtn = document.getElementById('minus');
    PlusBtn = document.getElementById('plus');

    
    MinusBtn.addEventListener('click', ()=>{
        minus(selected_furn);
    });

    //calls when plus button is clicked
    PlusBtn.addEventListener('click', ()=>{
        var newSeat = new Seat(temp_seat_places.length);
        temp_seat_places.push(newSeat);
        plus(newSeat, temp_seat_places.length, true);
        checkAll(selected_furn);
    });

    //called when save button is clicked on popup.
    SaveBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Save button clicked');
        
        var occupants = document.getElementById("occupantInput");
        if(occupants)
        {
            selected_furn.totalOccupants = occupants.value;
        }
        
        if(selected_marker) {
            selected_marker.setOpacity(1);
        }
        
        if(selected_furn && temp_seat_places) {
            selected_furn.seat_places = temp_seat_places;
        }
        
        if(temp_wb && temp_wb.length > 0)
        {
            selected_furn.whiteboard = temp_wb;
        }
        
        // Hide the popup after saving
        hidePopup();
        
        // Also try to close any Leaflet popups
        if(typeof mymap !== 'undefined' && mymap.closePopup) {
            mymap.closePopup();
        }
    });

    //helps lock or unlock furniture item on movement
    LockBtn.addEventListener('click', ()=>{
        var lockButton = document.getElementById("lock");
        
        if(lockButton.innerText === "Unlock")
        {
            selected_marker.dragging.enable();
            lockButton.innerText = "Lock";
        }        	
        else
        {
            selected_marker.dragging.disable();
            lockButton.innerText = "Unlock";
        }
        
        // Hide the popup after locking/unlocking
        hidePopup();
        
        mymap.closePopup();
    });

    //called when checkall button is clicked.function
    CheckAllBtn.addEventListener('click', ()=>{
        checkAll(selected_furn);
    });

    //called when close button is clicked to close popup
    const closePopupBtn = document.getElementById('closePopup');
    if(closePopupBtn) {
        closePopupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hidePopup();
        });
    }

    // Add click listener to overlay to close popup when clicking outside
    const overlay = document.getElementById('popup-overlay');
    if(overlay) {
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hidePopup();
        });
    }
}

//Initalize Map
var mymap = L.map('MapContainer', {crs: L.CRS.Simple, minZoom: 0, maxZoom: 4});
var furnitureLayer = new L.layerGroup().addTo(mymap);
var surveyLayer = new L.layerGroup().addTo(mymap);
var surveyAreaLayer = new L.layerGroup().addTo(mymap);
var areaLayer = L.layerGroup().addTo(mymap);
var drawnItems = new L.FeatureGroup().addTo(mymap);
var bounds = [[0,0], [360,550]];

mymap.fitBounds(bounds);

//map image
var image;
var furnMap = new Map();
var activityMap = new Map();
var wb_activityMap = new Map();
var areaMap = new Map();

//Define Activities
activityMap.set(0, "Studying");
activityMap.set(1, "Computer");
activityMap.set(2, "Entertainment");

wb_activityMap.set(0, "Partition");
wb_activityMap.set(1, "Writing");

//container for furniture objects
var furnMap = new Map();
var mapKey = 0;

var popupDim =
{
    'maxWidth': '5000',
    'maxHeight': '5000'
};

var surveyPopDim =
{
    'maxWidth': '300',
    'maxHeight': '300'
}

//extend the marker class to add furniture data
var marker = L.Marker.extend({
    options: {
        fid: 0,
        ftype: "default ftype",
        degreeOffset: 0,
        numSeats: 0,
        defaultSeat: "default seat"
    }
});

//Create the boundries for placing furniture
var latMax = 359.75;
var latMin = -0.5;
var longMax = 508.18;
var longMin = 42.18;

function surveyClick(e){
    console.log('surveyClick called!');
    
    // Show the popup and call the main marker click function for survey popup
    showPopup();
    
    // Debug: Log the marker options and furnMap
    console.log('Survey click - marker options:', this.options);
    console.log('Survey click - furnMap size:', furnMap.size);
    console.log('Survey click - looking for fid:', this.options.fid);
    console.log('Survey click - furnMap contents:', Array.from(furnMap.entries()));
    
    // Check if markerClick function exists
    if(typeof markerClick === 'function') {
        console.log('Calling markerClick...');
        markerClick.call(this, e);
    } else {
        console.error('markerClick function not found!');
    }
    
    // Ensure save button is visible and clickable after markerClick
    setTimeout(() => {
        const saveBtn = document.getElementById('save');
        if(saveBtn) {
            saveBtn.style.display = 'block';
            console.log('Save button made visible');
        } else {
            console.log('Save button not found');
        }
    }, 100);
}

//Proccesses clicking the map
mymap.on('click', function(e){
    var coord = e.latlng;
    var lat = coord.lat;
    var lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);

    if(isLayoutEdit === true){
        let outBounds = false;
        if(lat > latMax || lat < latMin || lng > longMax || lng < longMin){
            alert("Please place the furniture inside the map");
            outBounds = true;
        }

        //check if area was clicked out of bounds
        if(outBounds === false && drawing === false){
            //get the furniture select element
            furn = document.getElementById("furn_icons");
            //get the type id from the value
            ftype = furn.value;
            //convert the string furniture type into an int to send to getIconObj(int ftype)
            ftype = parseInt(ftype);

            createFurnObj(ftype, lat, lng, coord);
        }

        if(drawing === true){
            //Create Polygon for area's here;

            
        }
    }
});

//create a container for areas
var areaMap = new Map();

//Furniture Obj
function Furniture(fid, num_seats){
    this.furn_id = fid;
    this.num_seats = num_seats;
    this.seat_places = [];
    this.seat_type = 32;
    this.whiteboard = [];
    this.marker;
    this.area_id;
    this.modified = false;
    this.degree_offset = 0;
    this.x;
    this.y;
    this.ftype;
    this.avgUseRatio;
    this.avgOccupancy;
    this.sumOccupants;
    this.modified_count;
    this.mod_array;
    this.activities;
    this.arrOccupants = [];
    this.peakuse;
    this.peakPop = 0;
}

//Seat Obj
function Seat(seatPos){
    this.seatPos = seatPos;
    //this.type = type;
    this.activity = [];
    this.occupied = false;
}

//Area Obj
function Area(area_id, facilites_id, area_name){
    this.area_id = area_id
    this.facilites_id = facilites_id;
    this.area_name = area_name;
    this.area_vertices = [];
    this.polyArea;
    this.totalOccupants = 0;
    this.totalSeats = 0;
    this.totalOccupants = 0;
    this.totalSeats = 0;
    this.avgPopArea = 0;
    this.avgRatio = 0;
    this.totalSeatsUsed = 0;
    this.peakPop = 0;
    this.peakSurvey = 0;
    this.peakDate = 0;
}

function AreaVertices(x,y){
    this.x = x;
    this.y = y;
}
//Create markers for layout editing
function build_layout_markers(furnitureArray){
    furnMap.clear();
    drawnItems.clearLayers();
    furnitureArray.forEach(furn => {
        let icon = getIconObj(parseInt(furn.ftype));
        let m = L.marker([furn.y, furn.x], {
            icon: icon,
            rotationAngle: furn.degree_offset,
            rotationOrigin: "center",
            draggable: true,
            fid: furn.furn_id
        }).addTo(drawnItems);
        m.on('click', markerLayClick);
        furn.marker = m;
        furnMap.set(furn.furn_id, furn);
    });
}

//pass information from the layout to build the markers after loading layout file

// Correct build_layout_markers defined above; remove this stray duplicate definition

function display_survey(surveyArray){

    var total_seats = 0;
    var occupied_seats = 0;

    for(var i in surveyArray){

        var key = surveyArray[i];
        var furn_id = key.furn_id;

        var num_seats = parseInt(key.num_seats);
        total_seats += num_seats; 

        var area = key.area_id;
        var x = key.x;
        var y = key.y;
        var degree_offset = key.degree_offset;
        var furniture_type = key.ftype;
        var seat_places = key.seat_places;
        var sumOccupant = 0;
        for(var j = 0; j < seat_places.length; j++){

            let seat = seat_places[j];
            if(seat.occupied === true){
                occupied_seats++;
                sumOccupant++;
                
                //add to area occupied seats here
                if(area != undefined && area < areaMap.size){
                    areaMap.get(area).totalOccupants++; 
                }
                
            }
        }
        
        //add to area total seats;
        if(area != undefined && area < areaMap.size){
            areaMap.get(area).totalSeats += num_seats;
        }

        var latlng = [y,x];

        //parse furniture type to an int, then get the correct icon
        var type =  parseInt(furniture_type);

        var sicon = getIconObj(type);

        //build Text Content of Seat
        var popupString = "<strong>Seat ID: </strong>" 
                        + furn_id.toString() 
                        + "</br><strong>Total Occupants: </strong>" 
                        + sumOccupant
                        + "</br><strong>Max Occupants: </strong>"
                        + num_seats;


        //place a marker for each furniture 
        marker = L.marker(latlng, {
            icon: sicon,
            rotationAngle: degree_offset,
            rotationOrigin: "center",
            draggable: false,
            ftype: furniture_type,
            numSeats: num_seats,
            seats: seat_places,
            fid: furn_id.toString()
        }).addTo(surveyLayer);
        // Note: Not binding Leaflet popup since we use custom popup system

        //make marker clickable
        marker.on('click', surveyClick);

        if(seat_places.length <= 0){
            marker.setOpacity(.3);
        }

        
    }

    var dataWindow = document.getElementById('surveyData');
    dataWindow.style.display = "block";

    let datastring = "<strong>Survey Start: </strong>"
    + SurveyStartTime
    + "</br><strong>Survey End: </strong>"
    + SurveyEndTime
    + "</br><strong>Total Occupants: </strong>" 
    + occupied_seats
    + "</br><strong>Max Occupants: </strong>"
    + total_seats
    + "</br><hr>";
    dataWindow.innerHTML = datastring;

    //Display Area Popups here: Create Data String for each area and append it to the inner HTML

    areaMap.forEach(function(item){
        let p = ((item.totalOccupants / item.totalSeats) * 100).toFixed(2) + '%';

        let areastring = "<Strong>Area: </strong>"
        + item.area_name
        + "</br><strong>Facilities ID: </strong>"
        + item.facilites_id
        + "</br><strong>Total Occupants: </strong>" 
        + item.totalOccupants 
        + "</br><strong>Max Occupants: </strong>"
        + item.totalSeats
        + "</br><strong>Percentage Used: </strong>"
        + p
        + "</br><hr>";

        dataWindow.innerHTML += areastring;
    });
        
    

    mymap.invalidateSize();
}

//Add Image of Map to div
function addMapPic(){
    // sync local flags and floor from renderer.js globals
    sfloor = window.sfloor;
    isSurvey = window.isSurvey;
    isMulti = window.isMulti;
    isLayoutEdit = window.isLayoutEdit;
    console.log("addMapPic: sfloor=", sfloor, "isLayoutEdit=", isLayoutEdit, "imagepath=", imagepath);
    console.log("global.layout keys:", global.layout ? Object.keys(global.layout) : "global.layout is undefined");
    console.log("global.survey keys:", global.survey ? Object.keys(global.survey) : "global.survey is undefined");
    //remove old floor imagepath and place newly selected floor imagepath
    if(image != undefined){
        mymap.removeLayer(image);
    }

    //reinalize furniture layer
    if(mymap.hasLayer(furnitureLayer)){
        mymap.removeLayer(furnitureLayer);
        mymap.removeLayer(areaLayer);
       
        furnitureLayer = new L.layerGroup().addTo(mymap);
        areaLayer = new L.layerGroup().addTo(mymap);
        

        if(document.getElementById("popup") === null){
            console.log('Popup not found, calling reinializePop...');
            reinializePop();
            SaveBtn = document.getElementById('save');
            LockBtn = document.getElementById('lock');
            RotateBtn = document.getElementById('rotate');
            CheckAllBtn = document.getElementById('checkall');
            MinusBtn = document.getElementById('minus');
            PlusBtn = document.getElementById('plus');
        } else {
            console.log('Popup already exists');
        }
    }

    if(mymap.hasLayer(surveyLayer)){
        mymap.removeLayer(surveyLayer);
        mymap.removeLayer(surveyAreaLayer);
     
        surveyLayer = new L.layerGroup().addTo(mymap);
        surveyAreaLayer = new L.layerGroup().addTo(mymap);
        
        // Also check for popup in survey mode
        if(document.getElementById("popup") === null){
            console.log('Survey mode: Popup not found, calling reinializePop...');
            reinializePop();
            SaveBtn = document.getElementById('save');
            LockBtn = document.getElementById('lock');
            RotateBtn = document.getElementById('rotate');
            CheckAllBtn = document.getElementById('checkall');
            MinusBtn = document.getElementById('minus');
            PlusBtn = document.getElementById('plus');
        } else {
            console.log('Survey mode: Popup already exists');
        }
    }


    //TODO:: Eventually replace this code with a dynamic file picker
    sfloor = parseInt(sfloor);
    let sfloorName = "";
    switch(sfloor){
        case 0:
            imagepath = "";
            break;
        case 1:
            imagepath = "./images/floor1.svg";
            sfloorName = "Floor 1";
            break;
        case 2:
            imagepath = "./images/floor2.svg";
            sfloorName = "Floor 2";
            break;
        case 3:
            imagepath = "./images/floor3.svg";
            sfloorName = "Floor 3";
            break;
    }

    if(sfloor != '' && imagepath != ''){
        image = L.imageOverlay(imagepath, bounds);
        image.addTo(mymap);

        //load furniture after image depending on selected layout.
        if(isMulti === true){
            
            areaMap.clear();
            furnMap.clear();
            dateMap.clear();
            
            display_multisurvey(global.survey, sfloor, sfloorName);
        } 
        else if(isSurvey === true && global.layout){
            // Survey mode with loaded layout (not survey data) - CHECK THIS FIRST!
            console.log("Survey with layout branch: sfloorName=Floor "+sfloor);
            const floorKey = "Floor " + sfloor;
            const areasObj = (global.layout && global.layout.Areas) || {};
            const areaDataLog = areasObj[floorKey] || {};
            console.log("Areas data for survey:", areaDataLog);
            const furnDataLog = (global.layout && global.layout[floorKey]) || [];
            console.log("Furniture data for survey:", furnDataLog);
            
            areaMap.clear();
            
            // Set survey times for new survey session
            SurveyStartTime = new Date().toLocaleString();
            SurveyEndTime = "In Progress";
            
            // 1) draw saved Areas for survey
            let sfloorName = floorKey;
            let areaData = areasObj[sfloorName] || {};
            for (let aKey in areaData) {
                let a = areaData[aKey];
                let areaObj = new Area(aKey, a.facilities_id, a.name);
                // a.points is an object; iterate its keys
                for (let ptKey in a.points) {
                    let pt = a.points[ptKey];
                    areaObj.area_vertices.push(new AreaVertices(pt.v_x, pt.v_y));
                }
                let poly = drawArea(areaObj);
                areaObj.polyArea = poly;
                areaMap.set(aKey, areaObj);
                poly.addTo(surveyAreaLayer);
            }

            // 2) load furniture data for survey display
            let furnData = (global.layout && global.layout[sfloorName]) || [];
            console.log("Loading furniture data for survey:", furnData);
            let surveyItems = [];
            
            if(Array.isArray(furnData)) {
                // Handle case where furnData is an array
                for(let f of furnData) {
                    if(f && f.fid) {
                        let obj = new Furniture(f.fid, f.num_seats || 0);
                        obj.furn_id = f.fid.toString();  // Ensure string to match marker fid
                        obj.x = f.x || 0;
                        obj.y = f.y || 0;
                        obj.ftype = f.ftype || 1;
                        obj.degree_offset = f.degree_offset || 0;
                        obj.seat_places = []; // Initialize empty seat places for survey
                        obj.area_id = f.area_id || null;
                        obj.totalOccupants = 0; // Initialize for survey
                        obj.whiteboard = []; // Initialize whiteboard array
                        surveyItems.push(obj);
                        console.log('Created survey furniture object:', obj);
                    }
                }
            } else if(typeof furnData === 'object') {
                // Handle case where furnData is an object with numeric keys
                for(let idx in furnData){
                    let f = furnData[idx];
                    if(f && f.fid) {
                        let obj = new Furniture(f.fid, f.num_seats || 0);
                        obj.furn_id = f.fid.toString();  // Ensure string to match marker fid
                        obj.x = f.x || 0;
                        obj.y = f.y || 0;
                        obj.ftype = f.ftype || 1;
                        obj.degree_offset = f.degree_offset || 0;
                        obj.seat_places = []; // Initialize empty seat places for survey
                        obj.area_id = f.area_id || null;
                        obj.totalOccupants = 0; // Initialize for survey
                        obj.whiteboard = []; // Initialize whiteboard array
                        surveyItems.push(obj);
                        console.log('Created survey furniture object:', obj);
                    }
                }
            }
            
            console.log("Survey items prepared:", surveyItems);
            
            // 3) populate the furnMap for survey popup functionality
            furnMap.clear();
            surveyItems.forEach(item => {
                furnMap.set(item.furn_id, item); // Both are now strings
                console.log('Added to furnMap:', item.furn_id, item);
            });
            
            // 4) display furniture in survey mode
            display_survey(surveyItems);
        }
        else if(isSurvey === true){
            console.log("Loading saved survey data for floor:", sfloor);
            console.log("sfloorName:", sfloorName);
            console.log("global.survey structure:", global.survey);
            
            let surveydata = global.survey[sfloor];
            console.log("surveydata for floor", sfloor, ":", surveydata);
            
            let surveyareadata = global.survey[4][1][1][sfloorName];
            console.log("surveyareadata:", surveyareadata);
            
            if(!surveydata) {
                console.error("No survey data found for floor", sfloor);
                return;
            }
            
            SurveyStartTime = global.survey[5][1]["Time Start"];
            SurveyEndTime = global.survey[6][1]["Time End"];
            let floor = surveydata[1];
            let surv_array = [];

            areaMap.clear();
            for(i in surveyareadata){
                let cur_area_data = surveyareadata[i];
                let new_area = new Area(i, cur_area_data["facilities_id"], cur_area_data["name"]);
                let points = surveyareadata[i].points;
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
                polyItem.addTo(surveyAreaLayer);
                
            }

            for(i in floor){

                let s_array = surveydata[1][i];

                for(j in s_array){
                    let furn = new Furniture(s_array[j].furn_id, s_array[j].num_seats);
                    furn.furn_id = s_array[j].furn_id.toString(); // Ensure string to match marker fid
                    furn.x = s_array[j].x;
                    furn.y = s_array[j].y;
                    furn.ftype = s_array[j].ftype;
                    furn.seat_places = s_array[j].seat_places;
                    furn.degree_offset = s_array[j].degree_offset;
                    furn.area_id = s_array[j].area_id;

                    surv_array.push(furn);
                }
            }

            // Populate furnMap for survey popup functionality
            furnMap.clear();
            surv_array.forEach(item => {
                furnMap.set(item.furn_id, item);
                console.log('Added to furnMap for survey:', item.furn_id, item);
            });

            display_survey(surv_array);
        }
        else if(isLayoutEdit === true){
            console.log("Layout edit branch: sfloorName=Floor "+sfloor);
            const floorKey = "Floor " + sfloor;
            const areasObj = (global.layout && global.layout.Areas) || {};
            const areaDataLog = areasObj[floorKey] || {};
            console.log("Areas data:", areaDataLog);
            const furnDataLog = (global.layout && global.layout[floorKey]) || [];
            console.log("Furniture data:", furnDataLog);
            areaMap.clear();
                furnMap.clear();
                if(drawnItems) mymap.removeLayer(drawnItems);
                drawnItems = new L.layerGroup().addTo(mymap);

                // 2) draw saved Areas
                let sfloorName = floorKey;
                let areaData = areasObj[sfloorName] || {};
        for (let aKey in areaData) {
            let a = areaData[aKey];
            let areaObj = new Area(aKey, a.facilities_id, a.name);
            // a.points is an object; iterate its keys
            for (let ptKey in a.points) {
                let pt = a.points[ptKey];
                areaObj.area_vertices.push(new AreaVertices(pt.v_x, pt.v_y));
            }
            let poly = drawArea(areaObj);
            areaObj.polyArea = poly;
            areaMap.set(aKey, areaObj);
            poly.addTo(drawnItems);
        }

                // 3) draw saved furniture
                let furnData = (global.layout && global.layout[sfloorName]) || [];
                let layoutItems = [];
                for(let idx in furnData){
                    let f = furnData[idx];
                    let obj = new Furniture(f.fid, f.num_seats);
                    obj.x = f.x;
                    obj.y = f.y;
                    obj.ftype = f.ftype;
                    obj.degree_offset = f.degree_offset;
                    layoutItems.push(obj);
                }
                build_layout_markers(layoutItems);

                mymap.invalidateSize();
        }
        else{
            let floordata = global.layout[sfloor][1];
            let areadata = global.layout[4][1][sfloorName];
            let furn_array = [];

            for(i in areadata){
                let cur_area_data = areadata[i];
                let new_area = new Area(i, cur_area_data["facilities_id"], cur_area_data["name"]);
                let points = areadata[i].points;
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

            //Build Furniture map from data to build markers
            for(i in floordata){
                let furn = new Furniture(floordata[i].fid, floordata[i].num_seats);
                furn.x = floordata[i].x;
                furn.y = floordata[i].y;
                furn.ftype = floordata[i].ftype;
                furn.degree_offset = floordata[i].degree_offset;
                areaMap.forEach(function(jtem, jkey, mapObj){
                
                    if(isMarkerInsidePolygon(furn.y, furn.x, jtem.polyArea)){
                        furn.area_id = jtem.area_id;
                    }
                });

                furn_array.push(furn);
            }
            
            
            build_markers(furn_array);
        }
        
    }
    else{
        console.log("Image Failed to Load");
    }

    mymap.on('zoomend', function() {
        var markerSize;
        //resize the markers depending on zoomlevel so they appear to scale
        //zoom is limited to 0-4
        switch(mymap.getZoom()){
            case 0: markerSize= 5; break;
            case 1: markerSize= 10; break;
            case 2: markerSize= 20; break;
            case 3: markerSize= 40; break;
            case 4: markerSize= 80; break;
        }
        var newzoom = '' + (markerSize) +'px';
        var newLargeZoom = '' + (markerSize*1.5) +'px';
        var newLongWidth = '' + (markerSize*4) +'px';

        $('.furnitureIcon').css({'width':newzoom,'height':newzoom});
        $('.furnitureLargeIcon').css({'width':newLargeZoom,'height':newLargeZoom});
        $('.furnitureLongIcon').css({'width':newLargeZoom,'height':newLongWidth});
    });

}

function drawArea(area){
    var verts = [];

    for(var i=0; i < area.area_vertices.length; i++){
        area_verts = area.area_vertices[i];
        verts.push([area_verts.x,area_verts.y]);
    }
    var poly = L.polygon(verts);
    if(isLayoutEdit === false){
        poly.bindPopup(area.area_name);
    }
    

    return poly;
}

function isMarkerInsidePolygon(x,y, poly) {
    var inside = false;
    for (var ii=0;ii<poly.getLatLngs().length;ii++){
        var polyPoints = poly.getLatLngs()[ii];
        for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
            var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
    }

    return inside;
}

function updateHelper(){
    var outString="";
    
    furnMap.forEach(function(item, key, mapObj){
        aid = "TBD";
        x = item.x;
        y = item.y;
        areaMap.forEach(function(jtem, jkey, mapObj){
                
            if(isMarkerInsidePolygon(y, x, jtem.polyArea)){
                aid = jtem.area_id;
            }
        });
        if(area_id !== "TBD"){
            item.in_area = aid;
        }
        outString+= updateFurn(item);
        outString+="\n";
    });
}