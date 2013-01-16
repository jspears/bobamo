var haml = require('../haml');

haml.render(__dirname+'/../json-schema-browser/views/index.haml', {}, function(e, r){
   console.log('hello', e,r);
});