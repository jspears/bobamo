{
    models:{
        modelName:{
            paths:{
                dataType:'String',
               validator:['required'],
               title: "User",
               help:'Optional Help Message'
            },
            display:{
                fields:["username", "first_name", "last_name", "twitter", "email", "groups"],
                    plural
            :
                "Users",
                    title
            :
                "User"
            }
        ,
            modelName:'user'
        }
    },
    options:{
        display:{
            title:"Mojaba",
         version:"0.2.0",
        description:"A scaffoldless crud thing using bootstrap, passport, mongoose, backbone and jquery"
        }
    }
}
function App(array, path){
    this.__defineGetter__('models', function(){

    });
    this.__defineGetter__('options', function(){

    });

}
function Field(){

}
function Model(){
    var df = this.__defineGetter__.bind(this);
    df('field', function(){

    });
}
