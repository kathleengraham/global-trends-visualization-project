//////////////////////////////////////////////// BASEMAP LAYERS ///////////////////////////////////////////////
// link to maps with api in config.js
const mapboxLink = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';

// create satellite map layer
const satmap = L.tileLayer(mapboxLink,{
    attribution: attribution,
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: API_KEY
    });

// create light map layer
const lightmap = L.tileLayer(mapboxLink,{
    attribution: attribution,
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: API_KEY
});

// create dark map layer
const darkmap = L.tileLayer(mapboxLink,{
    attribution: attribution,
    maxZoom: 18,
    id: 'mapbox.dark',
    accessToken: API_KEY
});

// create basemap layer with the other maps
const baseMaps = {
    "<span>&nbsp;&nbsp; Satellite Map &nbsp;&nbsp;<img class='layer-img' src='../images/satellite.jpg'/></span>": satmap,
    "<span>&nbsp;&nbsp; Light Map &nbsp;&nbsp;<img class='layer-img' src='../images/lightmap.jpg'/></span>": lightmap,
    "<span>&nbsp;&nbsp; Dark Map &nbsp;&nbsp;<img class='layer-img' src='../images/darkmap.jpg'/></span>": darkmap
};

// make variables for mapOverlay layers to adjust later
var wineLayer, olympicsLayer, militaryLayer;

//////////////////////////////////////////// WINE CONSUMPTION LAYER ///////////////////////////////////////////
// set countryColor based on consumption of wine
function countryColor(d) {
    return d > 1000000 ? '#016c59' :
        d > 100000 ? '#1c9099' :
        d > 10000 ? '#67a9cf' :
        d > 1000 ? '#bdc9e1' :
        d > 100 ? '#f6eff7' :
        'white';
}

// fxn for filling in the countries
function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5,
        fillColor: countryColor(feature.properties.wineConsumption)
    };
}

// fxn for highlighting outline of country on hover
function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    // don't want to bring to front because it covers up the olympic circles when both layers checked
    // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    //     layer.bringToFront();
    // }

    info.update(layer.feature.properties);
}

// fxn to reset the outline of countries when not hovering anymore
function resetHighlight(e) {
    wineLayer.resetStyle(e.target);
    info.update();
}

// fxn to zoom in to each country once clicked
function zoomToFeature(e) {
    myMap.fitBounds(e.target.getBounds());
}

// fxn to bring all previous feature fxns together
function onEachFeature(feature,layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// create wine layer that includes styling on three features:
// highlight and resethighlight when hovering or not, and click to zoom
wineLayer = L.geoJson(wineData, {
    style: style,
    onEachFeature: onEachFeature
});

//////////////////////////////////////////// OLYMPIC MEDALS LAYER ///////////////////////////////////////////
// create markerSize based on number of medals won
function olympicsSize(m) {
    return m > 1000 ? m*150 :
        m > 500 ? m*250 :
        m > 100 ? m*500 :
        m*1000
}

function olympicsColor(m) {
    return m > 800 ? '#FBB32E' :
        m > 400 ? '#0186C3' :
        m > 200 ? '#158C39' :
        '#EE304D'
}

// create olympic layer
olympicsLayer = L.geoJson(olympicsData,{
    pointToLayer:function(feature,latlng){
        return new L.circle(latlng,
            {radius:olympicsSize(feature.properties.medals),fillColor:olympicsColor(feature.properties.medals),fillOpacity:0.9,stroke:false})
            .bindTooltip('<div><h4>'+feature.properties.country+'<br><img class="flag-img" src="'+feature.properties.flag
            +'"><hr>Rank: '+feature.properties.rank+'</h4><h5>'
            +'<img class="medal-img" src="images/gold-medal.svg">Medals: '+feature.properties.medals+'</h5></div>',{'className': 'medal-tooltip'})
            .openTooltip()
    }
})

/////////////////////////////////////// OVERSEAS MILITARY BASES LAYER //////////////////////////////////////
// define tank icon to be used for markers in military layer
const tankIcon = L.icon({
	iconUrl: '../images/tank.svg',
	iconSize: [38, 95]
});

// can look up difference betweeen L.SVG L.marker with icon as a parameter
militaryLayer = L.geoJson(militaryData, {
	pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: tankIcon})
            .bindPopup('<h5>'+feature.properties.country+'</h5>'+feature.properties.base_name, {'className': 'tank-popup'});
	}
});

