function $titlelize(str) {
    return Array.prototype.splice.call(arguments, 0).map(function (str) {
        return ("" + str).split(/[^a-zA-Z0-9]/).filter(function (v) {
            return v;
        }).map(function (v) {
                return v.substring(0, 1).toUpperCase() + v.substring(1);
            }).join(' ');
    }).join(' ')
}
var moment = require('moment');

module.exports = function SwaggerToMarkdown(options) {
    var resources = options.resourcefile;
    this.parameters = options.parametersfile;
    var self = this;
    var _lines = [];
    this.print = function () {
        this.$enhance(options);
        return _lines.join('');
    }
    var f = {
        $write: function () {
            for (var i = 0, l = arguments.length; i < l; i++) {
                _lines.push(arguments[i]);
            }
        },
        $writeln: function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.push('\n');
            this.$write.apply(this, args)
        }
    }

    this.$enhance = function () {
        this.$write_api_to_markdown(options.markdownfile, options.apiname, resources["apiVersion"], resources["basePath"], resources["apis"], options.specifications);
        return this;
    };
    function each(obj, cb, ctx) {
        if (obj && cb)
            for (v in obj) {
                cb.call(ctx || self, obj[v], v);
            }
        return obj;
    }

    this.$write_api_to_markdown = function (markdown_file, api_name, api_version, base_path, apis, specifications) {

        self.$write_header(f, api_name, api_version, base_path);
        self.models = {};
        specifications.forEach(function (spec) {
            spec.models && each(spec.models, function (v, k) {
                self.models[k] = v;
            })
        });

        function findSpec(resource) {
            var ret = specifications.filter(function (v) {
                return v.resourcePath == resource.path;
            });


            if (ret.length > 0)
                return ret[0];


        }


        apis && apis.sort(function(a,b){
            return a.path > b.path ? 1 : a.path== b.path ? 0 : -1;
        }).forEach(function (resource, index) {
            f.$write(self.$build_markdown_header(
                self.$extract_resource_name(resource.path), 2
            ))
            if (resource.description)
            f.$writeln(resource.description + "\n\n");
            // (Array.isArray(specifications) ? specifications : [specifications]).forEach(function(spec){
            var spec = findSpec(resource);
            self.$write_specification(f, base_path, self.$extract_resource_name(resource.path), spec);
            // })


            return f.$write("\n\n");

        }, this);
        return this;
    };
    this.$write_json = function (f, model) {
        f.$writeln('\n```javascript\n' + JSON.stringify(model, null, 4) + '\n```\n');
    }
    this.$write_model = function (f, model, modelName) {
        f.$writeln(self.$build_markdown_header(modelName, 2) + "\n");
        this.$write_json(f, model);
    }
    this.$write_prop = function (v, k) {
        this.$writeln('** ' + k + ' ' + v.dataType);
        this.$write_prop(v.properties, self);
    }
    function sortDeep(a,b){
        if (!(a || a.length)) return -1;
        if (!(b && b.length)) return 1;
        var pos = 0;
        var ap = a[0],bp = b[0];
        while(ap !== void(0) && bp !== void(0) ){
            if (ap !== bp)
                return ap > bp ? 1 : ap < bp ? -1  :0;
            pos++;
            ap = a[pos], bp = b[pos]

        }

        return ap > bp ? 1 : ap < bp ? -1  :0;

    }
    this.$write_specification = function (f, base_path, resource, specification) {
        var apis = specification.apis;
        return apis && apis.sort(function(a,b){
            return sortDeep(a && a.path.split('/'), b && b.path);
        }).map(function (method) {
            return method["operations"].map(function (operation) {
                return self.$write_operation(f, base_path, resource, operation, method["path"])
            })
        });
    };

    this.$write_operation = function (f, base_path, resource, operation, path) {
        f.$writeln(this.$build_markdown_header(operation.httpMethod + ' ' + path + "\n", 2));
        if (!(operation.summary && operation.nickname)) {
            f.$write(this.$build_markdown_header("[Please add operation summary information to the summary section]\n\n", 4))
        } else {
            f.$write(this.$build_markdown_header((operation.summary || operation.nickname) + "\n", 4))
        }

        if (!operation.notes) {
            f.$write("[Please add operation information to the notes section]\n\n")
        } else {
            f.$write(operation.notes + "\n\n");
        }
        f.$writeln('');
        f.$write(this.$build_markdown_header("Definition", 4));
        f.$write("\n\n");
        this.$write_code_block(f, operation.httpMethod + " " + path);
        f.$write("\n\n");
        this.$write_arguments(f, operation.parameters);
        f.$write("\n\n");

        f.$write(this.$build_markdown_header("Response Schema", 4));
        this.$write_response(f, operation);
        f.$write("\n\n");


        f.$write(this.$build_markdown_header("Potential Errors", 4));
        this.$write_errors(f, operation.errorResponses);
        return f.$write("\n\n");
    };
    this.$write_response = function (f, operation) {

        var typeRe = /List\[([^\]]*)\]/;
        f.$writeln('Type: ' + operation.responseClass);
        var type = operation.responseClass.replace(typeRe, '$1');
        this.$write_model_safe(f, type);
    }
    /**
     * Recursively print out the model and reference models.
     * @param f
     * @param m
     */
    this.$write_model_safe = function (f, type, written) {
        written = written || {};
        var m = self.models[type];
        if (m && !written[type]) {
            written[type] = true
            this.$write_json(f, m);
            each(m.properties, function (v, k) {

                self.$write_model_safe(f, v.items && v.items.$ref || v.type, written);
            });
        }


    }
    this.$write_example_request = function (f, base_path, operation, path, arguments, resource) {

        path = this.$populate_arguments(path, arguments);
        var commmand, data;
        switch (operation.httpMethod) {
            case 'GET':
                command = "curl " + base_path + path;
                break;
            case 'POST':
            {

                data = resource ? "" : this.parameters[resource.toUpperCase() + ".POST"];
                command = "curl -X POST -H \"Content-Type:application/json\" -d '" + data + "' " + base_path + path;
                break;
            }
            case 'PUT':
            {
                data = resource ? "" : this.parameters[resource.toUpperCase() + ".PUT"];
                command = "curl -X PUT -H \"Content-Type:application/json\" -d '" + data + "' " + base_path + path;

            }
        }
        this.$write_code_block(f, command);
//        response = stdout.$read();
//        return (function () {
//            try {
//                __scope.JSON.$pretty_generate(__scope.JSON.$parse(response)).$gsub("\n", "\n    ")
//            } catch ($err) {
//                if (true) {
//                    response
//                }
//                else {
//                    throw $err;
//                }
//            }
//        }).call(this);
    };

    this.$populate_arguments = function (path, arguments) {
        path = path.replace("{format}", "json");
        if (!(arguments && arguments.length)) {
            return path;
        }

        arguments.filter(function (argument) {
            return argument.name && argument.paramType == 'path' && self.parameters && self.parameters[argument.name]
        }).map(function (argument) {
                return path = path.replace("{" + argument.name + "}", self.parameters[argument.name])
            });
        return path;
    };

    this.$write_errors = function (f, errors) {
        if (!(errors && errors.length)) {
            f.$write("* None\n");
            return null;
        }

        return errors.forEach(function (error) {

            f.$write("* ");
            if (!error.code) {
                f.$write("[Please add a code for error]")
            } else {
                f.$write("**" + error.code + "**");
            }

            if (!error.reason) {
                f.$write("")
            } else {
                f.$write(" - " + error.reason)
            }
            return f.$write("\n");
        });
    };
    var filter = function (type) {
        return function (v) {
            return v.paramType == type;
        }
    };

    this.$write_arguments = function (f, args) {
        f.$write(this.$build_markdown_header("Request Parameters", 4));

        if (!(args && args.length)) {
            f.$write("* None\n");
            return null;
        }
        var q = args.filter(filter('query'));

        if (q.length) {
            var str = ['<table><thead><tr><th>Name</th><th>Data Type</th><th>Description</th><th>Default Values</th></tr></thead><tbody>']
            f.$write(this.$build_markdown_header("Query Parameters", 5));
            q.forEach(function (argument) {
                str.push('<tr><td>' +
                    (argument.required ? '*' : '') +
                    argument.name

                    + '</td><td>' + argument.dataType + '</td><td>' + (argument.description || '') + '</td><td>' + ( argument.allowableValues && argument.allowableValues.join(', ') || argument.defaultValue || '') + '</td></tr>')
            });
            str.push('</tbody></table>');
            f.$writeln(str.join('\n'));
        }
        var b = args.filter(filter('body'));

        function writeModels(name, models) {
            var model = name && models && models[name];
            if (!model) {
                console.error('no model named [' + name + ']');
                return;
            }
            f.$writeln('Type '+name+"\n");
            self.$write_json(f, model);
            f.$writeln('');
            model && model.properties && Object.keys(model.properties).forEach(function (key) {
                var v = model.properties[key];
                var ref = v && v.items && v.items.$ref;
                if (ref)
                    writeModels(ref, models);
            });

        }

        if (b.length) {
            f.$writeln('');
            f.$write(self.$build_markdown_header("Body Parameters", 5));
            b.forEach(function (arg) {
                writeModels(arg.dataType, self.models);
            });
        }

        var p = args.filter(filter('path'));
        if (p.length) {
            f.$writeln('');
            f.$write(this.$build_markdown_header("Path Parameters", 5));
            var str = ['<table><thead><tr><th>Name</th><th>Data Type</th><th>Description</th></tr></thead><tbody>']
            p.forEach(function (argument) {
                str.push('<tr><td>' +
                    (argument.required ? '*' : '') +
                    '{' + argument.name + '}'

                    + '</td><td>' + argument.dataType + '</td><td>' + (argument.description || '') + '</td></tr>')
            });
            str.push('</tbody></table>');
            f.$writeln(str.join('\n'));

        }
    };

    this.$write_code_block = function (f, text) {
        return f.$write("    " + text)
    };

    this.$write_header = function (f, api_name, api_version, base_path) {

        f.$write(this.$build_markdown_header(api_name + ' Service Contract', 1));
        f.$write(this.$build_markdown_header('About', 2));
        f.$write('<table><thead>' +
            '<tr><th colspan="3">Authors: ' + (options.authors ? options.authors.join(', ') : '' ) + '</th></tr>' +
            '<tr><th colspan="3">Revisions</th></tr>' +
            '<tr><th>Date</th><th>Version</th><th>Notes</th></tr></thead><tbody>');

        if (options.modified) {
            f.$write('<tr><td>' + moment(options.modified).format("MM/DD/YYYY") + '</td><td>' + api_version + '</td><td>' + (options.description || 'current api') + '</td></tr>');
        }
        if (options.revisions) {
            options.revisions.forEach(function (v, k) {
                f.$write('<tr><td>' + moment(new Date(v.modified)).format("MM/DD/YYYY") + '</td><td>' +
                    v.version
                    + '</td><td>' +
                    (v.description || '')
                    + '</td></tr>');

            });
        }
        f.$write('</tbody></table>');
        f.$write("\n\n");
        f.$write(this.$build_markdown_header("High-level Service Design", 2));
        f.$writeln('All services are designed as RESTful HTTP services. JSON is used as the transport format for all request/response bodies.' +
            'Although the service design at this point is intended to support no more beyond the scope of ' + options.apiname);
        f.$writeln("\n")
        f.$write(this.$build_markdown_header("JSON Schema", 2));
        f.$writeln('The content of JSON request/response are specified as [JSON Schemas](http://json-schema.org/latest/json-schema-core.html). JSON Schema is to JSON as XML Schema is to XML, effectively a formal content for a documents structure expressed in the format itself. JSON Schema lends itself to being easily human readable which can significantly help with services design discussions.       The service contracts expressed in this document use version 4 of the JSON schema draft. There are a number of validators available for Java, Node and Ruby. ' +
            'The service contracts are written following the Swagger specification. Occasionally there are discrepancies between strict json-schema and Swagger, in which case we follow the Swagger specification'+
            '\n')

        f.$writeln(this.$build_markdown_header("Services\n", 1));

        return f.$write("\n\n");
    };

    this.$extract_resource_name = function (path) {
        var idx = path.indexOf('.');
        var rname = path.substring(1, ~idx ? idx : path.length);
        return rname;
    };

    this.$build_input_here = function () {
        return "[Please add API specific content here]\n"
    };

    this.$build_markdown_header = function (text, level) {
        var str = []
        while (level-- > 0)
            str.push('#');
        if (text)
            str.push(text);

        return str.join('') + "\n";
    };


};
