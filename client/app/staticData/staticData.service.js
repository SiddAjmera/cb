'use strict';

angular.module('cbApp')
  .service('staticData', function (httpRequest) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    return{
    	getTCSLocations:function(){
        var tcsLocations = [
		{"displayAddress":"SP - A1 - Rajgad",
		"formatted_address": "A1/Rajgad, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.581016, 73.6867767],
	    "placeId": "ChIJV7zgqG27wjsRhlwIyeY5MN8"},
	

		{"displayAddress":"SP - S1 - Poorna", 
		"formatted_address": "S1/Poorna, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.5813442, 73.6848914],
	    "placeId": "ChIJ6UG68Gy7wjsRs4AJ2njAyHc"},
	

		{"displayAddress":"SP - S2 - Torna", 
		"formatted_address": "S2/Torna, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.5812141, 73.68342],
	    "placeId": "ChIJnzULhmy7wjsRQfjFe8RUMPo"},
	

	{"displayAddress":"SP - S3 - Tikona" ,
		"formatted_address": "S3/Tikona, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.581084, 73.68194849999999],
	    "placeId": "ChIJwZFcd2u7wjsRN18GfUsT8sc"
	},

	{"displayAddress":"Bhosari MIDC Non STP" ,
		"formatted_address": "TCS, Bhosari, Telco Rd, Landewadi, Pimpri, Pimpri-Chinchwad, Maharashtra 411026, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.6229641, 73.838017],
	    "placeId": "ChIJkx5xWX64wjsRw2ETFkK2fKk"
	},

	{"displayAddress":"Bhosari MIDC STP" ,
		"formatted_address": "TCS, Bhosari, Telco Rd, Landewadi, Pimpri, Pimpri-Chinchwad, Maharashtra 411026, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.6229641, 73.838017],
	    "placeId": "ChIJkx5xWX64wjsRw2ETFkK2fKk"
	},

	{"displayAddress":"Sp-S1-Poorna-BPO" ,
		"formatted_address": "S1/Poorna, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.5813442, 73.6848914],
	    "placeId": "ChIJ6UG68Gy7wjsRs4AJ2njAyHc"
	},

	{"displayAddress":"Sp-S2-Torna-BPO" ,
		"formatted_address": "S2/Torna, Phase 3, Hinjewadi Rajiv Gandhi Infotech Park, Hinjawadi, Pimpri-Chinchwad, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.5812141, 73.68342],
	    "placeId": "ChIJnzULhmy7wjsRQfjFe8RUMPo"
	},

	{"displayAddress":"TRDDC HADAPSAR, PUNE" ,
		"formatted_address": "TRDDC, Hadapsar, Pune, Maharashtra 411013, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/school-71.png",
	    "location": [18.511536, 73.9166811],
	    "placeId": "ChIJVVVVVeXBwjsRjhAlp31GD18"
	},

	{"displayAddress":"VSNL - Pune" ,
		"formatted_address": "VSNL Training Centre, Dighi, Pune, Maharashtra 411015, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.6053331, 73.8659042],
	    "placeId": "ChIJ0zPIrRTHwjsRmAZZGDn6HY0"
	},

	{"displayAddress":"SahyadriPark SEZ - I" ,
		"formatted_address": "The Quadron Business Park, Plot No. 28 Rajiv Gandhi Infotech Park, Phase II, Hinjewadi, Pune, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.5859733, 73.6970379],
	    "placeId": "ChIJ6ykEDQu7wjsRVDBjuDKHtnI"
	},

	{"displayAddress":"QBPL -Pune SEZ" ,
		"formatted_address": "The Quadron Business Park, Plot No. 28 Rajiv Gandhi Infotech Park, Phase II, Hinjewadi, Pune, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.5859733, 73.6970379],
	    "placeId": "ChIJ6ykEDQu7wjsRVDBjuDKHtnI"
	},

	{"displayAddress":"Pune(QuadraII) STP" ,
		"formatted_address": "TATA Consultancy Services, S.No. 238/239, Quadra II, Opp Magarpatta City, Hadapsar, Pune, Maharashtra 411028, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.5132302, 73.933573],
	    "placeId": "ChIJjwkMLvXBwjsR_KclVTRIC7M"
	},

	{"displayAddress":"Pune(QuadraII)NonSTP" ,
		"formatted_address": "TATA Consultancy Services, S.No. 238/239, Quadra II, Opp Magarpatta City, Hadapsar, Pune, Maharashtra 411028, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.5132302, 73.933573],
	    "placeId": "ChIJjwkMLvXBwjsR_KclVTRIC7M"
	},

	{"displayAddress":"Pune-Sun Suzlon-NSTP" ,
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

	{"displayAddress":"Pune - Commerzone" ,
		"formatted_address": "Commerzone IT Park, Yerawada, Pune, Maharashtra 411006, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.5602898, 73.883805],
	    "placeId": "ChIJH7PcT9nAwjsRFK4IL60gRjI"
	},

		{"displayAddress":"Nyati Tiara" ,
		"formatted_address": "Tata Consultancy Services, Pune Nagar Rd, Blue Hill Society, Yerawada, Pune, Maharashtra 411006, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.5475484, 73.890797499],
	    "placeId": "ChIJC1YZpB3BwjsR8nFN2b93NgM"
	},

		{"displayAddress":"Nashik PSK Sites" ,
		"formatted_address": "Nashik Passport Office - Passport Seva Kendra, Shop No 3&4, Ground Floor, Nashik Pune National Highway, Nashik, Maharashtra 422214, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/civic_building-71.png",
	    "location": [19.9606742, 73.8285404],
	    "placeId": "ChIJEybtlLLq3TsRWe7D4A8HWn4"
	},

		{"displayAddress":"Cerebrum IT Park" ,
		"formatted_address": "Cerebrum IT Park, Marigold complex, Kalyani Nagar, Pune, Maharashtra 411014, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.5445986, 73.9105654],
	    "placeId": "ChIJG2xMEw3BwjsR5pww7XHk63U"
	},

		{"displayAddress":"CMC-Pune" ,
		"formatted_address": "CMC-Pune, Elbee House, Dhole Patil Road, Siddharth Path, Pune, Maharashtra 411001, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/school-71.png",
	    "location": [18.534962, 73.8762283],
	    "placeId": "ChIJ47XjtPnAwjsRfl0REV-KQdY"
	},

		{"displayAddress":"Millenium Bldg, Pune" ,
		"formatted_address": "TCS PUNE (Millenium), Godrej Millenium, Lane Number 7, Vasani Nagar, Koregaon Park, Pune, Maharashtra 411001, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.537914, 73.897226],
	    "placeId": "ChIJfZBSjAbBwjsRNADABRxQrJo"
	},

	{"displayAddress":"NAVLAKHA COMP.-PUNE" ,
		"formatted_address": "NAVLAKHA COMP, Bibwewadi Kondhwa Road, Near Jhala Complex, Bibwewadi Kondhwa Road, Pune, Maharashtra 411037, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
	    "location": [18.4814269, 73.8754836],
	    "placeId": "ChIJD00TwpzqwjsRzjNkTr9FcIU"
	},

	{"displayAddress":"Pune Sahyadri Park" ,
		"formatted_address": "Sahyadri Park, Plot No. 2 & 3, Rajiv Gandhi Infotech Park, Phase-III, Hinjewadi, Pune, Maharashtra 411057, India",
	    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png",
	    "location": [18.5809591, 73.6868195],
	    "placeId": "ChIJj1VVVcG7wjsRgSABrqya8pA"
	}
];
    		return tcsLocations;
    	}
    }
  });
