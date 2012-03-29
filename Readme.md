#Bobamo
### changed the name to avoid stepping on someones toes.
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

 app.use(bobamo.express({uri:'mongodb://localhost/bobamo_development'}, express))

```
Note passing express in, please bear with me as I figure out how to get rid of that, but to make it work its needed.
You can also specify a context to host both the rest and javascript from

```javascript

 app.use('your-api', bobamo.express({uri:'mongodb://localhost/bobamo_development'}, express))

```

You can find examples of this under examples/simple and examples/login-example.

A running example of the simple app is [here](http://bobamo-speajus.rhcloud.com/bobamo/index.html)


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
Many-To-One support is coming.
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
