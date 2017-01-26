/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	let mapLoad= __webpack_require__(1);
	let RegionalCenter = __webpack_require__(2);
	let routes = new Vue({
		el:'#routes',
		data:{
			cities:[],
			departurePoint:"",
			elIndexDrawn:-1
		},
		components:{
			'route':{
				props:['finishPoint','departurePoint'],
				template:'\
					<li>\
					<a href="#" v-on:click="$emit(\'draw\')" >\
					из {{departurePoint}} в {{finishPoint}}\
					</a>\
					</li>',
			}
		},
		computed:{
			departurePChoosed:function(){
				return (this.departurePoint.trim()=="")?false:true;
			}
		},
		methods:{
			drawRoute:function(index){
				if(this.elIndexDrawn===-1){
					mapLoad.hideMarker();
				}
				this.elIndexDrawn = index;
				let destinationCity=this.cities[index];
				mapLoad.drawDirection(destinationCity.lat,destinationCity.lng);
			}
		},
		created:function(){
			  let self=this;
			  loadRegionalCenters().then(
		        response => {
		        	for(let city of response){
		    			let regCenter = new RegionalCenter(city.title,city.lat,city.lng);
		    			self.cities.push(regCenter);
		    		}
		        },
		        error => alert(`${error}`)
			  );
			  
		}
	});
	
	function loadRegionalCenters(){
	  return new Promise(function(resolve,reject){
		  const url = 'http://test.bitmark.com.ua/route';
		  const xhr = createCORSRequest('GET', url);
		  if (!xhr) {
		    reject(new Error('CORS не поддерживается'));
		  }
		  
		  // Response handlers.
		  xhr.onload = function() {
			if(this.status == 200){
			  let response = JSON.parse(this.responseText);
			  let cities = response.data.cities;
			  resolve(cities);
			}else{
			  var error = new Error(this.statusText);
			  error.code = this.status;
			  reject(error);
			}
		  };
		
		  xhr.onerror = function() {
			  reject(new Error('Произошла ошибка при выполнение запроса на получение региональных центров'));
		  };
		
		  xhr.send();
	  });
	}
	function createCORSRequest(method, url) {
	  let xhr = new XMLHttpRequest();
	  if ("withCredentials" in xhr) {
	    // XHR for Chrome/Firefox/Opera/Safari.
	    xhr.open(method, url, true);
	  } else if (typeof XDomainRequest != "undefined") {
	    // XDomainRequest for IE.
	    xhr = new XDomainRequest();
	    xhr.open(method, url);
	  } else {
	    // CORS not supported.
	    xhr = null;
	  }
	  return xhr;
	};
	
	global.routes=routes
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
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
	  marker.setVisible(false);
	  
	  let input = (document.getElementById("departure"));
	  let autocomplete = new google.maps.places.Autocomplete(input);
	  autocomplete.bindTo('bounds',map);
	  
	  autocomplete.addListener('place_changed',function(){
		  marker.setVisible(false);
		  
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
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	class RegionalCenter{
		constructor(title,lat,lng){
			this.title=title;
			this.lat=lat;
			this.lng=lng;
		}
	};
	
	module.exports=RegionalCenter

/***/ }
/******/ ]);
//# sourceMappingURL=build.js.map