var bobamo = require('../../../index'), Model = bobamo.DisplayModel, should = require('should');
"use strict";
var MPlugin = require('../mongoose'), mongoose = require('mongoose');
var mongoosePlugin = new MPlugin({
    mongoose:mongoose
});

module.exports.testDeepness = function (test) {
    mongoosePlugin.pluginManager = {
        requirejs:function (module) {
            var mod = require(__dirname + '/../public/js/validators');
            return mod;
        },
        pluginFor:function () {
            return mongoosePlugin.editorFor.apply(mongoosePlugin, arguments);
        }
    }
    mongoosePlugin.updateSchema('Test', schema);

    var schemaS = mongoosePlugin.appModel().should.have.property('modelPaths').obj.should.have.property('Test').obj.should.have.property('schema').obj;
    schemaS.should.have.property('contact')
        .obj.should.have.property('subSchema')
        .obj.should.have.property('fullName')
        .obj.should.eql({type:"Text", "schemaType":"String"})
    schemaS.should.have.property('_id').eql({ path:"_id", "type":"Hidden", schemaType:"String"});
    schemaS.should.have.property('name').eql({
        path:"name",
        type:"Text",
        schemaType:"String"
    });
    test.done();
}

var schema = {
    "schema":{
        "name":{
            "schemaType":"String",
            "path":"name",
            "title":"Name",
            "name":"name",
            "type":"Text",
            "placeholder":"",
            "dataType":"text",
            "defaultValue":"",
            "textCase":"none"
        },
        "contact":{
            "schemaType":"Object",
            "name":"contact",
            "title":"",
            "help":"Contact Info",
            "type":"Object",
            "modelName":"Contact",
            "subSchema":{
                "fullName":{
                    "schemaType":"String",
                    "name":"fullName",
                    "title":"Full Name",
                    "help":"full name",
                    "type":"Text",
                    "placeholder":"",
                    "dataType":"text",
                    "defaultValue":"",
                    "textCase":"none"
                }
            }
        }
    },
    "fieldsets":[
        {
            "legend":"contact",
            "fields":["name", "contact.fullName"],
            "description":""
        }
    ],
    "list_fields":["name", "contact.fullName"]
};