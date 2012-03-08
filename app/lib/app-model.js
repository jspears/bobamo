var Application = function (options, user) {
    var models = {};
    var defaults = {
        appName:'Mojaba',
        description:'Default Mojaba description',
        'background-color':'#000',
        color:'#fff',
        logo:''
    }
    _u.each(defaults, function onDefineGetters(value, key) {
        this.__defineGetter__(key, function () {
            return typeof options[key] == 'undefined' ? defaults[key] : options[key];
        })
    }, this);

}

var Schema = function (obj) {
    var dg = this.__defineGetter__.bind(this);
    dg('modelName', function () {
        return obj.modelName;
    });
    dg('finders', function () {
        return obj.finders;
    })
    dg('label', function () {
        return obj.label;
    });
    dg('plural', function () {
        return obj.plural;
    });
    dg('labelAttr', function () {
        return obj.labelAttr;

    });
    dg('paths', function () {

    });
    dg('fields', function () {
        return obj.fields || _u.filter(obj.paths, function filterHidden(obj) {
            return obj.display == 'none';
        });
    });
    dg('edit_fields', function () {
        return obj.edit_fields || _u.filter(obj.fields, function filterReadOnly(obj) {
            return obj.ro !== true;
        });
    });
    dg('display_fields', function () {
        return obj.display_fields || obj.fields;
    });
    dg('list_fields', function () {
        return obj.list_fields || obj.fields;
    });
    dg('show_fields', function () {
        return obj.show_fields || obj.fields;
    });
}

var Field = function (obj) {
    var dg = this.__defineGetter__.bind(this);
    dg('path', function () {
        return obj.path;
    })
    dg('label', function () {
        return obj.label;
    });
    dg('title', function () {
        return obj.title;

    });

    dg('type', function () {
        return obj.type;
    });

    dg('dataType', function () {
        return obj.dataType;

    });

    dg('plural', function () {
        return obj.plural;
    });
    dg('ro', function () {
        return obj.ro;
    });
    dg('display', function () {
        return obj.display;
    });
    dg('url', function () {
        return obj.url;
    });
    dg('options', function () {
        return obj.options;
    });

}

module.exports = {
    Field:Field,
    Application:Application,
    Schema:Schema
}
