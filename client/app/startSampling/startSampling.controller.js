'use strict';

angular.module('cbApp')
  .controller('StartSamplingCtrl', function (Auth,$scope, cordovaUtil,$rootScope,localStorage,filterService,httpRequest) {
    $scope.message = 'Hello';
    $scope.buttonText="START SAMPLING";
    $scope.mapEvents={};
    $scope.mapEvents.path= {
                        enable: [ 'click', 'mouseover' ]
                    };
        
    $scope.defaults={minZoom:10, maxZoom:20,tap:true, tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
    $scope.center={
        lat : 18.581904504725568,
        lng : 73.68483066558838,
        zoom: 15
    };
    $scope.$on('leafletDirectivePath.myMap.mousedown', function (event) {
                console.log('Path clicked ',event);
     });
    $scope.setCenter=true;
    $scope.paths={};
    $scope.startOrStopSampling = function(value){
    	if(value == "START SAMPLING"){
    		$scope.buttonText="STOP SAMPLING";
            if(config.cordova)
            cordova.plugins.backgroundMode.enable();
    		cordovaUtil.getCoordinates((new Date()).getTime());
    	}
    	else{
    		$scope.buttonText="START SAMPLING";
             if(config.cordova)
            cordova.plugins.backgroundMode.disable();
    		cordovaUtil.stopSampling();
    	}
    };

    $rootScope.$on("locationCaptured",function(){
         localStorage.retrieve('SavedLocationCoordinates').then(function(locations){
                var storedlocations =JSON.parse(locations);
                if(storedlocations==null)
                    return;
               else{
                var pathArr=[];
                storedlocations.TrackedLocations.forEach(function(obj){
                        pathArr.push( { lat: obj.location.latitude, lng: obj.location.longitude })
                })
                if($scope.setCenter){
                    $scope.center=pathArr[0];
                    $scope.setCenter=false;
                }
               console.log(filterService.filterData(filterService.GDouglasPeucker(pathArr,5),0.5))
                $scope.paths={
                     p1: {
                color: '#008000',
                weight: 8,
                latlngs:filterService.GDouglasPeucker(pathArr,20)
                }

               }
           }
            }) 
    });
/*    var currentUser = Auth.getCurrentUser();
    var getLocations = function(){
        var filterJSON = {};
        filterJSON.userId = currentUser.userId;

        httpRequest.post(config.apis.filterLocations,filterJSON).
        then(function(response) {
             console.log("locations",response);
            if(response.status==200 && response.data.length > 0){

                    var pathArr=[];

                    angular.forEach(response.data, function(location, key){
                        pathArr.push({lat:location.location.latitude,lng:location.location.longitude});

                    });
                    console.log("pathArr",pathArr)
                    if($scope.setCenter){
                            $scope.center=pathArr[0];
                            $scope.setCenter=false;
                    }
                     $scope.paths={
                             p1: {
                        color: '#008000',
                        weight: 8,
                        latlngs:filterService.filterData(filterService.GDouglasPeucker(pathArr,5),0.5)
                        }

                       }
            console.log("filtered data",filterService.filterData(filterService.GDouglasPeucker(pathArr,5),0.5));
            }
           

        })    
        
    }*/
   // getLocations();
/*    $scope.filterData=function(pathArr,threshold){
        var curr,prev;
        var resultArr=[];
        for(var i=0;i<pathArr.length;i++){
            curr=pathArr[i];
            if(prev){
            var p1={
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [curr.lng, curr.lat]
            }
            }
             var p2={
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [prev.lng, prev.lat]
            }
            }
            
            var distance = turf.distance(p1, p2);
            if(distance<threshold)
            {
                resultArr.push(curr);
            }
            }
            prev=curr;
        }
        return resultArr;
    }*/
  /*  $scope.GDouglasPeucker=function(source, kink)
 source[] Input coordinates in GLatLngs 	*/
/* kink	in metres, kinks above this depth kept  */
/* kink depth is the height of the triangle abc where a-b and b-c are two consecutive line segments 
{
    var	n_source, n_stack, n_dest, start, end, i, sig;    
    var dev_sqr, max_dev_sqr, band_sqr;
    var x12, y12, d12, x13, y13, d13, x23, y23, d23;
    var F = ((Math.PI / 180.0) * 0.5 );
    var index = new Array(); /* aray of indexes of source points to include in the reduced line 
	var sig_start = new Array(); /* indices of start & end of working section 
    var sig_end = new Array();	

    /* check for simple cases 

    if ( source.length < 3 ) 
        return(source);    /* one or two points 

    /* more complex case. initialize stack 
		
	n_source = source.length;
    band_sqr = kink * 360.0 / (2.0 * Math.PI * 6378137.0);	/* Now in degrees 
    band_sqr *= band_sqr;
    n_dest = 0;
    sig_start[0] = 0;
    sig_end[0] = n_source-1;
    n_stack = 1;

    /* while the stack is not empty  ... 
    while ( n_stack > 0 ){
    
        /* ... pop the top-most entries off the stacks 

        start = sig_start[n_stack-1];
        end = sig_end[n_stack-1];
        n_stack--;

        if ( (end - start) > 1 ){  /* any intermediate points ?        
                    
                /* ... yes, so find most deviant intermediate point to
                       either side of line joining start & end points                                   
            
            x12 = (source[end].lng - source[start].lng);
            y12 = (source[end].lat - source[start].lat);
            if (Math.abs(x12) > 180.0) 
                x12 = 360.0 - Math.abs(x12);
            x12 *= Math.cos(F * (source[end].lat + source[start].lat));/* use avg lat to reduce lng 
            d12 = (x12*x12) + (y12*y12);

            for ( i = start + 1, sig = start, max_dev_sqr = -1.0; i < end; i++ ){                                    

                x13 = (source[i].lng - source[start].lng);
                y13 = (source[i].lat - source[start].lat);
                if (Math.abs(x13) > 180.0) 
                    x13 = 360.0 - Math.abs(x13);
                x13 *= Math.cos (F * (source[i].lat + source[start].lat));
                d13 = (x13*x13) + (y13*y13);

                x23 = (source[i].lng - source[end].lng);
                y23 = (source[i].lat - source[end].lat);
                if (Math.abs(x23) > 180.0) 
                    x23 = 360.0 - Math.abs(x23);
                x23 *= Math.cos(F * (source[i].lat + source[end].lat));
                d23 = (x23*x23) + (y23*y23);
                                
                if ( d13 >= ( d12 + d23 ) )
                    dev_sqr = d23;
                else if ( d23 >= ( d12 + d13 ) )
                    dev_sqr = d13;
                else
                    dev_sqr = (x13 * y12 - y13 * x12) * (x13 * y12 - y13 * x12) / d12;// solve triangle

                if ( dev_sqr > max_dev_sqr  ){
                    sig = i;
                    max_dev_sqr = dev_sqr;
                }
            }

            if ( max_dev_sqr < band_sqr ){   /* is there a sig. intermediate point ? */
                /* ... no, so transfer current start point 
                index[n_dest] = start;
                n_dest++;
            }
            else{
                /* ... yes, so push two sub-sections on stack for further processing 
                n_stack++;
                sig_start[n_stack-1] = sig;
                sig_end[n_stack-1] = end;
                n_stack++;
                sig_start[n_stack-1] = start;
                sig_end[n_stack-1] = sig;
            }
        }
        else{
                /* ... no intermediate points, so transfer current start point 
                index[n_dest] = start;
                n_dest++;
        }
    }

    /* transfer last point 
    index[n_dest] = n_source-1;
    n_dest++;

    /* make return array 
    var r = new Array();
    for(var i=0; i < n_dest; i++)
        r.push(source[index[i]]);
    return r;
    
}*/
});