//////////////////////////////////////////////// GENERAL MAP ///////////////////////////////////////////////
// create overlays
const mapOverlay = {
    "<span>&nbsp;&nbsp; Wine Consumption &nbsp;&nbsp;<img class='layer-img' src='../images/glass.svg'/></span>": wineLayer,
    "<span>&nbsp;&nbsp; Summer Olympic Medals &nbsp;&nbsp;<img class='layer-img' src='../images/medal.png'/></span>": olympicsLayer,
    "<span>&nbsp;&nbsp; Overseas Military Bases &nbsp;&nbsp;<img class='layer-img' src='../images/tank.svg'/></span>": militaryLayer
};

// load lightmap and winelayer as default
const myMap = L.map('map', {
    center: [45,0],
    zoom: 3,
    layers: [lightmap, wineLayer]
});

// add all map layers
const layerDiv = L.control.layers(baseMaps, mapOverlay, {
    collapsed: false
})

layerDiv.addTo(myMap);

//////////////////////////////////////////// WINE INFO AND LEGEND //////////////////////////////////////////
// control that shows country info on hover
let info = L.control({ position: 'bottomleft' });

// add info div to wine layer
info.onAdd = function() {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// update info div whenever hovering over a country
info.update = function(props) {
    this._div.innerHTML = '<h4>World Wine Consumption (2017)</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.wineConsumption + ' L'
        : 'Hover over a country<br><br>');
};

// add info div to myMap for wine layer
info.addTo(myMap);

// create wine legend
const legend = L.control({position: 'bottomleft'});

// add function to legend for wine layer
legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'legend');
    const consumption = [0, 100, 1000, 10000, 100000, 1000000]
    // const labels = []
    for (let i = 0; i < consumption.length; i++){
        div.innerHTML +=
            '<i style="background:' + countryColor(consumption[i] + 1) + '"></i> ' +
            consumption[i] + (consumption[i + 1] ? '&ndash;' + consumption[i + 1] + '<br>' : '+')
    }
    return div
}

legend.addTo(myMap);

//////////////////////////////////////////// OLYMPICS INFO AND LEGEND //////////////////////////////////////////
// create olympic legend
const olympicsLegend = L.control({position: 'bottomright'});

// add function to legend for olympics layer
olympicsLegend.onAdd = function() {
    const div = L.DomUtil.create('div', 'oLegend');
    const medals = [0,200,400,800]
    // const labels = []
    div.innerHTML = '<h5>Total Summer Olympic Medals<br>Won by Country<br>(up to 2016)</h5>'
    for (let i = 0; i < medals.length; i++){
        div.innerHTML +=
            '<i style="background:' + olympicsColor(medals[i] + 1) + '"></i> ' +
            medals[i] + (medals[i + 1] ? '&ndash;' + medals[i + 1] + '<br>' : '+')
    }
    return div
}

/////////////////////////////////////// CONTROL DOMUTILS FOR CERTAIN LAYERS  ////////////////////////////////////
// https://gis.stackexchange.com/a/188341
// show info and legend depending on which layer is checked
myMap.on('overlayadd', function(eventLayer){
    if (eventLayer.name === "<span>&nbsp;&nbsp; Wine Consumption &nbsp;&nbsp;<img class='layer-img' src='../images/glass.svg'/></span>"){
        myMap.addControl(info);
        myMap.addControl(legend);
    } else if (eventLayer.name === "<span>&nbsp;&nbsp; Summer Olympic Medals &nbsp;&nbsp;<img class='layer-img' src='../images/medal.png'/></span>") {
        myMap.addControl(olympicsLegend);
    }
});

// remove info and legend depending on which layer is unchecked
myMap.on('overlayremove', function(eventLayer){
    if (eventLayer.name === "<span>&nbsp;&nbsp; Wine Consumption &nbsp;&nbsp;<img class='layer-img' src='../images/glass.svg'/></span>"){
         myMap.removeControl(info);
         myMap.removeControl(legend);
    } else if (eventLayer.name === "<span>&nbsp;&nbsp; Summer Olympic Medals &nbsp;&nbsp;<img class='layer-img' src='../images/medal.png'/></span>") {
        myMap.removeControl(olympicsLegend);
    }
});