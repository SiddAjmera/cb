'use strict';

angular.module('cbApp')
  .service('staticData', ['httpRequest', function (httpRequest) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    return{
    	getTCSLocations:function(){
	        var tcsLocations = [
					{
						"display_address":"TCS Sahyadri Park",
						"formatted_address": "Sahyadri Park, Plot No. 2 & 3, Rajiv Gandhi Infotech Park, Phase-III,, Hinjewadi, Pune, Maharashtra 411057, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
					    "location": [73.6829262, 18.5806206],
					    "placeId": "ChIJz2_Fp2XAwjsRf-D83a7sne8"
				    },

					{
						"display_address":"TCS Bhosari",
						"formatted_address": "TCS, Bhosari, Telco Rd, Landewadi, Pimpri, Pimpri-Chinchwad, Maharashtra 411026, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
					    "location": [73.838017, 18.6229641],
					    "placeId": "ChIJkx5xWX64wjsRw2ETFkK2fKk"
					},

					{
						"display_address":"TCS Quadra II",
						"formatted_address": "TATA Consultancy Services, S.No. 238/239, Quadra II, Opp Magarpatta City, Hadapsar, Pune, Maharashtra 411028, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [73.933573, 18.5132302],
					    "placeId": "ChIJjwkMLvXBwjsR_KclVTRIC7M"
					},

					{
						"display_address":"Tata Research Developement and Design Center(TRDDC)",
						"formatted_address": "TRDDC, Hadapsar, Pune, Maharashtra 411013, India",
						"display_address" : "Tata Research Developement and Design Center",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/school-71.png",
					    "location": [73.9166811, 18.511536],
					    "placeId": "ChIJVVVVVeXBwjsRjhAlp31GD18"
					},

					{
						"display_address":"VSNL Training Centre- Pune",
						"formatted_address": "VSNL Training Centre, Dighi, Pune, Maharashtra 411015, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [73.8659042, 18.6053331],
					    "placeId": "ChIJ0zPIrRTHwjsRmAZZGDn6HY0"
					},

					{
						"display_address":"The Quadron Business Park",
						"formatted_address": "The Quadron Business Park, Plot No. 28 Rajiv Gandhi Infotech Park, Phase II, Hinjewadi, Pune, Maharashtra 411057, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [73.6970379, 18.5859733],
					    "placeId": "ChIJ6ykEDQu7wjsRVDBjuDKHtnI"
					},

					{
						"display_address":"CommerZone",
						"formatted_address": "Commerzone IT Park, Yerawada, Pune, Maharashtra 411006, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
					    "location": [73.883805, 18.5602898],
					    "placeId": "ChIJH7PcT9nAwjsRFK4IL60gRjI"
					},

					{
						"display_address":"TCS, Nyati Tiara",
						"formatted_address": "Tata Consultancy Services, Pune Nagar Rd, Blue Hill Society, Yerawada, Pune, Maharashtra 411006, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [73.890797499, 18.5475484],
					    "placeId": "ChIJC1YZpB3BwjsR8nFN2b93NgM"
					},

					{
						"display_address":"Cerebrum IT Park" ,
						"formatted_address": "Cerebrum IT Park, Marigold complex, Kalyani Nagar, Pune, Maharashtra 411014, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
					    "location": [73.9105654, 18.5445986],
					    "placeId": "ChIJG2xMEw3BwjsR5pww7XHk63U"
					},

					{
						"display_address":"CMC LIMITED" ,
						"formatted_address": "CMC-Pune, Elbee House, Dhole Patil Road, Siddharth Path, Pune, Maharashtra 411001, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/school-71.png",
					    "location": [73.8762283, 18.534962],
					    "placeId": "ChIJ47XjtPnAwjsRfl0REV-KQdY"
					},

					{
						"display_address":"Birla AT And T Communications . Ltd",
						"formatted_address": "Koregaon Park Rd, Bund Garden, Sangamvadi, Pune, Maharashtra 411001, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png",
					    "location": [73.8850588, 18.54092559999999],
					    "placeId": "ChIJkap8WPzAwjsRhdgLCXcF0to"
					},

					{
						"display_address":"Mahindra British Telecom Limited",
						"formatted_address": "S. No. 91, CTS No. 11/B/1, 2nd and 3rd Floor, Sharda Center, Erandwane, Pune, Maharashtra 411004, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [73.835775, 18.510174],
					    "placeId": "ChIJZVBZBoy_wjsRVkx2MdDgx9Y"
					},

					{
						"display_address":"TCS PUNE (Millenium)" ,
						"formatted_address": "TCS PUNE (Millenium), Godrej Millenium, Lane Number 7, Vasani Nagar, Koregaon Park, Pune, Maharashtra 411001, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [73.897226, 18.537914],
					    "placeId": "ChIJfZBSjAbBwjsRNADABRxQrJo"
					},

					{
						"display_address":"NAVLAKHA COMP.-PUNE" ,
						"formatted_address": "NAVLAKHA COMP, Bibwewadi Kondhwa Road, Near Jhala Complex, Bibwewadi Kondhwa Road, Pune, Maharashtra 411037, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [73.8754836, 18.4814269],
					    "placeId": "ChIJD00TwpzqwjsRzjNkTr9FcIU"
					},

					/*{
						"display_address":"Pune-Sun Suzlon-NSTP" ,
						"formatted_address": "Pune-Sun Suzlon, 180/1-8, Opposite Magarpatta City,, Hadapsar, Pune, Maharashtra 411028, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [18.5121034, 73.9352588],
					    "placeId": "ChIJqVjgZ_XBwjsR4b3VqX-poDE"
					},

					{"displayAddress":"Pune PSK Sites" ,
						"formatted_address": "Passport Seva Kendra, A1, Koregaon Park Annexe, Mundhwa, Pune, Maharashtra, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
					    "location": [18.5309037, 73.9135919],
					    "placeId": "ChIJrXdkmJ_BwjsRG2vuqY9LP7w"
					},

					{
						"display_address":"Nashik PSK Sites" ,
						"formatted_address": "Nashik Passport Office - Passport Seva Kendra, Shop No 3&4, Ground Floor, Nashik Pune National Highway, Nashik, Maharashtra 422214, India",
					    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/civic_building-71.png",
					    "location": [19.9606742, 73.8285404],
					    "placeId": "ChIJEybtlLLq3TsRWe7D4A8HWn4"
					},

					*/

			];
    		return tcsLocations;
    	}
    }
  }]);
