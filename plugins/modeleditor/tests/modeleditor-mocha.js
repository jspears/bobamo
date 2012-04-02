var ModelEditor = require('../modeleditor'),
    Plugin = require('../../../lib/plugin-api'),
    should = require('should'), express = require('../../../examples/simple/node_modules/express');

describe("Model Editor Plugin", function(){

    it('should do stuff', function(done){
        var app = express.createServer();
        app.configure(function () {
            app.use(express.bodyParser());
            app.use(express.methodOverride());
            app.use(app.router);
            app.use(express.static(__dirname + '/public'));
            var me = new ModelEditor({
                baseUrl:'/bobamo'
            }, app);
            me.routes();
            me.generate({
                render:function(path, options){
                    console.log('path', path, 'options',options);
                }
            }, 'edit');
        });

        done();
    })


})