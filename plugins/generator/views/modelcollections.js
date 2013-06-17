define([
    'underscore',
    'Backbone'
], function(_, Backbone) {
    "use strict";

    //we define these together because they often link together and if they are in seperate callbacks bad things happen.

    var schema //${nl()} = {{json model.schemaFor(model.fieldsets || model.edit_fields)}};
    var defaults//${nl()} = {{json model.defaults || {} }};
    var Model = Backbone.Model.extend({
        urlRoot:'${api}/${urlRoot}',
        schema:schema,
        defaults:defaults,
        initialize: function() {},
        parse:function(resp) {

            console.log('/${api}/${model.modelName}model#parse', resp);
            var fix  = resp.payload ? resp.payload : resp
            return _.isArray(fix) ? fix[0] : fix;
        },
        get:function(key){
            if (key && key.indexOf('.') > -1){
                var split = key.split('.');
                var val = this.attributes;
                while (split.length && val)
                    val = val[split.shift()];

                return val;
            }
            return Backbone.Model.prototype.get.call(this, key);
        },
        labelAttr:"${model.labelAttr}",
        toString:function(){
            if (this.labelAttr)
                return this.get(this.labelAttr);

            return Backbone.Model.prototype.toString.call(this);
        }

    });
    var Collection = Backbone.Collection.extend({
        model: Model,
        url:'${api}/${urlRoot}',
        initialize: function() {
             this.total = -1;
        },
        parse:function(resp) {
            console.log('Collection#parse ${model.modelName}', resp.payload);
            this.total = resp.total;
            return resp.payload ? resp.payload : resp;
        },
        _sorted:function(callback){
            if (!this.params){
                this.params = { limit:10, skip:0}
            }
            if (!this.params.sort)
                this.params.sort = '_id:1';
            console.log('params', this.params)
            this.fetch({data:_.omit(this.params, 'sorts'), success:callback});
        },

        nextId:function(callback){
            var current  = this.currentId || this.models.length && this.models[0].id;
            if (current){
                var model = this.get(current);
                var pos =model && this.models.indexOf(model);
                if (pos > -1){
                    if ( pos+1 < this.models.length ){
                       return callback(this.at(pos+1).id);
                    }
                }
                if (this.params && this.total && this.params.skip < this.total){
                        //searched but didn't find, this is tricky, its my best guess.
                        if (this.params)
                            this.params.skip += this.params.limit;
                 }
            }
            //could not find it anywhere
            if (this.params && this.params.skip && this.params.skip > this.total){
                return callback(null);
            }
            this._sorted(_.bind(this.nextId, this, callback));
        },
        previousId:function(callback){
            var current  = this.currentId || this.models.length && this.models[0].id;
            if (current){
                var model = this.get(current);
                var pos =model && this.models.indexOf(model) - 1;
                if (pos > -1){
                        return callback(this.at(pos).id);
                }
                if (this.params && this.total && this.params.skip > 0){
                    //searched but didn't find, this is tricky, its my best guess.
                    if (this.params)
                        this.params.skip = Math.max(this.params.skip - this.params.limit, 0);
                }
            }
            //could not find it anywhere
            if (this.params && this.params.skip && this.params.skip <= 0){
                return callback(null);
            }
            this._sorted(_.bind(this.previousId, this, callback));
        },
        search:function(q, success, failure){
            this.fetch({
                data:{
                    filter:{
                        '${model.labelAttr}':q
                    }
                },
                processJson:true,
                success:success,
                failure:failure
            })
        }
    });


    return {
        Model:Model,
        Collection:Collection
    };

});
