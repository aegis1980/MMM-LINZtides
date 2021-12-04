# MMM-LINZtides

This a very New Zealand-centric tides extension for the [MagicMirror](https://github.com/MichMich/MagicMirror).

Its a modilfied version of [MMM-WorldTides](https://github.com/yawnsde/MMM-WorldTides). MMM-LINZTides pulls in data from local csv annual tide tables published by LINZ, whereas MMM-WorldTides pulls in data from the worldtides API based on a (lat,lng). 

Main reason for this was that tide times did not seem to be correct from Worldtides API (~ 30min off) and seemed wasteful to keep pinging worldtimes.

## Installation
Open a terminal session, navigate to your MagicMirror's `modules` folder and execute `git clone https://github.com/aegis1980/MMM-LINZtides.git`, a new folder called MMM-LINZtides will be created.

LINZ produce csv files for each year for 3 to 4 year in future. Download as may as there are for your tide station and put in your MagicMirror's `public` folder.

Activate the module by adding it to the config.js file as shown below.



## Using the module
````javascript
modules: [
{
  module: 'MMM-LINztides',
  position: 'top_right',
  config: {
    ...
  },
}
````

## Configuration options

The following properties can be configured:

| **Option** | **Values** | **Description** |
| --- | --- | --- |
| `numberOfDays` | Default: `4` <br>(Practical) maximum: `7` | The amount of days to be displayed. |
| `hightideSymbol` | Default: `'fa fa-upload'` | A custom css value to change the symbol for flood. You can use symbols like `'wi weathericon wi-flood'` [WeatherIcons](https://erikflowers.github.io/weather-icons/), `'fa fa-level-up'` [fontawesome](http://fontawesome.io/icons/) |
| `lowtideSymbol` | Default: `'fa fa-download'` | A custom css value to change the symbol for ebb. |
| `boldHightide` | Default: `true` | High tide times will be in bold |
| `boldLowtide` | Default: `false` | Low tide times will be in bold |
| `announceNextHigh` | Default: `true` | Included humanised time period to next high tide, e.g. `Next high tide in 4 hours` |

