var should = require('should'), express = require('../examples/simple/node_modules/express'), PluginManager = require('../lib/plugin-manager'),
    User = require('../examples/model/user'),
    Group = require('../examples/model/group'),
    mongoose = require('mongoose');


describe('Plugin Manager', function(){
    var app = express.createServer();
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    it('should boot', function(done){
        var manager = new PluginManager({mongoose:mongoose}, app);
        console.log('manager',manager.app().modelPaths);
        done();
    })

})