define(['Backbone'], function(B){
    var Model = Backbone.Model.extend({
        urlRoot:'${pluginUrl}/admin',
        schema:{
            modelName:{
                type:'String'
            },
            title:{
                type:'String'
            },
            labelAttr:{
                type:'String'
            },

            hidden:{
                type:'Checkbox'
            }
        },
        idAttribute:'modelName',
        toString:function(){
          return this.get('title');
        },
        // defaults:defaults,
        initialize:function () {
        },
//        parse:function(resp){
//            return resp.payload;
//        },
        get:function (key) {
            if (key && key.indexOf('.') > -1) {
                var split = key.split('.');
                var val = this.attributes;
                while (split.length && val)
                    val = val[split.shift()];

                return val;
            }
            return Backbone.Model.prototype.get.call(this, key);
        }

    });

    var Collection = Backbone.Collection.extend({
        model:Model,
        url:'${pluginUrl}/admin/',
        parse:function(resp){
            return resp.payload;
        }
    });
    return new Collection();
});