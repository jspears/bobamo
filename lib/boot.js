/**
 * Module dependencies.
 */

var  bobamo = require('../index')
    express = bobamo.expressApi
    ;

function boot(conf, context){
    context = context || '/';
    var app = module.exports = express();

  // Configuration
    app.configure(function () {
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.cookieParser());
      app.use(express.cookieSession({secret:'super duper secret'}))
      app.use(context, bobamo.express(conf));
      app.use(app.router);
      app.use(express.static((conf.basepath || __dirname) + '/public'));

    });

    app.configure('development', function () {
        app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
    });

    return app;
}

module.exports = boot;
