define(['Backbone'], function(Backbone){
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
            },
            description:{
                type:'String'
            }
        },
        defaults:{
            description:'No Description'
        },
        idAttribute:'modelName',
        toString:function(){
          return this.get('title');
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