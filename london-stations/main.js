/*jshint esversion: 6 */
'use strict';

let map;

// Bicycle Station Model
function BorisBikeStation(data) {
    let self = this;
    this.name = data.commonName;
    this.position = { lat: data.lat, lng: data.lon };

    const getAdditionalBikeStationData = function (self, data) {
        for (const elem of data.additionalProperties) {
            if (elem.key == 'NbBikes') {
                self.avaliableBikesCount = parseInt(elem.value);
            } else if (elem.key == 'NbEmptyDocks') {
                self.emptyDocksCount = parseInt(elem.value);
            } else if (elem.key == 'NbDocks') {
                self.dockCount = parseInt(elem.value);
            }
        }
    }(self, data);
}


// London Train station Model
function TrainStation(data) {
    const self = this;

    // self.name = ko.observable(data.name);
    self.name = data.name;
    self.zone = data.zone;
    self.position = { lat: data.latitude, lng: data.longitude };
    self.title = data.name + " - Zone: " + data.zone;

    // Define the Google Maps Markers for each station
    self.marker = new google.maps.Marker({
        map: map,
        position: self.position,
        title: self.title,
        animation: google.maps.Animation.DROP,
    });

    // when clicked show user Station Name and Zone information
    self.marker.addListener('click', clickMarker);

    // when a user clicks a station in the list it should change color of marker
    self.highlightStation = function (station) {
        if (station.marker.getAnimation() !== null) {
            station.marker.setAnimation(null);
        } else {
            station.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () { station.marker.setAnimation(null); }, 3000);
            let infowindow = new google.maps.InfoWindow();
            populateInfoWindow(station.marker, infowindow);
        }
    };
}

const clickMarker = function () {
    const marker = this;
    let infowindow = new google.maps.InfoWindow();
    populateInfoWindow(marker, infowindow);
};

const getNearbyBikeStations = function (marker) {
    let bikeStations = JSON.parse(localStorage.getItem('borisBikeStations'));
    let filteredStations = bikeStations.filter(function (station) {
        return (Math.abs(marker.position.lat() - station.position.lat) < 0.005) && (Math.abs(marker.position.lng() - station.position.lng) < 0.005);
    });
    return filteredStations;
};

const populateInfoWindowContent = function (marker, nearbyBikeStations) {
    let bikeInfo = "";
    let stationInfo = `<div class="infobox"> <h6 class="mb-2"> ${marker.title}</h6> </div >`;
    if (nearbyBikeStations.length > 0) {
        for (const bikeStation of nearbyBikeStations) {
            // progress bar percentage
            const progress = (bikeStation.avaliableBikesCount / bikeStation.dockCount) * 100;

            //progress bar color, up to 20% red, 20% - 50% yellow and above green.
            let progressColor = 'bg-success';
            if (progress < 25) {
                progressColor = 'bg-danger';
            } else if (progress < 50) {
                progressColor = 'bg-warning';
            }

            // for each nearby bikestation create a new progress bar along with bike availability information
            bikeInfo = bikeInfo + `<div class="row infobox">
            <p class="col-6 mb-1 text-truncate">${bikeStation.name}</p>
            <div class="col-6 d-flex flex-row bd-highlight mb-1 justify-content-end">
                <div class="flex-row">
                    <i class="fas fa-bicycle"></i> <span>${bikeStation.avaliableBikesCount}</span>
                </div>
                <div class="ml-2">
                    <i class="fas fa-parking"></i> <span>${bikeStation.dockCount}</span>
                </div>
            </div>
        </div>
        <div class="progress">
            <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0"
                aria-valuemax="100"></div>
        </div>`;
        }
    } else {
        bikeInfo = `<p>No Boris Bike station found nearby</p>`;
    }
    return stationInfo + bikeInfo;
};

// Get latest TFL Data for BorisBike Docking stations.
// When user clicks a station marker we'll display nearby bike stations together with availability.
const queryBorisBikeData = function () {

    $.getJSON("https://api.tfl.gov.uk/bikepoint")
        .done(function (allBikeData) {
            const borisBikeStations = $.map(allBikeData, function (bikeData) { return new BorisBikeStation(bikeData); });
            localStorage.setItem('borisBikeStations', JSON.stringify(borisBikeStations));
        });
};


// Very similar function is defined in Udacity's Google Maps class.
// I pretty much adapted to my requirements
const populateInfoWindow = function (marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        const nearbyBikeStations = getNearbyBikeStations(marker);
        const infoWindowContent = populateInfoWindowContent(marker, nearbyBikeStations);
        // infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.setContent(infoWindowContent);
        infowindow.open(map, marker);

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.setMarker = null;
        });
    }
};


// Our Octopus, I mean ViewModel, the glue between View and Data
function TrainStationViewModel() {
    const self = this;
    self.stations = ko.observableArray([]);     // all available stations
    self.borisBikeStations = queryBorisBikeData(self);
    self.visibleStations = ko.observableArray([]);      // filtered stations
    self.filterQuery = ko.observable();     // this filter gets the input from user form

    // DATA COLLECTION

    // London stations data is located at Marquis de Geek api page for London Tube.
    // I used jQuery ajax moduel of getJSON to access the London Stations Data
    $.getJSON("http://marquisdegeek.com/api/tube/")
        .done(function (allData) {
            const mappedStations = $.map(allData, function (item) { return new TrainStation(item); });
            self.stations(mappedStations);
            self.visibleStations(self.stations());  // when page first loads set all stations are visible
        })
        .fail(function (jqxhr, textStatus, error) {
            const err = "Error happened while retrieving data: " + textStatus + ", " + error;
            alert(err);
        });

    // OPERATIONS

    // Filter stations based on the input from user
    self.filterStations = function () {

        // Filter stations based on the filter
        self.visibleStations(self.stations().filter(station => station.name.toLowerCase().includes(self.filterQuery().toLowerCase())));

        // Remove all markers first or all stations and then only make
        // visible the ones filtered
        self.stations().forEach(element => {
            element.marker.setVisible(false);
        });

        // create a new LatLngBounds object, so we can focus on only filtered areas
        const bounds = new google.maps.LatLngBounds();
        self.visibleStations().forEach(element => {
            element.marker.setVisible(true);
            bounds.extend(element.marker.position);
        });
        if (self.visibleStations().length > 0) {
            // Ensure all stations are still visible after filtering
            map.fitBounds(bounds);
        } else {
            // filter returns no data points, set the map center to London city center
            map.setCenter({ lat: 51.521340, lng: -0.125527 });
            map.setZoom(11);
        }

    };
}

// This is a kind of quick way via jQuery, I didn't think thoroughly to convert to knowckout js
$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $('#navbar-form').toggleClass('d-none');
    });
});


// initMap is required by GoogleMaps, it's a callback function,
function initMap() {
    const centralLondon = { lat: 51.521340, lng: -0.125527 };

    // Constructor creates a new map - only center and zoom are required
    map = new google.maps.Map(document.getElementById('map'), {
        center: centralLondon,
        zoom: 11
    });

    // Get Bike data
    queryBorisBikeData();

    // Do the bindings for Knockout
    ko.applyBindings(new TrainStationViewModel());
}

// If Google Maps loading fails this is the callback function
onerror = function (event) {
    alert(`Loading Google maps javascript failed. Reason: ${event}`);
};
