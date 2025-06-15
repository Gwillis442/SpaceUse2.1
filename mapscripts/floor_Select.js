

async function populateFloorSelect(selectId) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) return;
  
  const response = await fetch('./data/floorplans.json');
  const floors = await response.json();

  selectElement.innerHTML = '';
  if(selectId === "layoutFloor"){
    const placeholderOption = document.createElement("option");
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a Floor';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    selectElement.appendChild(placeholderOption);
  }

  floors.forEach(floors => {
    const option = document.createElement("option");
    option.value = floors.image;
    option.textContent = floors.name;
    option.setAttribute('data-id', floors.id);
    selectElement.appendChild(option);
  });
}


// This script populates a select dropdown with floor options for Survey view
document.addEventListener("DOMContentLoaded", async () => {
  populateFloorSelect("floor");
  populateFloorSelect("surveyFloor");
  populateFloorSelect("msurveyFloor");
  populateFloorSelect("layoutFloor");
});