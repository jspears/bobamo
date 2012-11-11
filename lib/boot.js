/**
 * Module dependencies.
 */

var express = require('express')
    , bobamo = require('../index')
    ;

function boot(conf, context){
    context = context || '/';
    var app = module.exports = express();

  // Configuration
    app.configure(function () {
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.cookieParser());
      app.use(express.session({secret:'super duper secret'}))
      app.use(context, bobamo.express(conf));
      app.use(app.router);
      app.use(express.static((conf.pwd || __dirname) + '/public'));

    });

    app.configure('development', function () {
        app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
    });

    return app;
}

module.exports = boot;
