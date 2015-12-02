'use strict';

angular.module('cbApp')
  .service('parse', function ($q) {
   return {
   		saveObject:function(object,data){
   			console.log(object,data);
   			var tmpobj = Parse.Object.extend(object);
		   	var testObject = new tmpobj();
			return testObject.save({"coordinates":[]})

   		},
   		getObjects:function(object){
   			var tmpobj = Parse.Object.extend(object);
   			var testObject = new tmpobj();
   			return testObject.fetch();
   		},
   		addObjects:function(object,data){
   				var tmpobj = Parse.Object.extend(object);
		   		var testObject = new tmpobj();
		   		testObject.add("coordinates",data)
		   		return testObject.save();
   		}
   };
  });
