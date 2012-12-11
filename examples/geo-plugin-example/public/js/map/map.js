define(['Backbone', 'underscore', 'collections/Address/finder/search', 'libs/editors/gmaps'], function (B, _, collection, GMaps) {

    var view = Backbone.View.extend({
        collection:collection,
        initialize:function () {

            this.collection.on('fetch', this.addMarkers, this);
        },
        addMarkers:function () {
            this.clearMarkers();
            if (this.map)
                this.collection.each(function (v) {
                    var loc = v.get('location');
                    this.map.addMarker({
                        lat:loc.lat,
                        lng:loc.lon,
                        title:v.get('name')
                    })
                }, this);
            this.map.fitZoom();
        },
        clearMarkers:function () {
            if (this.map)
                this.map.removeMarkers();
        },
        render:function (options) {
            var near = this.collection.finder.get('near')
            this.map = new GMaps({
                el:this.$el[0],
                lat:near.lat,
                lng:near.lon,
                width:'500px',
                height:'350px'
            });
            if (this.collection.length)
                this.addMarkers();
            return this;
        }
    })

    return view;

});