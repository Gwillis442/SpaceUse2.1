// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

//Path for the image of the floor
const {ipcRenderer} = require('electron');
const global = require('./global.js');
var L = require('leaflet');
const { selectors } = require('sizzle');


//Form References
const getNameForm = document.getElementById('ipcNameForm');

//Div References
const home = document.getElementById('home');
const floorSelect = document.getElementById('floorSelect');
const surveyFloorSelect = document.getElementById('surveyFloorSelect');
const mapView = document.getElementById('mapView');
const multimenu = document.getElementById('msurveySelect');
const msurveyFloorSelect = document.getElementById('msurveyFloorSelect');
const layoutMenu = document.getElementById('LayoutMenu');

//Button References
const backBtn = document.getElementById('backBtn');
const surveyBtn = document.getElementById('surveyBtn');
const saveFloor = document.getElementById('saveFloor');
const saveLayFloor = document.getElementById('saveLayFloor');
const saveSurvey = document.getElementById('saveSurvey');
const loadSurvey = document.getElementById('loadSurveyBtn');
const showMultiSurvey = document.getElementById('loadMultipleSurvey');
const msurvey = document.getElementById('msurvey');
const dsurvey = document.getElementById('dsurvey');
const saveLay = document.getElementById('saveLayout');
const loadLayout = document.getElementById('loadSavedLayout');
const laySubmitBtn = document.getElementById('laySubmitFloor');
const layFloorSelect = document.getElementById('layfloor');

//Layout Builder Button references
const layoutBuilder = document.getElementById('layoutBuilder');
const getImage = document.getElementById('getImage');



//Process Surveyors Name
getNameForm.addEventListener('submit', function (event){
    event.preventDefault() // stop the form from submitting
    let firstname = document.getElementById("fname").value;
    let lastname = document.getElementById("lname").value;
    let sname = firstname + " " + lastname;
    ipcRenderer.send('toMain', sname);
    getNameForm.style.display = "none";
    home.style.display = 'block';
});

//Functionality for Buttons
backBtn.addEventListener('click',()=>{
    ipcRenderer.send('back-to-previous');
    home.style.display = "none";
    mapView.style.display = "none";
    floorSelect.style.display = "none";
    surveyFloorSelect.style.display = "none";
    msurveyFloorSelect.style.display = "none";
    multimenu.style.display = "none";
    layoutMenu.style.display = "none";
    surveyBtn.disabled = false;
    loadSurvey.disabled = false;
    showMultiSurvey.disabled = false;
    layoutBuilder.disabled = false;
    getNameForm.style.display = "block";
    document.getElementById("surveyData").style.display = "none";
    isSurvey = false;
    isMulti = false;
});

surveyBtn.addEventListener('click',()=>{
    //Load Layout from here
    ipcRenderer.send('LoadLayout');
    
});

loadSurvey.addEventListener('click',()=>{
    ipcRenderer.send('LoadSurvey');
    
});

ipcRenderer.on('LoadSurveySuccess', function(event, data){
    global.survey = data;
    //process Survey data here from csv to JSON
    surveyFloorSelect.style.display = "block";
    surveyBtn.disabled = true;
    showMultiSurvey.disabled = true;
    layoutBuilder.disabled = true;
});

function loadAreas(){
    ipcRenderer.send('LoadArea');
}

ipcRenderer.on('LoadAreasSuccess', function(event, data){
    addAreas(data);
})

//Render Functions for Multi Survey
showMultiSurvey.addEventListener('click',()=>{
    surveyBtn.disabled = true;
    dsurvey.disabled = true;
    layoutBuilder.disabled = true;
    multimenu.style.display = "block";
});

msurvey.addEventListener('click', ()=>{
    //determine if the user selected multi or directory
    //call loadMultipleSurvey passing the upload type
    ipcRenderer.send('LoadMultipleSurvey');
});

dsurvey.addEventListener('click', ()=>{
    //determine if the user selected multi or directory
    //call loadMultipleSurvey passing the upload type
    ipcRenderer.send('LoadDirectory');
});

//Functions for Rendering Custom Layout
layoutBuilder.addEventListener('click', ()=>{
    layoutMenu.style.display = "block";
    getImage.disabled = true;
    surveyBtn.disabled = true;
    loadSurvey.disabled = true;
    showMultiSurvey.disabled = true;
    drawArea.disabled = true;
    ipcRenderer.send('layoutCreate');
});

