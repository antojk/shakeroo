/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui'),
    Ajax = require('ajax'),
    Accel = require('ui/accel'),
    Vector2 = require('vector2'),
    Vibe = require('ui/vibe');



var splashWindow = new UI.Window(), 
    text = new UI.Text({
      position: new Vector2(0,0),
      size: new Vector2(144, 168),
      text: 'Downloading weather data...',
      font: 'GOTHIC_28_BOLD',
      color: 'black',
      textOverFlow: 'wrap',
      textAlign: 'center',
      backgroundColor: 'white'
    });
var parseFeed = function(data){
      var items = [];
      for(var i=0; i < data.cnt; i++){
      var title = data.list[i].weather[0].main;
      title = title.charAt(0).toUpperCase() + title.substring(1);
    
      var time = data.list[i].dt_txt;
      time = time.substring(time.indexOf('-') + 1, time.indexOf(':') + 3);
      time = time.replace('-','/');
    
      items.push({title: title, subtitle: time});    
    }
    return items;
  };

splashWindow.add(text);
splashWindow.show();
Accel.init();

var cityName = 'Bangalore', 
    URL = 'http://api.openweathermap.org/data/2.5/forecast?q=' + cityName;
Ajax(
  {
    url:URL,
    type:'json'
  },  function(data){
    //Success
    console.log('Successfully fetched data!');
    var menuItems = parseFeed(data);
    
    for(var i=0; i < menuItems.length; i++ ){
      console.log(menuItems[i].title + '|' + menuItems[i].subtitle);
    }

    var resultsMenu = new UI.Menu({
      sections:[{
        title: 'Current Forecast: ' + cityName,
        items: menuItems
      }]
    });
    resultsMenu.show();
    splashWindow.hide();
    
    // Notify the user
    Vibe.vibrate('short');
    
    resultsMenu.on('accelTap',function(e){
      console.log('TAP!');
      console.log('axis: ' + e.axis + ', direction:' + e.direction);
      
      // Make another request to openweathermap.org, this time triggered by accelator tap
      Ajax({
        url:URL,
        type:'json'
      }, function(data){
        menuItems = parseFeed(data);
        for(var i=0; i < menuItems.length; i++ ){
          console.log(menuItems[i].title + '|' + menuItems[i].subtitle);
        }
        resultsMenu.items(0,menuItems);
        
        // Notify the user
        Vibe.vibrate('short');
      }, function(error){
        console.log('Failed fetching weather data: ' + error);
      });
    });
   
    // Add an action for SELECT
    resultsMenu.on('select', function(e) {
  
      // Get that forecast
      var forecast = data.list[e.itemIndex];
      
      // Assemble body string
      var content = data.list[e.itemIndex].weather[0].description;
      
      // Capitalize first letter
      content = content.charAt(0).toUpperCase() + content.substring(1);
      
      // Add temperature, pressure etc
      content += '\nTemperature: ' + Math.round(forecast.main.temp - 273.15) + '°C' +
        '\nPressure: ' + Math.round(forecast.main.pressure) + ' mbar' +
        '\nWind: ' + Math.round(forecast.wind.speed) + ' mph, ' + 
        Math.round(forecast.wind.deg) + '°';
      
       // Create the Card for detailed view
      var detailCard = new UI.Card({
        title:'Details',
        subtitle: e.item.subtitle,
        body: content
      });
      detailCard.show();
    });   
  },
  function(error){
    console.log('Failed fetching weather data: ' + error);
  }
);

