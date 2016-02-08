var restaurantLayer;
var baseLayer;
var mrtLayer;
var districtLayer;
var transportLayer;

var southWest = L.latLng(1.201023, 103.597500),
    northEast = L.latLng(1.490837, 104.067218),
    bounds = L.latLngBounds(southWest, northEast);

var map = L.map('map', {
    maxBounds: bounds,
    maxZoom: 16,
    minZoom: 10
});

// zoom the map to that bounding box
map.fitBounds(bounds);



// ==locatecontrol

map.locate({
    setView: true,
    maxZoom: 16
});

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

L.control.locate({
    position: 'topright', // set the location of the control
    drawCircle: true, // controls whether a circle is drawn that shows the uncertainty about the location
    follow: false, // follow the user's location
    setView: true, // automatically sets the map view to the user's location, enabled if `follow` is true
    stopFollowingOnDrag: false, // stop following when the map is dragged if `follow` is true (deprecated, see below)
    circleStyle: {}, // change the style of the circle around the user's location
    markerStyle: {},
    followCircleStyle: {}, // set difference for the style of the circle around the user's location while following
    followMarkerStyle: {},
    circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
    metric: true, // use metric or imperial units
    onLocationError: function(err) {
        alert(err.message)
    }, // define an error callback function
    onLocationOutsideMapBounds: function(context) { // called when outside map boundaries
        alert(context.options.strings.outsideMapBoundsMsg);
    },
    strings: {
        title: "Show me where I am", // title of the locat control
        popup: "You are within {distance} {unit} from this point", // text to appear if user clicks on circle
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
    },
    locateOptions: {} // define location options e.g enableHighAccuracy: true
}).addTo(map);


// == two base maps

baseLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

}).addTo(map);



transportLayer = L.tileLayer('http://{s}.tile.opencyclemap.org/transport/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});





// == singapore district map

function getColor(d) {

    return d > 60 ? '#b10026' :
        d > 50 ? '#e31a1c' :
        d > 40 ? '#fc4e2a' :
        d > 30 ? '#fd8d3c' :
        d > 20 ? '#feb24c' :
        d > 10 ? '#fed976' :
        '#ffffb2';

}

function getColor_another(d) {

    return d > 60 ? '#b10026' :
        d > 50 ? '#e31a1c' :
        d > 40 ? '#fc4e2a' :
        d > 30 ? '#fd8d3c' :
        d > 20 ? '#feb24c' :
        d > 10 ? '#fed976' :
        '#ffffb2';

}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.PNTCNT),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// == load GeoJSON from an external file
districtLayer = L.layerGroup();
$.getJSON("data/choropleth.geojson", function(data) {
    // add GeoJSON layer to the map once the file is loaded
    //L.geoJson(data).addTo(map);
    var tempLayer = L.geoJson(data, {
        style: style
    });
    districtLayer.addLayer(tempLayer);
    districtLayer.addTo(map);
    //loadLayerControl();
});

var legend = L.control({
    position: 'bottomright'
});

legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
        //grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        grades = [0, 10, 20, 30, 40, 50, 60],
        labels = [];
    div.innerHTML += '<b>No. of restaurant</b><br>';

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);


// == create new control
/*var palateBox = L.control({
    position: 'bottomright'
});

palateBox.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'palateBox');

    div.innerHTML = '<select><option>1</option><option>2</option><option>3</option></select>';

    
    return div;
};

palateBox.addTo(map);

$(".palateBox").change( function(){
    var option = $(".palateBox option:selected").text();
    console.log("palatebox changes to: "+option);
    if(option=="1"){
        
    }else if(option=="2"){

    }

}
    
    );*/






// == add AMK restaurant points



