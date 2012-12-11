define(['Backbone.Form', 'underscore', 'jquery', 'libs/editors/gmaps', 'libs/bootstrap/js/bootstrap-typeahead'], function (Form, _, $, GMaps) {

    var ResultItem = function (opts) {
        _.extend(this, opts);

        this.toString = function () {
            return this.formatted_address || "";
        }
        this.toLowerCase = function () {
            return this.toString().toLowerCase();
        }
        this.replace = function () {
            var str = this.toString();
            return str.replace.apply(str, _.toArray(arguments));
        }
        this.toJSON = function () {
            var loc = this.geometry.location
            return {
                formatted_address:this.toString(),
                lat:this.lat || loc.lat(),
                lon:this.lon || loc.lng()
            }
        }

    }
    var GeoView = Form.editors.LocationEditor = Form.editors.Text.extend({
        render:function () {
            Form.editors.Text.prototype.render.call(this);
            var _this = this;
            var setValue = _.bind(this.setValue, this);
            this.$addr = this.$el.typeahead({
                delay:0,
                minLength:6,
                item:'<li><a href="#_ignore="></a></li>',
                sorter:function (itm) {
                    return itm;
                },
                matcher:function () {
                    return true;
                },
                updater:function (event, ui) {
                    setValue(event);
                    return event;
                },
                source:_.bind(this.load, this)
            });


            return this;
        },
        setValue:function (value) {

            Form.editors.Text.prototype.setValue.call(this, value && value.toJSON ? value : new ResultItem(value));
            this.$el.val(value.formatted_address);
            this.value = value;
        },
        load:function (req, callback) {
            req = req || {term:this.$addr.val()};
            GMaps.geocode({
                address:this.$el.val(),
                callback:function (res, status) {
                    callback(_.map(res, function (v) {
                        return new ResultItem(v);
                    }))
                }
            });

            return this;
        },
        getValue:function () {
            return this.value.toJSON ? this.value.toJSON() : this.value;
        }
    });
    return GeoView;
});