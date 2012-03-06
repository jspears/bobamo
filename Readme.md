#Mojaba
Its basically a crud infrastructure for [mongoose](http://mongoosejs.com), [backbone](http://documentcloud.github.com/backbone/), [mers](https://github.com/jspears/mers),
[backbone forms](https://github.com/powmedia/backbone-forms) and [twitter bootstrap](http://twitter.github.com/bootstrap/). The idea
is you define your model and a little extra and it generates the crud on demand.    It doesn't leave you in the
box though, you can easily change any part of the generated stuff by making it static and putting in the public
directory.   This allows for easy customization.  In the not so distant future you will be able to subclass the
existing scaffolding to extend the default capability.  You can at your own risk modify the scaffolding generated in views/generator

## Configuration
Models belong in app/models, they are loaded automatically.   Each Mongoose schema can be annotated with an
display object, in addition each field in the schema can be annotated.

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