// load GeoJSON from an external file
var sites = ["AMK", "chinatown", "bugis", "cityHall", "ClarkeQuay", "clementi", "bedok", "yishun", "serangoon", "sengkang", "woodlands", "admiralty", "jurongeast", "TanjongPagar"];
restaurantLayer = L.layerGroup();
$.each(sites, function(i, val) {
    var fileName = "data/" + val + ".geojson";
    //console.log(fileName);
    $.getJSON(fileName, function(data) {
        // add GeoJSON layer to the map once the file is loaded

        var tempLayer_basic = L.geoJson(data);

        var clusters_basic = L.markerClusterGroup();
        clusters_basic.addLayer(tempLayer_basic);
        map.addLayer(clusters_basic);

        restaurantLayer.addLayer(tempLayer_basic);

        var tempLayer = L.geoJson(data, {

            onEachFeature: function(feature, layer) {
                layer.bindPopup('<b>' + feature.properties.vote + ' of its customer recommand this restaurant to you!</b><br/>' + feature.properties.info);
            },
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, PropStyle(parseInt(feature.properties.vote)));

            }
        });

        var clusters = L.markerClusterGroup();
        clusters.addLayer(tempLayer);
        map.addLayer(clusters);


        restaurantLayer.addLayer(tempLayer);

        if (val === "TanjongPagar") {

            loadLayerControl();
        }


    });
});

function PropStyle(size) {
    //console.log(Math.pow(size, 5));
    var radius = Math.pow(size, 5) / 500000000;
    return {
        radius: radius,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    }
}





//== MRT lines layer
//== get data from openstreetmap api and draw mrt lines


mrtLayer = L.layerGroup();

//MRT EAST-WEST LINE
var eastWestStyle = {
    fillOpacity: 1,
    opacity: 1,
    color: '#39ac00',
    weight: 3,
}

$.ajax({
    url: "http://www.openstreetmap.org/api/0.6/relation/445764/full",
    dataType: "xml",
    success: function(xml) {
        ewlayer = new L.OSM.DataLayer(xml);
        ewlayer.setStyle(eastWestStyle);
        //map.fitBounds(ewlayer.getBounds());
        mrtLayer.addLayer(ewlayer);
    }
});

//MRT NORTH-SOUTH LINE
var northSouthStyle = {
    fillOpacity: 1,
    opacity: 1,
    color: '#dc0000',
    weight: 3,
}


$.ajax({
    url: "http://www.openstreetmap.org/api/0.6/relation/445768/full",
    dataType: "xml",
    success: function(xml) {
        nslayer = new L.OSM.DataLayer(xml);
        nslayer.setStyle(northSouthStyle);
        //map.fitBounds(nslayer.getBounds());
        mrtLayer.addLayer(nslayer);
    }
});

//MRT NORTH-EAST LINE 2076291 
var northEastStyle = {
    fillOpacity: 1,
    opacity: 1,
    color: '#8000a5',
    weight: 3,
}

$.ajax({
    url: "http://www.openstreetmap.org/api/0.6/relation/2293545/full",
    dataType: "xml",
    success: function(xml) {
        nelayer = new L.OSM.DataLayer(xml);
        nelayer.setStyle(northEastStyle);
        //map.fitBounds(nelayer.getBounds());
        mrtLayer.addLayer(nelayer);
    }
});

//MRT CIRCLE LINE

var circleStyle = {
    fillOpacity: 1,
    opacity: 1,
    color: '#F4B234',
    weight: 3,
}

$.ajax({
    url: "http://www.openstreetmap.org/api/0.6/relation/2076291/full",
    dataType: "xml",
    success: function(xml) {
        cirlayer = new L.OSM.DataLayer(xml);
        cirlayer.setStyle(circleStyle);
        //map.fitBounds(cirlayer.getBounds());
        mrtLayer.addLayer(cirlayer);
    }
});

//MRT DOWNTOWN LINE

var downtownStyle = {
    fillOpacity: 1,
    opacity: 1,
    color: '#0354A6',
    weight: 3,
}
$.ajax({
    url: "http://www.openstreetmap.org/api/0.6/relation/2313458/full",
    dataType: "xml",
    success: function(xml) {

        dtlayer = new L.OSM.DataLayer(xml);
        dtlayer.setStyle(downtownStyle);

        // map.fitBounds(dtlayer.getBounds());
        mrtLayer.addLayer(dtlayer);
    }

});





// ==layer control
function loadLayerControl() {



    var baseMaps = {
        "baseLayer": baseLayer,
        "transportLayer": transportLayer

    };

    var overlayMaps = {
        "restaurantLayer": restaurantLayer,
        "districtLayer": districtLayer,
        "mrtLayer": mrtLayer

    };

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
        position: "topright"
    }).addTo(map);

    console.log("this is called2");
}

