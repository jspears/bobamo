define(['Backbone', 'jsonschema/js/SwaggerUi', 'underscore', 'jquery',
    'jsonschema/js/hljs',
    'text!jsonschema/tpl/swagger.html',

    'jsonschema/js/swagger-ui/lib/jquery.slideto.min',
    'jsonschema/js/swagger-ui/lib/jquery.wiggle.min',
    'jsonschema/js/swagger-ui/lib/jquery.ba-bbq.min'
//    'jsonschema/js/swagger-ui/lib/handlebars-1.0.rc.1',
//    'jsonschema/js/swagger-ui/lib/swagger',
//    'jsonschema/js/swagger-ui/lib/highlight.7.3.pack'


], function (B, sui, _, $, hljs, template) {

    var DocView = B.View.extend({
        el:'#content',
        template:_.template(template),
        events:{
            'click a':'onLink'
        },
        onLink:function (e) {
            if (!$(e.target).hasClass('go'))
                e.preventDefault();
        },
        onInit:function () {
            var $el = this.$el;
            this.swaggerUi = new SwaggerUi({
                discoveryUrl:"http://localhost:3001${pluginUrl}/swagger/api-docs",
                // apiKey:"special-key",
                dom_id:"swagger-ui-container",
                supportHeaderParams:false,
                supportedSubmitMethods:['get', 'post', 'put', 'delete'],
                onComplete:function (swaggerApi, swaggerUi) {
//                    $el.find('.response_throbber').attr('src', 'jsonschema/js/swagger-ui/images/throbber.gif')
                    if (console) {
                        console.log("Loaded SwaggerUI")
                        console.log(swaggerApi);
                        console.log(swaggerUi);
                    }
                    $('pre code', this.$el).each(function (i, e) {
                        hljs.highlightBlock(e)
                    });
                },
                onFailure:function (data) {
                    if (console) {
                        console.log("Unable to Load SwaggerUI");
                        console.log(data);
                    }
                },
                docExpansion:"none"
            });

            this.swaggerUi.load();
        },

        tryLoad:function () {
            if (!window['SwaggerUi']) {
                if (this._load++ < 5) {
                    setTimeout(_.bind(this.tryLoad, this), 100 * this._load);
                } else {
                    console.warn('did not load swagger');
                }
            } else {
                this.onInit();

            }
        },
        render:function () {
            this._load = 0;
            this.$el.html(this.template());
            this.$el.find('ul').addClass('unstyled');
            this.tryLoad();
            return this;
        }
    })
    return DocView;
});