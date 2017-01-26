'use strict';
let mapLoad= require('./mapload.js');
let RegionalCenter = require('./regionalCenter.js');
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
