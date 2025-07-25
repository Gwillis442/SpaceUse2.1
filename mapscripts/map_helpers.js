
/*Basic Helper Functions for interacting with Maps*/
var L = require('leaflet');
function getFurnMap(){
    return furnMap;
}

function getActivityMap(){
    return activityMap;
}

function getWhiteboardActivityMap(){
    return wb_activityMap;
}



//This file extends Marker to contain furniture information
//and extend Icon class to create new icons for each piece of furniture
//contains function to return selected icon type based on furniture type
//This file also holds the size of the markers and initial anchorpoints before resizing.
var height;
var width;
var selectedIcon;

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

//extend Icon for each different furniture icon
var CircTableIcon = L.Icon.extend({
    options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/circ_table.svg',
		iconSize: [10, 10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
    }
});

var circTable = new CircTableIcon();

var CircTableIconSmall = L.Icon.extend({
    options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/circ_table.svg',
		iconSize: [10, 10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
    }
});

var circTableS = new CircTableIconSmall();

var CouchThreeIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/couch_three.svg',
		iconSize: [10, 10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var couchThree = new CouchThreeIcon();

var CouchFourIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/couch_four.svg',
		iconSize: [10, 10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var couchFour = new CouchFourIcon();

var ComputerStationIcon = L.Icon.extend({
	//this is called square_table in drive folder
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/square_table.svg',
		iconSize: [10,10],
		iconAnchor: [2.5,2.5],
		popupAnchor: [2.5,2.5]
	}
});

var computerStation = new ComputerStationIcon();

var ComputerStationLargeIcon = L.Icon.extend({
	//this is called square_table in drive folder
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/square_table.svg',
		iconSize: [20,20],
		iconAnchor: [2.5,2.5],
		popupAnchor: [2.5,2.5]
	}
});

var computerStationLarge = new ComputerStationLargeIcon();

var CollabStationIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		rotationAngle: 180,
		iconUrl: './images/icons/collab_station.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var collabStation = new CollabStationIcon();

var CouchCurvedIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/couch_curved.svg',
		iconSize: [10, 10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var couchCurved = new CouchCurvedIcon();

var CouchSixIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/couch_six.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var couchSix = new CouchSixIcon();

var CouchTwoIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/couch_two.svg',
		iconSize: [10, 10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var couchTwo = new CouchTwoIcon();

var CounterCurvedIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/counter_curved.png',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var counterCurved = new CounterCurvedIcon();

var FitDeskEmptyIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/fit_desk_empty.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var fitDeskEmpty = new FitDeskEmptyIcon();

var FitDeskFilledIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/fit_desk_filled.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var fitDeskFilled = new FitDeskFilledIcon();

var MedCornerEmptyIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/med_corner_empty.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var medCornerEmpty = new MedCornerEmptyIcon();

var MedCornerFilledIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/med_corner_filled.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var medCornerFilled = new MedCornerFilledIcon();

var MfReaderEmptyIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/mf_reader_empty.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var mfReaderEmpty = new MfReaderEmptyIcon();

var MfReaderFilledIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/mf_reader_filled.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var mfReaderFilled = new MfReaderFilledIcon();

var RectTableIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/rect_table.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var rectTable = new RectTableIcon();

var RectTableIconlong = L.Icon.extend({
	options: {
		className: 'furnitureLongIcon',
		iconUrl: './images/icons/rect_table.svg',
		iconSize: [10,30],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var rectTableLong = new RectTableIconlong();

var RoomIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/room.png',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var roomIcon = new RoomIcon();

var SeatEmptyIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/seat_empty.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var seatEmpty = new SeatEmptyIcon();

var SeatFilledIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/seat_filled.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var seatFilled = new SeatFilledIcon();

var SeatOneSoftIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/seat_one_soft.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var seatOneSoft = new SeatOneSoftIcon();

var SeatOneIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/seat_one.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var seatOne = new SeatOneIcon();

var StudyFourIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/study_four.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var studyFour = new StudyFourIcon();

var StudyOneIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/study_one.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var studyOne = new StudyOneIcon();

var StudyThreeIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/study_three.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var studyThree = new StudyThreeIcon();

var StudyTwoIcon = L.Icon.extend({
	options: {
		className: 'furnitureLargeIcon',
		iconUrl: './images/icons/study_two.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});



var studyTwo = new StudyTwoIcon();

var VidViewerEmptyIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/vid_viewer_empty.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var vidViewerEmpty = new VidViewerEmptyIcon();

var VidViewerFilledIcon = L.Icon.extend({
	options: {
		className: 'furnitureIcon',
		iconUrl: './images/icons/vid_viewer_filled.svg',
		iconSize: [10,10],
		iconAnchor: [5,5],
		popupAnchor: [5,5]
	}
});

var vidViewerFilled = new VidViewerFilledIcon();

//return the icon type based on furniture typefunction
//takes an int
//returns Icon object

function getIconObj(furniture_type) {
  const item = furnitureData.find(d => d.ftype === furniture_type);
  if (!item) {
    // fallback icon
    return L.icon({
      iconUrl: './images/icons/room.png',
      iconSize: [10,10],
      iconAnchor: [5,5],
      popupAnchor: [5,5]
    });
  }
  return L.icon({
    iconUrl:     item.image,
    iconSize:    item.iconSize,
    iconAnchor:  item.iconAnchor,
    popupAnchor: item.popupAnchor,
    className:   item.className
  });
}

module.exports = {
  getIconObj,
  getFurnMap,
  getActivityMap,
  getWhiteboardActivityMap
};