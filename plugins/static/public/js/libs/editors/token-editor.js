define(['Backbone.Form', 'jquery', 'underscore', 'libs/jquery/jquery.tokeninput'], function (Form, $, _) {
    var editors = Form.editors;
    var collectionToToken = function (v) {
        return {
            id:v._id || v.id,
            name:v.toString()
        }
    }
    var TokenEditor = editors.TokenEditor = editors.Base.extend({
        tagType:'div',
        initialize:function (options) {
            editors.Base.prototype.initialize.apply(this, _.toArray(arguments));
            if (this.schema && ( this.schema.multiple !== false || this.schema.schemaType == 'Array' || this.schema.type == 'Array' )) {
//                this.$el.attr('multiple', 'multiple');
                this._multiple = true;
            }
            return this;
        },
        render:function () {
            if (this.schema.ref){
                var self = this;
                require(['collections/'+this.schema.ref], _.bind(this.setOptions, this));
            }else if (this.schema.url){
                var url = this.schema.url;
                this.setOptions(function(cb){
                    $.ajax({
                        url:url,
                        success:function(resp){
                            cb(resp.payload);
                        }
                    })
                });

            }else
                this.setOptions(this.schema.options);

            return this;
        },
        renderOptions:function (options) {
            this.$el.tokenInput(options);
        },
        /**
         * Sets the options that populate the <select>
         *
         * @param {Mixed} options
         */
        setOptions:function (options) {
            var self = this;

            //If a collection was passed, check if it needs fetching
            if (options instanceof Backbone.Collection) {
                var collection = options;
                this.$el.tokenInput('',{
                    searchDelay: 2000,
                    minChars: 2,
                    preventDuplicates: true,
                    theme:'facebook',
                    queryFunction:function(q, cb){
                        if (_.isUndefined(q) || q =='')
                            return cb([]);

                        collection.search(q, function(resp){
                             cb(resp.map(collectionToToken))
                        });
                    },
                    onAdd:function(itm){
                        self.trigger('change')
                    },
                    onDelete:function(itm){
                        self.trigger('change')
                    }
                });

                if (this.options.model){
                    var $el = this.$el;
                    $.ajax({
                        url:this.options.model.url()+'/'+this.options.key+'?transform=labelval',
                        success:function(resp){
                            _.each(resp.payload, function(v){
                                $el.tokenInput('add', {
                                    id:v.val,
                                    name:v.label
                                })
                            })

                        }
                    })
                }

                if (collection.search)
                    collection.search();
                else
                    collection.fetch();
            }

            //If a function was passed, run it to get the options
            else if (_.isFunction(options)) {
                options(function (result) {
                    self.renderOptions(result);
                });
            }

            //Otherwise, ready to go straight to renderOptions
            else {
                this.renderOptions(options);
            }
        },

        setValue:function (value) {

            this.value = value;
        },
        selectNone:'<option data-none="null" value="">None</option>',
        getValue:function () {
            return this.$el.tokenInput("get").map(function(v){ return v.id });

        }
    });
    return TokenEditor;

});