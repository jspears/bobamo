/**
 * Module dependencies.
 */

require('bobamo').app({plugin:['geo'],uri:'mongodb://localhost/bobamo_geo_development', pluginDir:__dirname+'/plugins'}).listen(3002);

require('./lib/geomodel');

console.log('started the geo-plugin-example on port 3002');