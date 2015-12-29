'use strict';

angular.module('cbApp')
  .service('localStorage', ['$localForage',function ($localForage) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    
    return{

    	isInitialized:function(){
             var that = this;
    		 return that.retrieve('init').
                     then(function(item){
                        console.log("item",item);
                        return item;
                     });
    	},
    	initialize:function(){
            var that = this;
    		that.store('init',true);
    	},
        store:function(key,item){
            return $localForage.setItem(key,item);
        },
        retrieve:function(key){
            return $localForage.getItem(key);
        },
        remove:function(key){
            return $localForage.removeItem(key);
        }
    }

  }]);
