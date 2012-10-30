#Bobamo
Its basically a crud infrastructure for [mongoose](http://mongoosejs.com), [backbone](http://documentcloud.github.com/backbone/), [mers](https://github.com/jspears/mers),
[backbone forms](https://github.com/powmedia/backbone-forms) and [twitter bootstrap](http://twitter.github.com/bootstrap/). The idea
is you define your model and a little extra and it generates the crud on demand.    It doesn't leave you in the
box though, you can easily change any part of the generated stuff by making it static and putting in the public
directory.   This allows for easy customization.   You can at your own risk modify the scaffolding generated in views/generator

##Express
Recently Bobamo has been refactored as a express plugin.  This gives an easy installation method, (npm) and
relatively easy configuration.

Just add bobamo to your package.json, npm install then configure app.js to use bobamo

```javascript

 app.use(bobamo.express({uri:'mongodb://localhost/bobamo_development'}))

```
You can also specify a context to host both the rest and javascript from

```javascript

 app.use('/context', bobamo.express({uri:'mongodb://localhost/bobamo_development'}))

```

You can find examples of this under examples/simple and examples/login-example.

A running example of the simple app is [http://bobamo.aws.af.cm/index.html](http://bobamo.aws.af.cm/index.html)


## Subclass
Because everything is scoped within requirejs, subclassing is pretty easy. Say you wanted to do something to the
user view create a javascript file 
  
  public/js/views/user/list.js
  
```
  require(['Backbone','jquery', 'js/super/views/user/list'], function(Backbone, $, ListView){
    var NewListView = ListView.extend({
      render:function(obj){
       //do something special
      }
    });
   return NewListView; // do not forget to return it.
  
  });
```

That's it.   Because the file is in the same spot, require will load it instead of the original, and the original file
is now uder the js/super/ designation.   

## Override
Bobamo uses express.static to first look for a static version of the file.  If it finds it, it returns it.  This allows
for easy modification of existing code.  Just put it in the corresponding public/ directory and it will be returned
instead of the scaffolding.


## Why?
What makes Bobamo different, than railwayjs, rails, grails, roo...

* No scaffolding commands.  Because the infrastructure is built at runtime, through intraspection of the Mongoose Model,
no scaffolding required.
* Extendable, as features get added to Bobamo you can benefit from them without loosing what you have.   See the subclassing
  up top.  It should make it easier to use the parts you want and skip the parts you don't.
* Single language.  No more writing server side in Ruby/PHP/Java and client side in javascript, its all javascript so
  less context switches, easier to share code between client/server.
* Client oriented, AKA SOFEA (Server Oreinted Front End Architecture), Server does not do any view work, so maintaining
state is dramatically easier.  All data access is done through JSON/REST calls.  This allows for easy extensibility.
* Dynamic - Only the code needed by the client is sent to the client. This is accomplished via RequireJS.   At some point it
  should be possible to compile it into one big javascript, but for now, this is how it works.
* Looks Nice - Thanks to the Twitter Bootstap code it is relatively pretty.

## Features

* Bookmarkable - All views are bookmarkable, for your browsers convience.  In addition forward/back buttons should work.
* Pagination - Pagination is implemented in list views.
* Sortable - Fields are sortable.
* Easy - Well easy is in the eye of the beholder.
* Wizard Support - If the fields are grouped as described below you get a wizard interface.   Nice if you like wizards.
* Finders - Just add a static function with no arguments, or one with a display property
    to your  mongoose class and a new finder is created.
* Image Upload/Download - Added the ability to add an image uploader downloader in 2 lines of code.



## Configuration
Each Mongoose schema can be annotated with a display object, in addition each field in the schema can be annotated.


A Schema can have the following annotations

* title (The name of the schema, if empty it will be titlecased object name)
* plural (The plural name of the schema, if empty an attempt a generating a plural name will happen.
* fields (an array of fields that are editable. see [backbone forms](https://github.com/powmedia/backbone-forms) for more
 information.

A Field can have the following annotations

* title (The label for the field, if empty an attempt to change it to title case happens)
* validate (Currently on Regex and Required are supported)
* type [see backbone forms](https://github.com/powmedia/backbone-forms), 'Text','Password', 'Radio', 'MultiSelect', 'Number','Date','DateTime'
* dataType [see backbone forms](https://github.com/powmedia/backbone-forms) 'String', 'Number', 'Array','Object','Date'
* ro - read only
* display - 'none' do send to client, 'hidden', hidden field, visible (default).
* wizards - To create a wizard just define the fields in the model that should be in each step like this

```javascript
var EmployeeSchema = new Schema({
    name:{type:String}
    ... other properteis

}, {

display:{
        fieldsets:[
            {legend:'Identity',  help:'Enter your identity information here.', fields:['firstName','lastName','title', 'department']},
            {legend:'Contact', fields:['officePhone', 'cellPhone','email','twitterId']},
            {legend:'Profile', fields:['picture','blogUrl', 'manager','reports']}
        ]
    }
});

```

Soon you should be able to edit these via an admin UI.
Many-To-One support exists.
One-To-Many support exists.




```javascript
var UserSchema = new Schema({
    username:{type:String, required:true, unique:true, index:true},
    first_name:{type:String},
    last_name:{type:String},
    twitter:{type:String,required:true, validate: /^@[a-zA-Z0-9]*$/i },
    email:{type:String},
    _password:{type:String},
    groups:[
        { type:Schema.ObjectId, ref:'group', index:true}
    ],

    created_at:{type:Date, display:{display:'none'}},
    created_by:{type:Schema.ObjectId, ref:'user'},
    modified_at:{type:Date}
}, {safe:true, strict:true, display:{title:'User', plural:'Users', fields:['username','first_name','last_name']});
```

#Finders
Finders allow for custom queries to be created and listed in the menu.   To add a simple finder
```javascript
   UserSchema.statics.findA_thru_H = function onFindAH(){
       return this.find().regex('username', /^[a-h]/i);
   }

```https://github.com/jspears/bobamo/blob/master/Readme.md

Finders add a new item to the dropdown from the header.

You may need some input for a finder to work.  To do that add a display property to the function.
```
GroupSchema.statics.search = function(q, search){
   search = search || q.search || '.*';
    var re = new RegExp(search,'gi');
   return this.find({}).or([{name:re},{description:re}]);
};
GroupSchema.statics.search.display = {
                           data:{search:''},   //default data
                           schema:{
                               search:{type:'Text', title:'Search'} //see backbone forms for an explanation.
                           },
                           fieldsets:[{"legend":"Search Group","fields":["search"]}] //see backbone forms.
}
```

This will create an form on top of the results that will submit to your form.   Currently only GET methods
are supported, meaning read operations.

#Plugins
Bobamo is built on plugins.   The main plugins are generator, less, mongoose, rest  and  static. These create
the basic application.  In addition there is appeditor, modeleditor, package which add a little extra functionality but
aren't done yet.


##To configure plugins
In your setup you can specify which plugins to load.

```javascript
 app.use(bobamo.express({mongoose:mongoose, plugin:['geo']}));
```

or you can just add a plugin to the defaults.

```javascript

 app.use(bobamo.express({mongoose:mongoose, plugins:['geo', 'less', ...]}));

```

The PluginManager will look in plugins, node_modules/bobamo/plugins for the plugin.  It loads whichever it finds first.
In addition you can specify the plugin dirs.

```javascript
{
 pluginDir:['/path/to/your/plugin/dir'] //
}
```

##API
The plugin api tries to stay out of your way, use convention as much as possible and otherwise provide useful functionality without much effort.
To create a plugin create in your project create a file in  &lt;yourproject&gt;/plugins/&lt;yourplugin&gt;/&lt;yourplugin&gt;.js

Then subclass the plugin-api in  &lt;yourproject&gt;/plugins/&lt;yourplugin&gt;/&lt;yourplugin&gt;.js

```javascript
//file:examples/geo-plugin-example/plugin/geo/geo.js

var PluginApi = require('bobamo').PluginApi, util = require('util');

var GeoPlugin = function () {
    PluginApi.apply(this, arguments);
}
util.inherits(GeoPlugin, PluginApi);
module.exports = GeoPlugin;
/**
Allow MapEditors to be discovered from other modules.
**/
GeoPlugin.prototype.editors = function(){ return ['MapEditor']}
/**
  Whenever it incounters a model with lat and lng properties it will
  assume it is geo coordinates and return a map editor.

**/
GeoPlugin.prototype.editorFor = function(path, property, Model){
    if (property && property.lat && property.lng){
            return {
                type:'MapEditor',
                subSchema:{
                    lat:{type:'Hidden'},
                    lng:{type:'Hidden'}
                }
            }
    }
}
```

You will need to add this plugin to your app.js

```javascript
 app.use(bobamo.express({mongoose:mongoose, plugin:['geo']}));
```

By default it will serve static files from

plugin/&lt;yourplugin&gt;/public

and serve jqtpl templates from

plugin/&lt;yourplugin&gt;/views

#The Cloud 
If you want to get it running in "The Cloud" quickly check out [AppFog](https://www.appfog.com/) I got this running there
in less than 20 minutes, so many kudos to them.  Start [here](https://console.appfog.com/apps/new) choose the create app
-> node express -> infrastructure and subdomain.   go to the services tab and add mongodb, and you should be golden.

Once your through that install their little tool.
```bash
gem install af
af login
af pull <project>
cd <project>
```
and create 
package.json 

```javascript 

{
    "name": "<your project>"
  , "version": "0.1"
  , "private": false
  , "dependencies": {
      "express": ">=3"
    , "jade": ">= 0.0.1"
    , "bobamo":"latest"
    , "jqtpl":"latest"
    , "consolidate":"latest"
   , "mongoose":"latest"
  }
}
```
and app.js
```javascript
var express = require('express')
    , User = require('bobamo/examples/model/user')
    , Group = require('bobamo/examples/model/group')
    , Employee = require('bobamo/examples/model/employee')
    , bobamo = require('bobamo')
    ;

var app = module.exports = express();
var mongo = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"db"
    };

// Configuration
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }

}
var mongo_url = generate_mongo_url(mongo);
app.configure(function () {
//    app.set('views', __dirname + '/views');
//    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({secret:'super duper secret'}))
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use( bobamo.express({uri:mongo_url}));
    
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use( bobamo.express({uri:mongo_url}));
    app.use(express.errorHandler());
});

// Routes

app.get('/', function(req,res){ res.render('redir_index.html', {layout:false})});
app.listen(process.env.VCAP_APP_PORT || 3000);


```


Then push it back up
```bash
af update <project> 

```
With any luck it'll be runing.
Check out their (docs)[http://docs.appfog.com/frameworks/node] or ask me about something I may have broke.
