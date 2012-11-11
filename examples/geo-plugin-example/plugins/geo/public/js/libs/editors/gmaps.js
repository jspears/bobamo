/*!
 * GMaps.js v0.2.26
 * http://hpneo.github.com/gmaps/
 *
 * Copyright 2012, Gustavo Leon
 * Released under the MIT License.
 */

define(['jquery', 'libs/editors/google-maps'], function($, google){
  var GMaps = (function(global) {
    "use strict";

    var doc = document;
    var getElementById = function(id, context) {
      var ele
      if('jQuery' in global && context){
        ele = $("#"+id.replace('#', ''), context)[0]
      }else{
        ele = doc.getElementById(id.replace('#', ''));
      };
      return ele;
    };

    var GMaps = function(options) {
      var self = this;
      window.context_menu = {};

      if (typeof(options.el) === 'string' || typeof(options.div) === 'string') {
        this.el = getElementById(options.el || options.div, options.context);
      } else {
        this.el = options.el || options.div;
      };
      this.el.style.width = options.width || this.el.scrollWidth || this.el.offsetWidth;
      this.el.style.height = options.height || this.el.scrollHeight || this.el.offsetHeight;

      this.controls = [];
      this.overlays = [];
      this.layers = []; // array with kml and ft layers, can be as many
      this.singleLayers = {}; // object with the other layers, only one per layer
      this.markers = [];
      this.polylines = [];
      this.routes = [];
      this.polygons = [];
      this.infoWindow = null;
      this.overlay_el = null;
      this.zoom = options.zoom || 15;

      var markerClusterer = options.markerClusterer;

      //'Hybrid', 'Roadmap', 'Satellite' or 'Terrain'
      var mapType;

      if (options.mapType) {
        mapType = google.maps.MapTypeId[options.mapType.toUpperCase()];
      }
      else {
        mapType = google.maps.MapTypeId.ROADMAP;
      }

      var map_center = new google.maps.LatLng(options.lat, options.lng);

      delete options.el;
      delete options.lat;
      delete options.lng;
      delete options.mapType;
      delete options.width;
      delete options.height;
      delete options.markerClusterer;

      var zoomControlOpt = options.zoomControlOpt || {
        style: 'DEFAULT',
        position: 'TOP_LEFT'
      };

      var zoomControl = options.zoomControl || true,
          zoomControlStyle = zoomControlOpt.style || 'DEFAULT',
          zoomControlPosition = zoomControlOpt.position || 'TOP_LEFT',
          panControl = options.panControl || true,
          mapTypeControl = options.mapTypeControl || true,
          scaleControl = options.scaleControl || true,
          streetViewControl = options.streetViewControl || true,
          overviewMapControl = overviewMapControl || true;

      var map_options = {};

      var map_base_options = {
        zoom: this.zoom,
        center: map_center,
        mapTypeId: mapType
      };

      var map_controls_options = {
        panControl: panControl,
        zoomControl: zoomControl,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle[zoomControlStyle], // DEFAULT LARGE SMALL
          position: google.maps.ControlPosition[zoomControlPosition]
        },
        mapTypeControl: mapTypeControl,
        scaleControl: scaleControl,
        streetViewControl: streetViewControl,
        overviewMapControl: overviewMapControl
      }

      if(options.disableDefaultUI != true)
        map_base_options = extend_object(map_base_options, map_controls_options);

      map_options = extend_object(map_base_options, options);

      this.map = new google.maps.Map(this.el, map_options);

      if(markerClusterer)
        this.markerClusterer = markerClusterer.apply(this, [this.map]);

      // Context menus
      var buildContextMenuHTML = function(control, e) {
          var html = '';
          var options = window.context_menu[control];
          for (var i in options){
            if (options.hasOwnProperty(i)){
              var option = options[i];
              html += '<li><a id="' + control + '_' + i + '" href="#">' +
                option.title + '</a></li>';
            }
          }

          if(!getElementById('gmaps_context_menu')) return;
          
          var context_menu_element = getElementById('gmaps_context_menu');
          context_menu_element.innerHTML = html;

          var context_menu_items = context_menu_element.getElementsByTagName('a');

          var context_menu_items_count = context_menu_items.length;

          for(var i=0;i<context_menu_items_count;i++){
            var context_menu_item = context_menu_items[i];

            var assign_menu_item_action = function(ev){
              ev.preventDefault();

              options[this.id.replace(control + '_', '')].action.apply(self, [e]);
              self.hideContextMenu();
            };

            google.maps.event.clearListeners(context_menu_item, 'click');
            google.maps.event.addDomListenerOnce(context_menu_item, 'click', assign_menu_item_action, false);
          }

          var left = self.el.offsetLeft + e.pixel.x - 15;
          var top = self.el.offsetTop + e.pixel.y - 15;

          context_menu_element.style.left = left + "px";
          context_menu_element.style.top = top + "px";

          context_menu_element.style.display = 'block';
        };

      var buildContextMenu = function(control, e) {
          if (control === 'marker') {
            e.pixel = {};
            var overlay = new google.maps.OverlayView();
            overlay.setMap(self.map);
            overlay.draw = function() {
              var projection = overlay.getProjection();
              var position = e.marker.getPosition();
              e.pixel = projection.fromLatLngToContainerPixel(position);

              buildContextMenuHTML(control, e);
            };
          }
          else {
            buildContextMenuHTML(control, e);
          }
        };

      this.setContextMenu = function(options) {
        window.context_menu[options.control] = {};
        for (var i in options.options){
          if (options.options.hasOwnProperty(i)){
            var option = options.options[i];
            window.context_menu[options.control][option.name] = {
              title: option.title,
              action: option.action
            };
          }
        }
        var ul = doc.createElement('ul');
        ul.id = 'gmaps_context_menu';
        ul.style.display = 'none';
        ul.style.position = 'absolute';
        ul.style.minWidth = '100px';
        ul.style.background = 'white';
        ul.style.listStyle = 'none';
        ul.style.padding = '8px';
        ul.style.boxShadow = '2px 2px 6px #ccc';

        doc.body.appendChild(ul);

        var context_menu_element = getElementById('gmaps_context_menu');

        google.maps.event.addDomListener(context_menu_element, 'mouseout', function(ev) {
          if(!ev.relatedTarget || !this.contains(ev.relatedTarget)){
            window.setTimeout(function(){
              context_menu_element.style.display = 'none';
            }, 400);
          }
        }, false);
      };

      this.hideContextMenu = function() {
        var context_menu_element = getElementById('gmaps_context_menu');
        if(context_menu_element)
          context_menu_element.style.display = 'none';
      };

      //Events

      var events_that_hide_context_menu = ['bounds_changed', 'center_changed', 'click', 'dblclick', 'drag', 'dragend', 'dragstart', 'idle', 'maptypeid_changed', 'projection_changed', 'resize', 'tilesloaded', 'zoom_changed'];
      var events_that_doesnt_hide_context_menu = ['mousemove', 'mouseout', 'mouseover'];

      for (var ev = 0; ev < events_that_hide_context_menu.length; ev++) {
        (function(object, name) {
          google.maps.event.addListener(object, name, function(e){
            if(e == undefined)
              e = this;

            if (options[name])
              options[name].apply(this, [e]);

            self.hideContextMenu();
          });
        })(this.map, events_that_hide_context_menu[ev]);
      }

      for (var ev = 0; ev < events_that_doesnt_hide_context_menu.length; ev++) {
        (function(object, name) {
          google.maps.event.addListener(object, name, function(e){
            if(e == undefined)
              e = this;

            if (options[name])
              options[name].apply(this, [e]);
          });
        })(this.map, events_that_doesnt_hide_context_menu[ev]);
      }

      google.maps.event.addListener(this.map, 'rightclick', function(e) {
        if (options.rightclick) {
          options.rightclick.apply(this, [e]);
        }

        buildContextMenu('map', e);
      });

      this.refresh = function() {
        google.maps.event.trigger(this.map, 'resize');
      };

      this.fitZoom = function() {
        var latLngs = [];
        var markers_length = this.markers.length;

        for(var i=0; i < markers_length; i++) {
          latLngs.push(this.markers[i].getPosition());
        }

        this.fitLatLngBounds(latLngs);
      };

      this.fitLatLngBounds = function(latLngs) {
        var total = latLngs.length;
        var bounds = new google.maps.LatLngBounds();

        for(var i=0; i < total; i++) {
          bounds.extend(latLngs[i]);
        }

        this.map.fitBounds(bounds);
      };

      // Map methods
      this.setCenter = function(lat, lng, callback) {
        this.map.panTo(new google.maps.LatLng(lat, lng));
        if (callback) {
          callback();
        }
      };

      this.getElement = function() {
        return this.el;
      };

      this.zoomIn = function(value) {
        this.zoom = this.map.getZoom() + value;
        this.map.setZoom(this.zoom);
      };

      this.zoomOut = function(value) {
        this.zoom = this.map.getZoom() - value;
        this.map.setZoom(this.zoom);
      };

      var native_methods = [];

      for(var method in this.map){
        if(typeof(this.map[method]) == 'function' && !this[method]){
          native_methods.push(method);
        }
      }

      for(var i=0; i < native_methods.length; i++){
        (function(gmaps, scope, method_name) {
          gmaps[method_name] = function(){
            return scope[method_name].apply(scope, arguments);
          };
        })(this, this.map, native_methods[i]);
      }

      this.createControl = function(options) {
        var control = doc.createElement('div');

        control.style.cursor = 'pointer';
        control.style.fontFamily = 'Arial, sans-serif';
        control.style.fontSize = '13px';
        control.style.boxShadow = 'rgba(0, 0, 0, 0.398438) 0px 2px 4px';

        for(var option in options.style)
          control.style[option] = options.style[option];

        if(options.id) {
          control.id = options.id;
        }

        if(options.classes) {
          control.className = options.classes;
        }

        if(options.content) {
          control.innerHTML = options.content;
        }

        for (var ev in options.events) {
          (function(object, name) {
            google.maps.event.addDomListener(object, name, function(){
              options.events[name].apply(this, [this]);
            });
          })(control, ev);
        }

        control.index = 1;

        return control;
      };

      this.addControl = function(options) {
        var position = google.maps.ControlPosition[options.position.toUpperCase()];

        delete options.position;

        var control = this.createControl(options);
        this.controls.push(control);
        this.map.controls[position].push(control);

        return control;
      };

      // Markers
      this.createMarker = function(options) {
        if ((options.hasOwnProperty('lat') && options.hasOwnProperty('lng')) || options.position) {
          var self = this;
          var details = options.details;
          var fences = options.fences;
          var outside = options.outside;

          var base_options = {
            position: new google.maps.LatLng(options.lat, options.lng),
            map: null
          };

          delete options.lat;
          delete options.lng;
          delete options.fences;
          delete options.outside;

          var marker_options = extend_object(base_options, options);

          var marker = new google.maps.Marker(marker_options);

          marker.fences = fences;

          if (options.infoWindow) {
            marker.infoWindow = new google.maps.InfoWindow(options.infoWindow);

            var info_window_events = ['closeclick', 'content_changed', 'domready', 'position_changed', 'zindex_changed'];

            for (var ev = 0; ev < info_window_events.length; ev++) {
              (function(object, name) {
                google.maps.event.addListener(object, name, function(e){
                  if (options.infoWindow[name])
                    options.infoWindow[name].apply(this, [e]);
                });
              })(marker.infoWindow, info_window_events[ev]);
            }
          }

          var marker_events = ['animation_changed', 'clickable_changed', 'cursor_changed', 'draggable_changed', 'flat_changed', 'icon_changed', 'position_changed', 'shadow_changed', 'shape_changed', 'title_changed', 'visible_changed', 'zindex_changed'];

          var marker_events_with_mouse = ['dblclick', 'drag', 'dragend', 'dragstart', 'mousedown', 'mouseout', 'mouseover', 'mouseup'];

          for (var ev = 0; ev < marker_events.length; ev++) {
            (function(object, name) {
              google.maps.event.addListener(object, name, function(){
                if (options[name])
                  options[name].apply(this, [this]);
              });
            })(marker, marker_events[ev]);
          }

          for (var ev = 0; ev < marker_events_with_mouse.length; ev++) {
            (function(map, object, name) {
              google.maps.event.addListener(object, name, function(me){
                if(!me.pixel){
                  me.pixel = map.getProjection().fromLatLngToPoint(me.latLng)
                }
                if (options[name])
                  options[name].apply(this, [me]);
              });
            })(this.map, marker, marker_events_with_mouse[ev]);
          }

          google.maps.event.addListener(marker, 'click', function() {
            this.details = details;

            if (options.click) {
              options.click.apply(this, [this]);
            }

            if (marker.infoWindow) {
              self.hideInfoWindows();
              marker.infoWindow.open(self.map, marker);
            }
          });

          if (options.dragend || marker.fences) {
            google.maps.event.addListener(marker, 'dragend', function() {
              if (marker.fences) {
                self.checkMarkerGeofence(marker, function(m, f) {
                  outside(m, f);
                });
              }
            });
          }

          return marker;
        }
        else {
          throw 'No latitude or longitude defined';
        }
      };

      this.addMarker = function(options) {
        var marker;
        if(options.hasOwnProperty('gm_accessors_')) {
          // Native google.maps.Marker object
          marker = options;
        }
        else {
          if ((options.hasOwnProperty('lat') && options.hasOwnProperty('lng')) || options.position) {
            marker = this.createMarker(options);
          }
          else {
            throw 'No latitude or longitude defined';
          }
        }

        marker.setMap(this.map);

        if(this.markerClusterer)
          this.markerClusterer.addMarker(marker);

        this.markers.push(marker);

        return marker;
      };

      this.addMarkers = function(array) {
        for (var i=0, marker; marker=array[i]; i++) {
          this.addMarker(marker);
        }
        return this.markers;
      };

      this.hideInfoWindows = function() {
        for (var i=0, marker; marker=this.markers[i]; i++){
          if (marker.infoWindow){
            marker.infoWindow.close();
          }
        }
      };

      this.removeMarker = function(marker) {
        for(var i=0; i < this.markers.length; i++) {
          if(this.markers[i] === marker) {
            this.markers[i].setMap(null);
            this.markers.splice(i, 1);
            break;
          }
        }

        return marker;
      };

      this.removeMarkers = function(collection) {
        var collection = (collection || this.markers);
          
        for(var i=0;i < this.markers.length; i++){
          if(this.markers[i] === collection[i])
            this.markers[i].setMap(null);
        }

        var new_markers = [];

        for(var i=0;i < this.markers.length; i++){
          if(this.markers[i].getMap() != null)
            new_markers.push(this.markers[i]);
        }

        this.markers = new_markers;
      };

      // Overlays
      this.drawOverlay = function(options) {
        var overlay = new google.maps.OverlayView();
        overlay.setMap(self.map);

        var auto_show = true;

        if(options.auto_show != null)
          auto_show = options.auto_show;

        overlay.onAdd = function() {
          var el = doc.createElement('div');
          el.style.borderStyle = "none";
          el.style.borderWidth = "0px";
          el.style.position = "absolute";
          el.style.zIndex = 100;
          el.innerHTML = options.content;

          overlay.el = el;

          var panes = this.getPanes();
          if (!options.layer) {
            options.layer = 'overlayLayer';
          }
          var overlayLayer = panes[options.layer];
          overlayLayer.appendChild(el);

          var stop_overlay_events = ['contextmenu', 'DOMMouseScroll', 'dblclick', 'mousedown'];

          for (var ev = 0; ev < stop_overlay_events.length; ev++) {
            (function(object, name) {
              google.maps.event.addDomListener(object, name, function(e){
                if(navigator.userAgent.toLowerCase().indexOf('msie') != -1 && document.all) {
                  e.cancelBubble = true;
                  e.returnValue = false;
                }
                else {
                  e.stopPropagation();
                }
              });
            })(el, stop_overlay_events[ev]);
          }

          google.maps.event.trigger(this, 'ready');
        };

        overlay.draw = function() {
          var projection = this.getProjection();
          var pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(options.lat, options.lng));

          options.horizontalOffset = options.horizontalOffset || 0;
          options.verticalOffset = options.verticalOffset || 0;

          var el = overlay.el;
          var content = el.children[0];

          var content_height = content.clientHeight;
          var content_width = content.clientWidth;

          switch (options.verticalAlign) {
            case 'top':
              el.style.top = (pixel.y - content_height + options.verticalOffset) + 'px';
              break;
            default:
            case 'middle':
              el.style.top = (pixel.y - (content_height / 2) + options.verticalOffset) + 'px';
              break;
            case 'bottom':
              el.style.top = (pixel.y + options.verticalOffset) + 'px';
              break;
          }

          switch (options.horizontalAlign) {
            case 'left':
              el.style.left = (pixel.x - content_width + options.horizontalOffset) + 'px';
              break;
            default:
            case 'center':
              el.style.left = (pixel.x - (content_width / 2) + options.horizontalOffset) + 'px';
              break;
            case 'right':
              el.style.left = (pixel.x + options.horizontalOffset) + 'px';
              break;
          }

          el.style.display = auto_show ? 'block' : 'none';

          if(!auto_show){
            options.show.apply(this, [el]);
          }
        };

        overlay.onRemove = function() {
          var el = overlay.el;

          if(options.remove){
            options.remove.apply(this, [el]);
          }
          else{
            overlay.el.parentNode.removeChild(overlay.el);
            overlay.el = null;
          }
        };

        self.overlays.push(overlay);
        return overlay;
      };

      this.removeOverlay = function(overlay) {
        overlay.setMap(null);
      };

      this.removeOverlays = function() {
        for (var i=0, item; item=self.overlays[i]; i++){
          item.setMap(null);
        }
        self.overlays = [];
      };

      this.removePolylines = function() {
        for (var i=0, item; item=self.polylines[i]; i++){
          item.setMap(null);
        }
        self.polylines = [];
      };

      this.drawPolyline = function(options) {
        var path = [];
        var points = options.path;

        if (points.length){
          if (points[0][0] === undefined){
            path = points;
          }
          else {
            for (var i=0, latlng; latlng=points[i]; i++){
              path.push(new google.maps.LatLng(latlng[0], latlng[1]));
            }
          }
        }

        var polyline_options = {
          map: this.map,
          path: path,
          strokeColor: options.strokeColor,
          strokeOpacity: options.strokeOpacity,
          strokeWeight: options.strokeWeight,
          geodesic: options.geodesic,
          clickable: true,
          editable: false,
          visible: true
        };

        if(options.hasOwnProperty("clickable"))
          polyline_options.clickable = options.clickable;

        if(options.hasOwnProperty("editable"))
          polyline_options.editable = options.editable;

        if(options.hasOwnProperty("icons"))
          polyline_options.icons = options.icons;

        if(options.hasOwnProperty("zIndex"))
          polyline_options.zIndex = options.zIndex;

        var polyline = new google.maps.Polyline(polyline_options);

        var polyline_events = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

        for (var ev = 0; ev < polyline_events.length; ev++) {
          (function(object, name) {
            google.maps.event.addListener(object, name, function(e){
              if (options[name])
                options[name].apply(this, [e]);
            });
          })(polyline, polyline_events[ev]);
        }

        this.polylines.push(polyline);

        return polyline;
      };

      this.drawCircle = function(options) {
        options =  extend_object({
          map: this.map,
          center: new google.maps.LatLng(options.lat, options.lng)
        }, options);

        delete options.lat;
        delete options.lng;
        var polygon = new google.maps.Circle(options);

        var polygon_events = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

        for (var ev = 0; ev < polygon_events.length; ev++) {
          (function(object, name) {
            google.maps.event.addListener(object, name, function(e){
              if (options[name])
                options[name].apply(this, [e]);
            });
          })(polygon, polygon_events[ev]);
        }

        this.polygons.push(polygon);

        return polygon;
      };
      
      this.drawRectangle = function(options) {
        options = extend_object({
          map: this.map
        }, options);

        var latLngBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(options.bounds[0][0], options.bounds[0][1]),
          new google.maps.LatLng(options.bounds[1][0], options.bounds[1][1])
        );
        
        options.bounds = latLngBounds;

        var polygon = new google.maps.Rectangle(options);

        var polygon_events = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

        for (var ev = 0; ev < polygon_events.length; ev++) {
          (function(object, name) {
            google.maps.event.addListener(object, name, function(e){
              if (options[name])
                options[name].apply(this, [e]);
            });
          })(polygon, polygon_events[ev]);
        }
        
        this.polygons.push(polygon);
        
        return polygon;
      };

      this.drawPolygon = function(options) {
        var useGeoJSON = false;
        if(options.hasOwnProperty("useGeoJSON"))
          useGeoJSON = options.useGeoJSON;

        delete options.useGeoJSON;

        options = extend_object({
          map: this.map
        }, options);

        if(useGeoJSON == false)
          options.paths = [options.paths.slice(0)];

        if(options.paths.length > 0) {
          if(options.paths[0].length > 0) {
            options.paths = array_flat(array_map(options.paths, arrayToLatLng, useGeoJSON));
          }
        }

        var polygon = new google.maps.Polygon(options);

        var polygon_events = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

        for (var ev = 0; ev < polygon_events.length; ev++) {
          (function(object, name) {
            google.maps.event.addListener(object, name, function(e){
              if (options[name])
                options[name].apply(this, [e]);
            });
          })(polygon, polygon_events[ev]);
        }

        this.polygons.push(polygon);

        return polygon;
      };

      this.removePolygon = this.removeOverlay;

      this.removePolygons = function() {
        for (var i=0, item; item=self.polygons[i]; i++){
          item.setMap(null);
        }
        self.polygons = [];
      };

      this.getFromFusionTables = function(options) {
        var events = options.events;

        delete options.events;

        var fusion_tables_options = options;

        var layer = new google.maps.FusionTablesLayer(fusion_tables_options);

        for (var ev in events) {
          (function(object, name) {
            google.maps.event.addListener(object, name, function(e){
              events[name].apply(this, [e]);
            });
          })(layer, ev);
        }

        this.layers.push(layer);

        return layer;
      };

      this.loadFromFusionTables = function(options) {
        var layer = this.getFromFusionTables(options);
        layer.setMap(this.map);

        return layer;
      };

      this.getFromKML = function(options) {
        var url = options.url;
        var events = options.events;

        delete options.url;
        delete options.events;

        var kml_options = options;

        var layer = new google.maps.KmlLayer(url, kml_options);

        for (var ev in events) {
          (function(object, name) {
            google.maps.event.addListener(object, name, function(e){
              events[name].apply(this, [e]);
            });
          })(layer, ev);
        }

        this.layers.push(layer);

        return layer;
      };

      this.loadFromKML = function(options) {
        var layer = this.getFromKML(options);
        layer.setMap(this.map);

        return layer;
      };

      // Services
      var travelMode, unitSystem;
      this.getRoutes = function(options) {
        switch (options.travelMode) {
        case 'bicycling':
          travelMode = google.maps.TravelMode.BICYCLING;
          break;
        case 'transit':
          travelMode = google.maps.TravelMode.TRANSIT;
          break;
        case 'driving':
          travelMode = google.maps.TravelMode.DRIVING;
          break;
        // case 'walking':
        default:
          travelMode = google.maps.TravelMode.WALKING;
          break;
        }

        if (options.unitSystem === 'imperial') {
          unitSystem = google.maps.UnitSystem.IMPERIAL;
        }
        else {
          unitSystem = google.maps.UnitSystem.METRIC;
        }

        var base_options = {
          avoidHighways: false,
          avoidTolls: false,
          optimizeWaypoints: false,
          waypoints: []
        };

        var request_options =  extend_object(base_options, options);

        request_options.origin = new google.maps.LatLng(options.origin[0], options.origin[1]);
        request_options.destination = new google.maps.LatLng(options.destination[0], options.destination[1]);
        request_options.travelMode = travelMode;
        request_options.unitSystem = unitSystem;

        delete request_options.callback;

        var self = this;
        var service = new google.maps.DirectionsService();

        service.route(request_options, function(result, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            for (var r in result.routes) {
              if (result.routes.hasOwnProperty(r)) {
                self.routes.push(result.routes[r]);
              }
            }
          }
          if (options.callback) {
            options.callback(self.routes);
          }
        });
      };

      this.removeRoutes = function() {
        this.routes = [];
      };

      this.getElevations = function(options) {
        options = extend_object({
          locations: [],
          path : false,
          samples : 256
        }, options);

        if(options.locations.length > 0) {
          if(options.locations[0].length > 0) {
            options.locations = array_flat(array_map([options.locations], arrayToLatLng,  false));
          }
        }

        var callback = options.callback;
        delete options.callback;

        var service = new google.maps.ElevationService();

        //location request
        if (!options.path) {
          delete options.path;
          delete options.samples;
          service.getElevationForLocations(options, function(result, status){
            if (callback && typeof(callback) === "function") {
              callback(result, status);
            }
          });
        //path request
        } else {
          var pathRequest = {
            path : options.locations,
            samples : options.samples
          };

          service.getElevationAlongPath(pathRequest, function(result, status){
           if (callback && typeof(callback) === "function") {
              callback(result, status);
            }
          });
        }
      };

      // Alias for the method "drawRoute"
      this.cleanRoute = this.removePolylines;

      this.drawRoute = function(options) {
        var self = this;
        this.getRoutes({
          origin: options.origin,
          destination: options.destination,
          travelMode: options.travelMode,
          waypoints : options.waypoints,
          callback: function(e) {
            if (e.length > 0) {
              self.drawPolyline({
                path: e[e.length - 1].overview_path,
                strokeColor: options.strokeColor,
                strokeOpacity: options.strokeOpacity,
                strokeWeight: options.strokeWeight
              });
              if (options.callback) {
                options.callback(e[e.length - 1]);
              }
            }
          }
        });
      };

      this.travelRoute = function(options) {
        if (options.origin && options.destination) {
          this.getRoutes({
            origin: options.origin,
            destination: options.destination,
            travelMode: options.travelMode,
            waypoints : options.waypoints,
            callback: function(e) {
              //start callback
              if (e.length > 0 && options.start) {
                options.start(e[e.length - 1]);
              }

              //step callback
              if (e.length > 0 && options.step) {
                var route = e[e.length - 1];
                if (route.legs.length > 0) {
                  var steps = route.legs[0].steps;
                  for (var i=0, step; step=steps[i]; i++) {
                    step.step_number = i;
                    options.step(step, (route.legs[0].steps.length - 1));
                  }
                }
              }

              //end callback
              if (e.length > 0 && options.end) {
                 options.end(e[e.length - 1]);
              }
            }
          });
        }
        else if (options.route) {
          if (options.route.legs.length > 0) {
            var steps = options.route.legs[0].steps;
            for (var i=0, step; step=steps[i]; i++) {
              step.step_number = i;
              options.step(step);
            }
          }
        }
      };

      this.drawSteppedRoute = function(options) {
        if (options.origin && options.destination) {
          this.getRoutes({
            origin: options.origin,
            destination: options.destination,
            travelMode: options.travelMode,
            waypoints : options.waypoints,
            callback: function(e) {
              //start callback
              if (e.length > 0 && options.start) {
                options.start(e[e.length - 1]);
              }

              //step callback
              if (e.length > 0 && options.step) {
                var route = e[e.length - 1];
                if (route.legs.length > 0) {
                  var steps = route.legs[0].steps;
                  for (var i=0, step; step=steps[i]; i++) {
                    step.step_number = i;
                    self.drawPolyline({
                      path: step.path,
                      strokeColor: options.strokeColor,
                      strokeOpacity: options.strokeOpacity,
                      strokeWeight: options.strokeWeight
                    });
                    options.step(step, (route.legs[0].steps.length - 1));
                  }
                }
              }

              //end callback
              if (e.length > 0 && options.end) {
                 options.end(e[e.length - 1]);
              }
            }
          });
        }
        else if (options.route) {
          if (options.route.legs.length > 0) {
            var steps = options.route.legs[0].steps;
            for (var i=0, step; step=steps[i]; i++) {
              step.step_number = i;
              self.drawPolyline({
                path: step.path,
                strokeColor: options.strokeColor,
                strokeOpacity: options.strokeOpacity,
                strokeWeight: options.strokeWeight
              });
              options.step(step);
            }
          }
        }
      };

      // Geofence
      this.checkGeofence = function(lat, lng, fence) {
        return fence.containsLatLng(new google.maps.LatLng(lat, lng));
      };

      this.checkMarkerGeofence = function(marker, outside_callback) {
        if (marker.fences) {
          for (var i=0, fence; fence=marker.fences[i]; i++) {
            var pos = marker.getPosition();
            if (!self.checkGeofence(pos.lat(), pos.lng(), fence)) {
              outside_callback(marker, fence);
            }
          }
        }
      };

      //add layers to the maps
      this.addLayer = function(layerName, options) {
        //var default_layers = ['weather', 'clouds', 'traffic', 'transit', 'bicycling', 'panoramio', 'places'];
        options = options || {};
        var layer;
          
        switch(layerName) {
          case 'weather': this.singleLayers.weather = layer = new google.maps.weather.WeatherLayer(); 
            break;
          case 'clouds': this.singleLayers.clouds = layer = new google.maps.weather.CloudLayer(); 
            break;
          case 'traffic': this.singleLayers.traffic = layer = new google.maps.TrafficLayer(); 
            break;
          case 'transit': this.singleLayers.transit = layer = new google.maps.TransitLayer(); 
            break;
          case 'bicycling': this.singleLayers.bicycling = layer = new google.maps.BicyclingLayer(); 
            break;
          case 'panoramio': 
              this.singleLayers.panoramio = layer = new google.maps.panoramio.PanoramioLayer();
              layer.setTag(options.filter);
              delete options.filter;

              //click event
              if(options.click) {
                google.maps.event.addListener(layer, 'click', function(event) {
                  options.click(event);
                  delete options.click;
                });
              }
            break;
            case 'places': 
              this.singleLayers.places = layer = new google.maps.places.PlacesService(this.map);

              //search and  nearbySearch callback, Both are the same
              if(options.search || options.nearbySearch) {
                var placeSearchRequest  = {
                  bounds : options.bounds || null,
                  keyword : options.keyword || null,
                  location : options.location || null,
                  name : options.name || null,
                  radius : options.radius || null,
                  rankBy : options.rankBy || null,
                  types : options.types || null
                };

                if(options.search) {
                  layer.search(placeSearchRequest, options.search);
                }

                if(options.nearbySearch) {
                  layer.nearbySearch(placeSearchRequest, options.nearbySearch);
                }
              }

              //textSearch callback
              if(options.textSearch) {
                var textSearchRequest  = {
                  bounds : options.bounds || null,
                  location : options.location || null,
                  query : options.query || null,
                  radius : options.radius || null
                };
                
                layer.textSearch(textSearchRequest, options.textSearch);
              }
            break;
        }

        if(layer !== undefined) {
          if(typeof layer.setOptions == 'function') {
            layer.setOptions(options);
          }
          if(typeof layer.setMap == 'function') {
            layer.setMap(this.map);
          }

          return layer;
        }
      };

      //remove layers
      this.removeLayer = function(layerName) {
        if(this.singleLayers[layerName] !== undefined) {
           this.singleLayers[layerName].setMap(null);
           delete this.singleLayers[layerName];
        }
      };
      
      this.toImage = function(options) {
        var options = options || {};
        var static_map_options = {};
        static_map_options['size'] = options['size'] || [this.el.clientWidth, this.el.clientHeight];
        static_map_options['lat'] = this.getCenter().lat();
        static_map_options['lng'] = this.getCenter().lng();

        if(this.markers.length > 0) {
          static_map_options['markers'] = [];
          for(var i=0; i < this.markers.length; i++) {
            static_map_options['markers'].push({
              lat: this.markers[i].getPosition().lat(),
              lng: this.markers[i].getPosition().lng()
            });
          }
        }

        if(this.polylines.length > 0) {
          var polyline = this.polylines[0];
          static_map_options['polyline'] = {};
          static_map_options['polyline']['path'] = google.maps.geometry.encoding.encodePath(polyline.getPath());
          static_map_options['polyline']['strokeColor'] = polyline.strokeColor
          static_map_options['polyline']['strokeOpacity'] = polyline.strokeOpacity
          static_map_options['polyline']['strokeWeight'] = polyline.strokeWeight
        }
        
        return GMaps.staticMapURL(static_map_options);
      };

      this.addMapType = function(mapTypeId, options) {
        if(options.hasOwnProperty("getTileUrl") && typeof(options["getTileUrl"]) == "function") {
          
          options.tileSize = options.tileSize || new google.maps.Size(256, 256);
          
          var mapType = new google.maps.ImageMapType(options);

          this.map.mapTypes.set(mapTypeId, mapType);
        }
        else {
          throw "'getTileUrl' function required";
        }
      };

      this.addOverlayMapType = function(options) {
        if(options.hasOwnProperty("getTile") && typeof(options["getTile"]) == "function") {
          var overlayMapTypeIndex = options.index;

          delete options.index;

          this.map.overlayMapTypes.insertAt(overlayMapTypeIndex, options);
        }
        else {
          throw "'getTile' function required";
        }
      };

      this.removeOverlayMapType = function(overlayMapTypeIndex) {
        this.map.overlayMapTypes.removeAt(overlayMapTypeIndex);
      };
      
    };

    GMaps.Route = function(options) {
      this.map = options.map;
      this.route = options.route;
      this.step_count = 0;
      this.steps = this.route.legs[0].steps;
      this.steps_length = this.steps.length;

      this.polyline = this.map.drawPolyline({
        path: new google.maps.MVCArray(),
        strokeColor: options.strokeColor,
        strokeOpacity: options.strokeOpacity,
        strokeWeight: options.strokeWeight
      }).getPath();

      this.back = function() {
        if (this.step_count > 0) {
          this.step_count--;
          var path = this.route.legs[0].steps[this.step_count].path;
          for (var p in path){
            if (path.hasOwnProperty(p)){
              this.polyline.pop();
            }
          }
        }
      };

      this.forward = function() {
        if (this.step_count < this.steps_length) {
          var path = this.route.legs[0].steps[this.step_count].path;
          for (var p in path){
            if (path.hasOwnProperty(p)){
              this.polyline.push(path[p]);
            }
          }
          this.step_count++;
        }
      };
    };

    // Geolocation (Modern browsers only)
    GMaps.geolocate = function(options) {
      var complete_callback = options.always || options.complete;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          options.success(position);

          if (complete_callback) {
            complete_callback();
          }
        }, function(error) {
          options.error(error);

          if (complete_callback) {
            complete_callback();
          }
        }, options.options);
      }
      else {
        options.not_supported();

        if (complete_callback) {
          complete_callback();
        }
      }
    };

    // Geocoding
    GMaps.geocode = function(options) {
      this.geocoder = new google.maps.Geocoder();
      var callback = options.callback;
      if (options.hasOwnProperty('lat') && options.hasOwnProperty('lng')) {
        options.latLng = new google.maps.LatLng(options.lat, options.lng);
      }

      delete options.lat;
      delete options.lng;
      delete options.callback;
      this.geocoder.geocode(options, function(results, status) {
        callback(results, status);
      });
    };

    // Static maps
    GMaps.staticMapURL = function(options){
      var parameters = [];
      var data;

      var static_root = 'http://maps.googleapis.com/maps/api/staticmap';
      if (options.url){
        static_root = options.url;
        delete options.url;
      }
      static_root += '?';

      var markers = options.markers;
      delete options.markers;
      if (!markers && options.marker){
        markers = [options.marker];
        delete options.marker;
      }

      var polyline = options.polyline;
      delete options.polyline;

      /** Map options **/
      if (options.center){
        parameters.push('center=' + options.center);
        delete options.center;
      }
      else if (options.address){
        parameters.push('center=' + options.address);
        delete options.address;
      }
      else if (options.lat){
        parameters.push(['center=', options.lat, ',', options.lng].join(''));
        delete options.lat;
        delete options.lng;
      }
      else if (options.visible){
        var visible = encodeURI(options.visible.join('|'));
        parameters.push('visible=' + visible);
      }

      var size = options.size;
      if (size){
        if (size.join){
          size = size.join('x');
        }
        delete options.size;
      }
      else {
        size = '630x300';
      }
      parameters.push('size=' + size);

      if (!options.zoom){
        options.zoom = 15;
      }

      var sensor = options.hasOwnProperty('sensor') ? !!options.sensor : true;
      delete options.sensor;
      parameters.push('sensor=' + sensor);

      for (var param in options){
        if (options.hasOwnProperty(param)){
          parameters.push(param + '=' + options[param]);
        }
      }

      /** Markers **/
      if (markers){
        var marker, loc;

        for (var i=0; data=markers[i]; i++){
          marker = [];

          if (data.size && data.size !== 'normal'){
            marker.push('size:' + data.size);
          }
          else if (data.icon){
            marker.push('icon:' + encodeURI(data.icon));
          }

          if (data.color){
            marker.push('color:' + data.color.replace('#', '0x'));
          }

          if (data.label){
            marker.push('label:' + data.label[0].toUpperCase());
          }

          loc = (data.address ? data.address : data.lat + ',' + data.lng);

          if (marker.length || i === 0){
            marker.push(loc);
            marker = marker.join('|');
            parameters.push('markers=' + encodeURI(marker));
          }
          // New marker without styles
          else {
            marker = parameters.pop() + encodeURI('|' + loc);
            parameters.push(marker);
          }
        }
      }

      /** Polylines **/
      function parseColor(color, opacity){
        if (color[0] === '#'){
          color = color.replace('#', '0x');

          if (opacity){
            opacity = parseFloat(opacity);
            opacity = Math.min(1, Math.max(opacity, 0));
            if (opacity === 0){
              return '0x00000000';
            }
            opacity = (opacity * 255).toString(16);
            if (opacity.length === 1){
              opacity += opacity;
            }

            color = color.slice(0,8) + opacity;
          }
        }
        return color;
      }

      if (polyline){
        data = polyline;
        polyline = [];

        if (data.strokeWeight){
          polyline.push('weight:' + parseInt(data.strokeWeight, 10));
        }

        if (data.strokeColor){
          var color = parseColor(data.strokeColor, data.strokeOpacity);
          polyline.push('color:' + color);
        }

        if (data.fillColor){
          var fillcolor = parseColor(data.fillColor, data.fillOpacity);
          polyline.push('fillcolor:' + fillcolor);
        }

        var path = data.path;
        if (path.join){
          for (var j=0, pos; pos=path[j]; j++){
            polyline.push(pos.join(','));
          }
        }
        else {
          polyline.push('enc:' + path);
        }

        polyline = polyline.join('|');
        parameters.push('path=' + encodeURI(polyline));
      }

      parameters = parameters.join('&');
      return static_root + parameters;
    };

    //==========================
    // Polygon containsLatLng
    // https://github.com/tparkin/Google-Maps-Point-in-Polygon
    // Poygon getBounds extension - google-maps-extensions
    // http://code.google.com/p/google-maps-extensions/source/browse/google.maps.Polygon.getBounds.js
    if (!google.maps.Polygon.prototype.getBounds) {
      google.maps.Polygon.prototype.getBounds = function(latLng) {
        var bounds = new google.maps.LatLngBounds();
        var paths = this.getPaths();
        var path;

        for (var p = 0; p < paths.getLength(); p++) {
          path = paths.getAt(p);
          for (var i = 0; i < path.getLength(); i++) {
            bounds.extend(path.getAt(i));
          }
        }

        return bounds;
      };
    }

    // Polygon containsLatLng - method to determine if a latLng is within a polygon
    google.maps.Polygon.prototype.containsLatLng = function(latLng) {
      // Exclude points outside of bounds as there is no way they are in the poly
      var bounds = this.getBounds();

      if (bounds !== null && !bounds.contains(latLng)) {
        return false;
      }

      // Raycast point in polygon method
      var inPoly = false;

      var numPaths = this.getPaths().getLength();
      for (var p = 0; p < numPaths; p++) {
        var path = this.getPaths().getAt(p);
        var numPoints = path.getLength();
        var j = numPoints - 1;

        for (var i = 0; i < numPoints; i++) {
          var vertex1 = path.getAt(i);
          var vertex2 = path.getAt(j);

          if (vertex1.lng() < latLng.lng() && vertex2.lng() >= latLng.lng() || vertex2.lng() < latLng.lng() && vertex1.lng() >= latLng.lng()) {
            if (vertex1.lat() + (latLng.lng() - vertex1.lng()) / (vertex2.lng() - vertex1.lng()) * (vertex2.lat() - vertex1.lat()) < latLng.lat()) {
              inPoly = !inPoly;
            }
          }

          j = i;
        }
      }

      return inPoly;
    };

    google.maps.LatLngBounds.prototype.containsLatLng = function(latLng) {
      return this.contains(latLng);
    };

    google.maps.Marker.prototype.setFences = function(fences) {
      this.fences = fences;
    };

    google.maps.Marker.prototype.addFence = function(fence) {
      this.fences.push(fence);
    };

    return GMaps;
  }(this));

  var coordsToLatLngs = function(coords, useGeoJSON) {
    var first_coord = coords[0];
    var second_coord = coords[1];

    if(useGeoJSON) {
      first_coord = coords[1];
      second_coord = coords[0];
    }

    return new google.maps.LatLng(first_coord, second_coord);
  };

  var arrayToLatLng = function(coords, useGeoJSON) {
    for(var i=0; i < coords.length; i++) {
      if(coords[i].length > 0 && typeof(coords[i][0]) != "number") {
        coords[i] = arrayToLatLng(coords[i], useGeoJSON);
      }
      else {
        coords[i] = coordsToLatLngs(coords[i], useGeoJSON);
      }
    }

    return coords;
  };

  var extend_object = function(obj, new_obj) {
    if(obj === new_obj) return obj;

    for(var name in new_obj) {
      obj[name] = new_obj[name];
    }

    return obj;
  };

  var replace_object = function(obj, replace) {
    if(obj === replace) return obj;

    for(var name in replace) {
      if(obj[name] != undefined)
        obj[name] = replace[name];
    }

    return obj;
  };

  var array_map = function(array, callback) {
    var original_callback_params = Array.prototype.slice.call(arguments, 2);

    if (Array.prototype.map && array.map === Array.prototype.map) {
      return Array.prototype.map.call(array, function(item) {
        callback_params = original_callback_params;
        callback_params.splice(0, 0, item);

        return callback.apply(this, callback_params);
      });
    }
    else {
      var array_return = [];
      var array_length = array.length;

      for(var i = 0; i < array_length; i++) {
        callback_params = original_callback_params;
        callback_params = callback_params.splice(0, 0, array[i]);
        array_return.push(callback.apply(this, callback_params));
      }

      return array_return;
    }
  };

  var array_flat = function(array) {
    new_array = [];

    for(var i=0; i < array.length; i++) {
      new_array = new_array.concat(array[i]);
    }

    return new_array;
  };

  if(this.GMaps) {
    /*Extension: Styled map*/
    GMaps.prototype.addStyle = function(options){       
      var styledMapType = new google.maps.StyledMapType(options.styles, options.styledMapName);
      this.map.mapTypes.set(options.mapTypeId, styledMapType);
    };
    GMaps.prototype.setStyle = function(mapTypeId){     
      this.map.setMapTypeId(mapTypeId);
    };
  }

  return GMaps;
});