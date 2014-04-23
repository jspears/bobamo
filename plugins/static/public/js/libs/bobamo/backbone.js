define(['Backbone.Orig'], function(Backbone){
    Backbone.View.prototype.remove = function(){
        this.unbind();
        this.undelegateEvents();
        //this.stopListening(this.model);
    }
    return Backbone;
})