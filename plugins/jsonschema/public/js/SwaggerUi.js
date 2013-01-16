define(['jsonschema/js/Handlebars',  'jsonschema/js/Swagger'], function(Handlebars, Swagger){
    require(['jsonschema/js/swagger-ui/swagger-ui'], function(){
        console.log('loading swagger-ui')
    });
    return window.SwaggerUi

})