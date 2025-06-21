const global = require('../global.js');

function getFloorIndex(floorNumber){
    const floorKey = `Floor ${floorNumber}`;

    for(let i = 0; i < global.shared.surveyArray.length; i++){
        if(global.shared.surveyArray[i][floorKey] !== undefined){
            return i;
        }
    }
    return -1;
}

function ensureFloorExists(floorNumber){
    const floorIndex = getFloorIndex(floorNumber);

    if(floorIndex === -1){
        const floorKey = `Floor ${floorNumber}`;
        let floorObj = {};
        floorObj[floorKey] = [];
        global.shared.surveyArray.push(floorObj);
        return global.shared.surveyArray.length - 1;
    }

    return floorIndex;
}

module.exports = {
    ensureFloorExists,
    getFloorIndex
};