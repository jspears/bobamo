define(['Backbone'], function(Backbone){
    var url = "${pluginUrl}/admin/renderer"
    var Collection = Backbone.Collection.extend({
        url:url,
        parse:function(resp){
            return resp.payload
        },
        model:Backbone.Model.extend({
            idAttribute:"_id",
            urlRoot:url,
            toString:function(){
                return this.get('name')
            }
        })
    })
    return new Collection;

})