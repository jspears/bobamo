/**
 * Module dependencies.
 */

require('./lib/geomodel');

require('bobamo').app({plugin:['geo'],uri:'mongodb://localhost/bobamo_development', pluginDir:__dirname+'/plugins'}).listen(3002);
console.log('started the geo-plugin-example on port 3002');