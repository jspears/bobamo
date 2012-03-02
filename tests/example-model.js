var Backbone = require('../public/js/libs/backbone/backbone-0.9.1-amd.js');
function validateEmail(){

}

var User = Backbone.Model.extend({
    schema: {
        email:      { dataType: 'email', validators: ['required', validateEmail] },
        start:      { type: 'DateTime' },
        contact:    { type: 'Object', subSchema: {
            name: {},
            phone: {}
        }},
        notes:      { type: 'List' }
    }
});
module.exports = User;