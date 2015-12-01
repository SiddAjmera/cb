'use strict';

angular.module('cbApp')
  .service('parse', function ($q) {
   return {
   		saveObject:function(object,data){
   			var tmpobj = Parse.Object.extend(object);
		   	var testObject = new tmpobj();
			return testObject.save(data)

   		}
   };
  });
