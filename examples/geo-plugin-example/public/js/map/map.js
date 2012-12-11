define(['Backbone', 'underscore', 'collections/Address/finder/search', 'libs/editors/gmaps'], function (B, _, collection, GMaps) {
    var MAP;
    var view = Backbone.View.extend({
        collection:collection,
        initialize:function () {

            collection.on('list-data', function(){
                this.addMarkers()
            }, this);
        },
        addMarkers:function () {
            console.log('calling addMarkers')
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
            var $div = $('<div></div>')
            if (!MAP)
               MAP = this.map = new GMaps({
                el:$div[0],
                lat:near.lat,
                lng:near.lon,
                width:'500px',
                height:'350px'
            });
            else{
                this.map = MAP;
                this.map.setCenter(near.lat, near.lon);
            }
            this.$el.append(MAP.el);
//            if (this.collection.length)
//                this.addMarkers();
            return this;
        }
    })

    return view;

});