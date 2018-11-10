# Udacity Neighbourhood Map Project

Fourth project in Udacity's Full Stack Nanodegree is **Neighbourhood Map Project**. We are asked to create a single page web application usinng **`Knockout.js`** and preffered 3rd party Map application. I decided to use **Google Maps JavaScript Library**

 > Click [here](http://185.137.92.115:8000) for live app.

## Application
I'm a regular user of London underground services, and few times I used TFL Santander bicycles, nicknamed [Boris Bikes](https://static.independent.co.uk/s3fs-public/thumbnails/image/2015/11/23/16/GettyImages-497821114.jpg?w968). I wanted to create a web app that displays London Train Stations and whenever a user clicks on a station on the map or choose from the list, info window pops up and shows nearby bike stations together with bike availablity data.

 > *Note that bike stations are mostly installed in Zone 1 and Zone 2. In other zones user would likely to fail finding bike stations nearby.*

This app queries two APIs:
 - London Train Stations data
 - Bike Stations data

Users can:
 - list all train stations along with Zone information. All Stations are displayed on the map.
 - filter stations by typing into filter box, either on sidebar or on the navbar
 - toggle sidebar by clicking hamburger icon (hamburger icon also toggles the filter box on navbar).
 - click on markers or station name on the sidebar and get bike availability data.

 Filtering results also changes the map zoom level and center. This way users do not need to constantly zoom.

## Frameworks & Data
 - `Google Maps JavaScript` library was used for showing filtered results on the map.
 - `Knockout.js` was used as the organizational library, (MVVM)
 - `jQuery` was used for AJAX calls to data as well as sidebar toggling. `jQuery` is also used by `Bootstrap`
 - `Bootstrap 4` was used for styling the web app and making it mobile friendly and responsive. Further CSS customization is done in `style.css` file
 - Data for TFL stations was available at [Marquis de Geek web site](http://marquisdegeek.com/api/tube/) as a JSON file.
 - [Bike availability data](https://api.tfl.gov.uk/bikepoint) is provided by TFL.

# Credits
- Udacity Google Maps Course. I used few exampled fgrom there, like infoWindow and markers.
- London Station Data is queried from[Marquis de Geek](http://marquisdegeek.com/api/tube/) web site. Kudos to him.
- Thanks TFL for the bike data. TFL has few good APIs.
- Finally, my sidebar design was influenced from one of [Bootstrapious](https://bootstrapious.com/p/bootstrap-sidebar) examples. Thanks for the inspiration.

# Notes:
Google Maps API KEY is secured for [live app](http://185.137.92.115:8000) and the one in github is also secured and can only work from `http://127.0.0.1:5500` (VSCODE live server). If you download and you receive an error on Map screen either use VSCODE live server and run on port `5500` or use your Google Maps API key.

Also note that for some reason, zooming works perfect on bigger devices and on PC/MAC, however in small devices auto doesn't work. This needs to be checked.

Mehmet Oner Yalcin
