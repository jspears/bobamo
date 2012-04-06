define(['jquery', 'Backbone.Form', 'libs/editors/map'], function ($, Form, GoogleMaps) {
    var editors = Form.editors;
    var MapEditor = editors.MapEditor = editors.Base.extend({
        initialize:function (options) {
            editors.Base.prototype.initialize.call(this, options);

            this.$el.append(this.$lat, this.$lng);
        },
        render:function () {
            var $map = $('<div class="map" style="height:200px;width:300px"></div>');
            this.$el.append($map);
            this.gmaps = new GoogleMaps;
            var latlng = this.model && this.model.get(this.key);
            this.gmaps.createMap($map[0], latlng);
            this.setValue(latlng);
            return this;
        },
        setValue:function (value, lng) {
            var lat = value && value.lat || value, lng = lng || value && value.lng;
            var latlng = {lat:lat, lng:lng}
            if (lat && lng) {
                this.gmaps.setCenter(latlng);
                this.gmaps.placeMarker({draggable:true, position:latlng})
            }
            return this;
        },
        getValue:function () {
            var pos = this.gmaps.getPosition()
            return {
                lat:pos.Xa,
                lng:pos.Ya
            }
        }
    });
    return MapEditor;

});