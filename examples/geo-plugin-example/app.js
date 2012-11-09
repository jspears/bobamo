/**
 * Module dependencies.
 */

require('./lib/geomodel');
require('bobamo').app({plugin:['geo'],pluginDir:__dirname+'/plugins', uri:'mongodb://localhost/bobamo_development', pwd:__dirname}).listen(3002);
console.log('started the geo-plugin-example on port 3002');