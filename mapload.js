'use strict';
let directionsService;
let directionsDisplay;
let marker;
function initializeMap() {
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  let ukraine = new google.maps.LatLng(50.483396, 30.430394);
  let mapCanvas = document.getElementById("map");
  let myCenter = ukraine;
  let mapOptions = {
    center: myCenter, 
    zoom: 5
  }
  let map = new google.maps.Map(mapCanvas, mapOptions);
  directionsDisplay.setMap(map);

  marker = new google.maps.Marker({position:ukraine});
  marker.setMap(map);
  hideMarker();
  
  let input = (document.getElementById("departure"));
  let autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds',map);
  
  autocomplete.addListener('place_changed',function(){
	  hideMarker();
	  
	  directionsDisplay.setDirections({routes: []});
	  routes.elIndexDrawn=-1;
	  
	  let place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Пожалуйста, выберите пункт из списка");
        return;
      }
      
      routes.departurePoint=input.value.split(",")[0];
      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
      }
      map.setZoom(6); 
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
  });
}
var drawDirection = function(lat,lng){
	 directionsService.route({
	    origin: marker.getPosition().lat()+", "+marker.getPosition().lng(),
	    destination: lat+", "+lng,
	    travelMode: google.maps.TravelMode.DRIVING
	  }, function(response, status) {
	    if (status === google.maps.DirectionsStatus.OK) {
	      directionsDisplay.setDirections(response);
	    } else {
	      if(status.localeCompare("ZERO_RESULTS")==0){
	    	  window.alert('Невозможно добраться машиной.');
	      }else{
	    	  window.alert('Маршрут не удалось найти в связи с: ' + status);
	      }
	    }
	  });
}

var hideMarker = () => marker.setVisible(false);
module.exports.drawDirection=drawDirection;
module.exports.hideMarker= hideMarker;
global.initializeMap = initializeMap;