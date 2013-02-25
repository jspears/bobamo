define(['Backbone'], function(Backbone){
    var url = "${pluginUrl}/renderers"
    var Collection = Backbone.Collection.extend({
        url:url,
        parse:function(resp){
            return resp.payload
        },
        model:Backbone.Model.extend({
            idAttribute:"_id",
            urlRoot:function(){
              return url+'/'+this.id
            },
            toString:function(){
                return this.get('name')
            }
        })
    })
    return new Collection;

})