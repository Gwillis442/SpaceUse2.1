

async function populateFloorSelect(selectId) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) {
    console.error(`Select element with ID ${selectId} not found.`);
    return;
  }
  const response = await fetch('./scripts/floorplans.json');
  const floors = await response.json();

  selectElement.innerHTML = '';
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