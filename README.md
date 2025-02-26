# Visualizing Data Across the Globe
<p align='center'><img src='images/readme-images/final-screenshot.jpg' alt='final-site-screenshot' width='80%'></p><br>

## Contributors:
* Julia Gajda
* Kathleen Graham
* Tamara Najjar

<br>

## Overview:
Our project was originally inspired by this shortened clip from an episode of [the Newsroom](https://www.youtube.com/watch?v=16K6m3Ua2nw&t=69s). At the 1:09 minute mark, the character gives a lot of statistics about the United States compared to the rest of the world. His expressions certainly are abrasive, but he makes some interesting points about factual information. There is no such thing as perfect data, but we thought we'd take a closer look at a few of the statistics he discussed. Eventually, we decided plotting information related to military around the world would be especially interesting. We also wanted to plot about food or some other consumer product and any other trending topic, such as billionaires around the world.

We wanted a visualization that had three layers on one map that also contained 3 views: light, dark, and satellite. After researching our chosen topics, we had trouble getting data, so our final layers include data on wine consumption in Liters by country, total number of Olympic medals won, and number of overseas military bases. The U.S. is leading in all three of these, which we did not originally know about wine consumption. Our steps were as follows: 

<br>

## STEP 1: Finding Data

FIND THE DATA! This is never as easy as it sounds. We were able to find a PDF containing wine consumption data and a few different sites on Olympic medal and international military bases data that we could scrape. Throughout the course of this project, we came across more and more helpful resources. Each resource will be referenced at the appropriate step.

<br>

## STEP 2: Cleaning Data After Extracting PDFs and Web Scraping

<br>

### Extracting Data on Wine Consumption from PDF

We were able to find a PDF containing wine consumption data for 2015-2017 from the [Wine Institute](https://www.wineinstitute.org/files/World_Consumption_by_Country_2017.pdf). However, we needed to find a way to convert that data from a PDF into a CSV so we could use it in our code. We used [PDF Element](https://pdf.wondershare.com/how-to/extract-data-from-pdf-form.html) to do just that. The extraction did most of the heavy lifting so there wasn't quite as much cleaning to do in the CSV after that.

<br>

### Web Scraping Data on Total Summer Olympic Medals Won by Country

We originally wanted to plot all the billionaires around the world but ran into some difficulties. Both Forbes and Bloomberg had lists that were nearly impossible to scrape. There was no visible body in the HTML. It was linked to a private directory that we could not access, so we resorted to a different topic - Summer Olympic Medals Won by Country.
    
We were able to scrape the [Olympic medal data](https://www.worldatlas.com/articles/countries-with-the-most-olympic-medals.html), but converting it to a CSV directly from Jupyter Notebook was not working properly, so we exported to an [.xlsx file](data/olympics.xlsx) and then saved as a CSV before changing it to geojson.

<br>

```python
import requests
import pandas as pd
from splinter import Browser
from bs4 import BeautifulSoup as bs

executable_path = {'executable_path': '../chromedriver.exe'}
browser = Browser('chrome', **executable_path, headless=False)

url = 'https://www.worldatlas.com/articles/countries-with-the-most-olympic-medals.html'

table = pd.read_html(url)
table[0]

writer = pd.ExcelWriter('olympics.xlsx', engine='xlsxwriter')
df.to_excel(writer, sheet_name='List')
writer.save()
```

<br>

### Web Scraping Data on International Military Bases by Country

We were able to scrape [International Military Bases by Country](https://en.wikipedia.org/wiki/List_of_countries_with_overseas_military_bases) data from Wikipedia. This was the most difficult site to scrape because Wikipedia has multiple contributors that can alter the HTML. When inspecting the HTML, we found that not all the countries/bases were in the same div or unordered list so it was difficult to iterate through and return the desired results. We found a suitable workaround but it took quite some time.

We set up our [military bases Jupyter notebook file](data/military_bases.ipynb).

<br>

```python
import requests
import pandas as pd
from splinter import Browser
from bs4 import BeautifulSoup as bs
executable_path = {'executable_path': '../chromedriver.exe'}
browser = Browser('chrome', **executable_path, headless=False)
```

<br>

We accessed the url and parsed through the HTML with [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/#). We found a common element, a span containing the flag images, between the elements we wanted. Then we attempted to work our way back with ```.parent``` to get the names of the countries that had overseas bases, deleting the last parent element with ```.pop()``` because it was not actually one of the countries.

<br>

<p align='center'><img src='images/readme-images/scrape-countries-with-overseas-bases.gif' alt='gif-of-scraping-countries-with-overseas-bases' width='60%'></p>

<br>

Then with ```.find_next('a')```, we were able to scrape the names of the countries where the overseas bases are located. There were some special cases, such as with the unordered list on Turkey's overseas bases, that had lists of lists, so we had to clean up the data by appending and inserting base name where appropriate.

<br>

<p align='center'><img src='images/readme-images/scrape-overseas-base-locations.gif' alt='gif-of-scraping-overseas-base-locations' width='60%'></p>

<br>

We turned these two lists into a dataframe with pandas.

<br>

<p align='center'><img src='images/readme-images/create-dataframe.gif' alt='gif-of-creating-dataframe' width='60%'></p>

<br>

To check for correctness, we inspected the count of overseas bases for each country.

<br>

<p align='center'><img src='images/readme-images/count-of-bases.gif' alt='gif-of-base-count' width='60%'></p>


<br>

Finally, we saved to a CSV file. Not every base had a name or any other details, so later we went back and manually added more information about each military base since we wanted correct data for all bases, not just the bases with the most information available.

<br>

```python
military_base_df.to_csv('military_bases.csv')
```

<br>

## STEP 3: Converting to Geojson

We discovered that local geojson files don't always work the same as geojson files accessed through a link to the file on the web. Through the [Leaflet Choropleth tutorial](https://leafletjs.com/examples/choropleth/), we were able to figure out how to add to our HTML a script with a variable of the [geojson data for the outlines of all the countries in the world](https://raw.githubusercontent.com/tetrahedra/worldmap/master/countries.geo.json). We then used that variable to create our geojson layer of our [logic.js](js/logic.js) file.

This turned out to give us a lot more control over what was put on our map in three different layers. When we wanted to add more data to the geojson file, we were able to manipulate it using a website called [geojson.io](http://geojson.io/#map=2/20.0/0.0). We added references to the appropriate [latitude and longitude](https://developers.google.com/public-data/docs/canonical/countries_csv), names of bases, and even images of little flag icons that could display in a popup or tooltip. We even [converted to geojson from CSV](https://www.onlinejsonconvert.com/csv-geojson.php).

<br>

## STEP 4: Visualizing with Leaflet.js

[Leaflet.js](https://leafletjs.com/index.html) has become one of our favorite visualization tools. The interactivity is really fun, especially when you get it to work as you envisioned. Reading through [Leaflet's documentation](https://leafletjs.com/reference-1.5.0.html) helped us come up with some even better ways of visualizing multiple layers at once.

### Base Layers

First, we created the base layers through the Mapbox API and included images in the name by adding HTML image tags. The three views we chose were ```mapbox.satellite```, ```mapbox.light```, and ```mapbox.dark```. These layers were added to a layer group variable called ```baseMaps``` and weren't implemented until after all the map overlays were ready to be added to the map.

<br>

```javascript
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
```

<br>

<p align='center'><img src='images/readme-images/mapbox-layers.gif' alt='gif-of-three-mapbox-layers' width='90%'></p>

<br>

Later, we came back to this point in our logic.js file and added variables for our layers before any functions because we kept getting errors in the console about layers not being defined yet. This was the best place to create them all at once.

<br>

```javascript
// make variables for mapOverlay layers to adjust later
var wineLayer, olympicsLayer, militaryLayer;
```

<br>

### Map Overlays

Next, we began to create our different layers that would overlap the base layers.


#### Wine Consumption Layer

Our first map overlay was a choropleth layer with Wine Consumption by Country, and the first function we made was the ```countryColor()``` function that included a [5-sequence color scheme by Colorbrewer](http://colorbrewer2.org/?type=sequential&scheme=PuBuGn&n=5). This took a little while to get right, but we finally decided on just 5 colors and divided them up from 10<sup vertical-align='super'>2</sup> to 10<sup vertical-align='super'>6</sup>.

<br>

```javascript
// set countryColor based on consumption of wine
function countryColor(d) {
    return d > 1000000 ? '#016c59' :
        d > 100000 ? '#1c9099' :
        d > 10000 ? '#67a9cf' :
        d > 1000 ? '#bdc9e1' :
        d > 100 ? '#f6eff7' :
        'white';
}
```

<br>

We used the ```countryColor()``` function in the following function for the styling of the features in ```style(feature)```. Originally, we had all the countries and outlines brought to the front when hovering, as shown in the ```highlightFeature(e)``` function, but we found that this covered the olympic layer markers when both layers were checked. Eventually, we decided to go back and comment out the section of this function that brings it to the front until we can figure out a better solution later. This messes up the borders of the countries when highlighting, but it's not as noticable as not being able to look at all the data at once when selecting all layers. Whenever we fix this function in the future, the ```resetHighlight(e)``` function will work exactly as it should, just reset whatever was in ```highlightFeature(e)```. These functions also update the ```info``` legend with more information depending on what country is being hovered over and highlighted. The legend was made later, and I'm still confused

<br>

```javascript

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
```

<br>

<p align='center'><img src='images/readme-images/info-update.gif' alt='gif-of-info-update-on-hover' width='90%'></p>

<br>

One of our favorite functions we found in Leaflet's documentation was ```zoomToFeature(e)```. This is boilerplate, but it's so cool to include it and see it in action!

<br>

```javascript
// fxn to zoom in to each country once clicked
function zoomToFeature(e) {
    myMap.fitBounds(e.target.getBounds());
}
```

<br>

<p align='center'><img src='images/readme-images/click-to-zoom.gif' alt='gif-of-click-to-zoom-feature' width='90%'></p>

<br>

Our last function is important because it's what brings all these features together. The name was given in Leaflet's documentation for [onEachFeature()](https://leafletjs.com/reference-1.5.0.html#geojson-oneachfeature), but we only included the parameters and functions inside that we wanted. Our only parameter is ```layer```. Even though we're only using this function on one specific layer, ```wineLayer```, we wanted to allow the function to be used on other layers that would have the same functionality if we decided to extend this project to include more data points (such as multiple layers for the years of data we have besides 2017).

The event listener ```layer.on()``` combines our three functions (```highlightFeature```, ```resetHighlight```, and ```zoomToFeature```) so that upon hovering over a country (```mouseover```), it hightlights; upon ```mouseout```, it resets; and upon clicking (```click```), the map will zoom in on the country that was clicked.

<br>

```javascript
// fxn to bring all previous feature fxns together
function onEachFeature(feature,layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}
```

<br>

Last for this layer, we created the layer itself using [```L.geoJson```](https://leafletjs.com/reference-1.5.0.html#geojson-l-geojson) and referencing ```wineData``` as the first parameter. As mentioned briefly before, this was our GeoJSON data for wine consumption saved as a [single variable in .js format](js/winegeojson.js) that could then be called in our index.html. The second parameter when creating this layer included just two main functions ```style``` and ```onEachFeature```.

<br>

```javascript
// create wine layer that includes styling on three features:
// highlight and resethighlight when hovering or not, and click to zoom
wineLayer = L.geoJson(wineData, {
    style: style,
    onEachFeature: onEachFeature
});
```

<br>

#### Summer Olympic Medals Layer

Next, we moved to our layer with the total number of summer olympic medals won by country. This layer was less complicated because we just wanted colorful circle markers for each country that could be hovered over to show a Tooltip.

We started with the function ```olympicsSize(m)``` to take in the medal count as its parameter and make the size of the marker based on that. When comparing the circle sizes for the United States (rank 1) and Sweden (rank 9), we can see that Sweden's circle is about the same size even though they have significantly fewer medals (only shown by the difference in color and the Tooltips). We believe this is because of the unavoidable map distortion when using the [Mercator projection](https://en.wikipedia.org/wiki/Mercator_projection).

<br>

```javascript
// create markerSize based on number of medals won
function olympicsSize(m) {
    return m > 1000 ? m*150 :
        m > 500 ? m*250 :
        m > 100 ? m*500 :
        m*1000
}
```

<br>

We made the ```olympicsColor(m)``` function with the same parameter, medal count, to choose the color of the marker. The colors we used are recognizable with typical [Olympic symbols](https://en.wikipedia.org/wiki/Olympic_symbols#targetText=The%20Olympic%20flag%20has%20a,world%20at%20the%20present%20time.)

<br>

```javascript
function olympicsColor(m) {
    return m > 800 ? '#FBB32E' :
        m > 400 ? '#0186C3' :
        m > 200 ? '#158C39' :
        '#EE304D'
}
```

<br>

Although this layer was a little simpler than the wineLayer, calling all the features correctly was crucial. We used ```olympicsData``` as the first parameter in ```L.geoJson()```, just like the wineLayer. But then we created another function inside called [```pointToLayer```](https://leafletjs.com/reference-1.5.0.html#geojson-pointtolayer), using ```feature``` and ```latlng``` as parameters that would be used when returning a new circle for each point of data. For each circle, we used ```latlng``` as the first parameter and then set the ```radius``` and ```fillColor``` with the two functions made previously for this layer. We wanted a Tooltip, so we then used [```.bindTooltip```](https://leafletjs.com/reference-1.5.0.html#tooltip) and ```.openTooltip``` to include information about the country and its number of summer olympic medals.

<br>

```javascript
// create olympics layer
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
```

<br>

<p align='center'><img src='images/readme-images/tooltip.gif' alt='gif-of-olympic-medal-tooltip' width='90%'></p>

<br>

#### Military Bases Layer

Last, we made a simple military bases layer with tank icons (called in the ```pointToLayer``` function with ```L.marker```) and with Popups ([```.bindPopup```](https://leafletjs.com/reference-1.5.0.html#popup)) giving more information about the bases and which countries to which they belong.

<br>

```javascript
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
```

<br>

<p align='center'><img src='images/readme-images/popup.gif' alt='gif-of-military-popup-info' width='90%'></p>

<br>

#### Combining Overlays

We combined the three layers into a variable called ```mapOverlay```.

<br>

```javascript
// create overlays
const mapOverlay = {
    "<span>&nbsp;&nbsp; Wine Consumption &nbsp;&nbsp;<img class='layer-img' src='../images/glass.svg'/></span>": wineLayer,
    "<span>&nbsp;&nbsp; Summer Olympic Medals &nbsp;&nbsp;<img class='layer-img' src='../images/medal.png'/></span>": olympicsLayer,
    "<span>&nbsp;&nbsp; Overseas Military Bases &nbsp;&nbsp;<img class='layer-img' src='../images/tank.svg'/></span>": militaryLayer
};
```

<br>

### Creating ```myMap```

Once we had the base layers and the map overlays, we were able to make the map variable ```myMap``` and choose what to load on default. We decided to center the map a little above the equator with a zoom of 3, and we wanted the lightmap base layer and wine layer map overlay to load first.

<br>

```javascript
// load lightmap and winelayer as default
const myMap = L.map('map', {
    center: [45,0],
    zoom: 3,
    layers: [lightmap, wineLayer]
});
```
<br>

### Specializing with ```L.control``` and Event Listeners

We wanted the map to show more information depending on which layers were shown. Making these different controls appear and disappear at the appropriate time was the biggest challenge when plotting/mapping with Leaflet.js.

<br>

#### Layer Control

We started with the layer control, the section where the user can choose which baselayers or map overlays to observe. We decided to not allow this control to collapse to allow a user to more easily switch between layers without having to wait for the control to open up again.

<br>

```javascript
// add all map layers to contorl div
const layerDiv = L.control.layers(baseMaps, mapOverlay, {
    collapsed: false
})

layerDiv.addTo(myMap);
```

<br>

<p align='center'><img src='images/readme-images/three-layers.gif' alt='gif-of-three-geomapping-layers' width='90%'></p>

<br>

#### Wine Information Div

We wanted users to be able to see the amount of wine in Liters each country consumed whenever hovering over the country (shown previously on because these controls were created here and then used in previous functions). The [```L.Control```](https://leafletjs.com/reference-1.5.0.html#control) and [```L.DomUtil```](https://leafletjs.com/reference-1.5.0.html#domutil) were boilerplate, but understanding how it works took some studying.

<br>

```javascript
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
```

<br>

#### Wine Consumption Legend

We also made a legend explaining what the range of colors mean for wine consumption. Again, this was boilerplate from documentation, only changing where necessary to match our own data.

<br>

```javascript

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
```

<br>

#### Olympic Medals Legend

Since we added a legend for the wine consumption layer, we thought it'd be best to also add a legend to explain what the marker colors mean for the number of medals in the summer olympic medals layer.

<br>

```javascript
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
```

<br>

#### Adding and Removing Legends and Information Divs With Layer Additions and Removals 

At this point, we were really proud of our visualization. But there were some things bothering us. Whenever we would uncheck the wine consumption layer, the information div and the legend for this layer would stay on the screen. Of course, the information div didn't work anymore because the hovering function was taken away with the layer, but we weren't sure how to add this section to the layer itself. So after a little research on [Stack Exchange](https://gis.stackexchange.com/a/188341), we determined adding event listeners to add or remove controls would be best. We were able to make a function that added the controls or removed the controls if the event layer name matched what we had made earlier when declaring the ```mapOverlay``` variable.

<br>

```javascript
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
```

<br>

## NEXT STEPS:

We would love to extend this project in the future to include the following considerations:
* using GitHub Pages to allow anyone to observe our visualization instead of only being able to observe the gifs in this README (we tried to use GitHub Pages, but most of the SVGs don't show up and it ruins the experience)
* designing more layer controls with specific years
* changing the toggling of layers to be only two combinations at once (such as radio buttons for wine and olympic layers but a checkbox for military layer)
* adding other types of controls, such as dropdowns, that allow more data but with different selections intead of all at once
* plotting more trends that are popular to compare across the globe (again, with fewer at once or more control over which are shown together)
* adding flag icons instead of circle markers for the olympic layer (currently, this would affect the tanks because they are using the same coordinates)
* using a database to get real time data on other trends that change more frequently, such as current billionaires around the world 

<br>

## More things to learn:

As with any project, the scope changed and we learned a lot! But we also learned about some things that we didn't have time to research more about given our current deadline. Some things we'd like to have better understanding of are as follows:
* when to use ```let``` and when to use ```const``` (this still just gets a little confusing when looking through other people's code for examples or ideas).
* the difference between ```this._div.innerHTML``` and ```div.innerHTML``` (we are currently assuming that the first refers to the current div created through L.control in Leaflet and the second is a div that was created inside a function by the programmer).
* differences between and pros/cons of D3 and Leaflet for certain types of plotting.

<br>

## Conclusion:

Visualizing data across the globe can look powerful, but it can be difficult to get clean data in the first place and then plotting it all on one map can make the screen very busy. Limiting to three trends was a good idea and could be adjusted for the future to really allow an even cleaner look.