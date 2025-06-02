document.addEventListener("DOMContentLoaded", () =>{
    const floors = ["Floor 1", "Floor 2", "Floor 3", "Floor 4"];
    const selectElement = document.getElementById("floor");

    floors.forEach((floor, index) => {
      const option = document.createElement("option");
      option.value = index + 1;
      option.textContent = floor;
      selectElement.appendChild(option);
    });
    });