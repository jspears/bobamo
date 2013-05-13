define(['app', 'Backbone', 'underscore'], function (App, B, _) {
    var LoginStateModel = B.Model.extend({
        url:'${pluginUrl}/check',
        parse:function(res){
          return res.payload;
        },
        initialize:function(){
            B.Model.prototype.initialize.apply(this, _.toArray(arguments));
            this.on('change', function(){
               if (this.get('username')){
                   this.trigger('login')
               }else{
                   this.trigger('logout');
               }
            }, this);
            return this;
        },
        set:function (obj) {

            var ret = B.Model.prototype.set.apply(this, _.toArray(arguments));

            if (!obj) {
                this.trigger('logout');
            } else {
                this.trigger('login', this);
            }
            return ret;

        }
    });
    var state = new LoginStateModel();
    state.fetch();
    return state;
});