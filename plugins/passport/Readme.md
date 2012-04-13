#Bobamo Passport
This plugin provides passport authentication support.

##Options
 authModel // the model that you want to authenticate from.
 hash //whatever crypto.createHash() supports defaults to sha1;
 digest // whatever your model digests in defaults to 'base64';
 passwordField // the default password field.
 strategy // the passport strategy to use defaults to LocalStrategy.
 protected // the list of urls to protect, defaults to all.

##Request
To require a route to be authenticated set authrequired.

    ```javascript

    app.all('/your/route', function(req,res, next){
        req.authrequired = true
     next();
    });
    ```