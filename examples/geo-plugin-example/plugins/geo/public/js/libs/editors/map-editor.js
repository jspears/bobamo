define(['jquery', 'Backbone.Form', 'libs/editors/gmaps'], function ($, Form, GMaps) {
    var editors = Form.editors;
    var MapEditor = editors.MapEditor = editors.Base.extend({
        initialize:function (options) {
            editors.Base.prototype.initialize.call(this, options);

            this.$el.append(this.$lat, this.$lng);
        },
        render:function () {
            var $map = $('<div class="map"></div>');
            this.$el.append($map);
            var self = this;
            var location = this.model && this.model.get(this.key);
            this.gmaps = new GMaps(_.extend({el:$map[0],height:'200px', width:'300px',lng:-77.0239019 , lat: 38.893738},location));

            return this;
        },
        setValue:function (value, lng) {
            var lat = value && value.lat || value, lng = lng || value && value.lng;
            var latlng = {lat:lat, lng:lng}
            if (lat && lng) {
                this.gmaps.setCenter(latlng);
                this.gmaps.addMarker(_.extend({draggable:true}, latlng));
            }
            return this;
        },
        getValue:function () {
            var pos = this.gmaps.getCenter()
            return {
                lat:pos.lat(),
                lng:pos.lng()
            }
        }
    });
    return MapEditor;

});