ipcRenderer.on('LoadDirectorySurveySuccess', function(event, data){
    global.survey = data;
    surveyBtn.disabled = true;
    loadSurvey.disabled = true;
    layoutBuilder.disabled = true;
    msurveyFloorSelect.style.display = "block";
    
});

ipcRenderer.on('LoadMultiSurveySuccess', function(event, data){
    global.survey = data;
    surveyBtn.disabled = true;
    loadSurvey.disabled = true;
    layoutBuilder.disabled = true;
    msurveyFloorSelect.style.display = "block";
});


ipcRenderer.on('LoadLayoutSuccess', function(event, data){
    // convert array of entries into layout object for builder
    global.layout = Object.fromEntries(data);
    // ensure Areas exists to avoid undefined errors
    if (!global.layout.Areas) global.layout.Areas = {};
    ["Floor 1","Floor 2","Floor 3"].forEach(f => {
        if (!global.layout.Areas[f]) global.layout.Areas[f] = {};
    });
    //process layout data here from csv to JSON
    floorSelect.style.display = "block";
    loadSurvey.disabled = true;
    layoutBuilder.disabled = true;
    showMultiSurvey.disabled = true;
});

//Disable Submit Survey Button by Default.
//Enable Button after saving first floor to data
// send a serializable array of [key, value] pairs instead of the Map itself
saveFloor.addEventListener('click', () => {
    // convert Map to plain object for IPC
    const floorObj = Object.fromEntries(furnMap);
    ipcRenderer.send('SaveFurniture', floorObj, sfloor);
    alert('Floor ' + sfloor + ' saved!');
});

saveLayFloor.addEventListener('click', ()=>{
        // convert Map to serializable entries array for IPC (only plain data)
        const layoutEntries = Array.from(furnMap.entries()).map(([key, value]) => {
            // only include primitive properties needed for layout
            return [key, {
                furn_id: value.furn_id,
                num_seats: value.num_seats,
                x: value.x,
                y: value.y,
                ftype: value.ftype,
                degree_offset: value.degree_offset
            }];
        });
        ipcRenderer.send('SaveLayoutFloor', layoutEntries, sfloor);
    alert('Floor ' + sfloor + ' layout saved!');
});


saveLay.addEventListener('click', function (event){
    alert('Saving Layout?');
    ipcRenderer.send('SaveLayout');
});

saveSurvey.addEventListener('click', ()=>{
    ipcRenderer.send('SaveSurvey');
});

ipcRenderer.on('SaveSuccess', ()=>{
    alert('File Saved');
    home.style.display = "none";
    mapView.style.display = "none";
    floorSelect.style.display = "none";
    surveyFloorSelect.style.display = "none";
    multimenu.style.display = "none";
    layoutMenu.style.display = "none";
    getNameForm.style.display = "block";
    loadSurvey.disabled = false;
    surveyBtn.disabled = false;
    showMultiSurvey.disabled = false;
    layoutBuilder.disabled = false;
    isMulti = false;
    isSurvey = false;
});

// Load an existing layout for editing
loadSavedLayout.addEventListener('click', ()=>{
    ipcRenderer.send('LoadLayout');
});

// Handle layout load and prepare builder
ipcRenderer.on('LoadLayoutSuccess', (event, data) => {
  // reconstruct layout object from entries
  global.layout = Object.fromEntries(data);
  // ensure Areas object exists per floor
  if (!global.layout.Areas) global.layout.Areas = {};
  ['Floor 1','Floor 2','Floor 3'].forEach(f => {
    if (!global.layout.Areas[f]) global.layout.Areas[f] = {};
  });
  // hide non-layout menus
  home.style.display               = 'none';
  floorSelect.style.display        = 'none';
  surveyFloorSelect.style.display  = 'none';
  multimenu.style.display          = 'none';
  msurveyFloorSelect.style.display = 'none';
  // show layout builder menu
  layoutMenu.style.display         = 'block';
});

laySubmitBtn.addEventListener('click', () => {
  // 1) show the map view
  mapView.style.display        = 'block';

  // 2) set the globals and redraw in layout-edit mode
  window.sfloor       = parseInt(layFloorSelect.value, 10);
  window.isLayoutEdit = true;
  addMapPic();
});











