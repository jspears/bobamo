define(['underscore', 'jquery'], function (_, $) {
    var _mapsLoaded = $.Deferred();

    var GoogleMaps = (function () {
        function GoogleMaps() {
            _mapsLoaded.done(_.bind(function () {
                this.init();
            }, this));
        }

        GoogleMaps.prototype.init = function () {
            this._geocoder = new google.maps.Geocoder;
            this._marker = new google.maps.Marker;
        };

        GoogleMaps.prototype.createMap = function (container, options) {
            _mapsLoaded.done(_.bind(function () {
                var center = options && options.lat && options.lng ? new google.maps.LatLng(options.lat, options.lng) : new google.maps.LatLng(40.697488, -73.97968100000003);

                var options = _.extend({}, options, {
                    zoom:11,
                    disableDefaultUI:true,
                    panControl:true,
                    zoomControl:true,
                    mapTypeControl:false,
                    scaleControl:true,
                    streetViewControl:false,
                    overviewMapControl:false,
                    mapTypeId:google.maps.MapTypeId.ROADMAP,
                    center:center
                });
                this._gmap = new google.maps.Map(container, options);

            }, this));
        };
        GoogleMaps.prototype.setCenter = function (loc) {
            _mapsLoaded.done(_.bind(function () {
                this._gmap.setCenter(new google.maps.LatLng(loc.lat, loc.lng));
            }, this));
        };
        GoogleMaps.prototype.getCenter = function () {
            this._gmap.getCenter();
        };
        GoogleMaps.prototype.search = function (searchText) {
            _mapsLoaded.done(_.bind(function () {
                var mapInstance = this;
                this._geocoder.geocode({address:searchText }, function (results, status) {
                    if (results.length <= 0) return;

                    var geom = results[0].geometry,
                        location = geom.bounds.getCenter(),
                        address = results[0].formatted_address,
                        bounds = geom.bounds,
                        viewport = geom.viewport;

                    var markerOptions = {
                        position:location,
                        title:address,
                        animation:google.maps.Animation.DROP
                    };

                    mapInstance.placeMarker(markerOptions);
                    mapInstance._gmap.fitBounds(viewport);
                });
            }, this));
        };
        GoogleMaps.prototype.getPosition = function(){
           return this._marker.getPosition();
        };
        GoogleMaps.prototype.placeMarker = function (options, listener) {
            _mapsLoaded.done(_.bind(function () {
                options.map = this._gmap;
                var position = options.position;
                if (position)
                    options.position = new google.maps.LatLng(position.lat, position.lng);
                this._marker.setOptions(options);
            }, this));
        };

        return GoogleMaps;
    })();

    window.gmapsLoaded = function () {
        delete window.gmapsLoaded;
        _mapsLoaded.resolve();
    };

    window.setTimeout(function () {
        require(['http://maps.googleapis.com/maps/api/js?sensor=true&callback=gmapsLoaded']);
    }, 1000);

    return GoogleMaps;
});