var mongoose = require('../../index').mongoose,
    fs = require('fs'),
    crypto = require('crypto'),
    util = require('util'), Schema = mongoose.Schema, SchemaType = mongoose.SchemaType, Types= mongoose.Types, _u = require('underscore');

/**
 * TODO
 * New idea, create hash of the file on post to this url.  use this for identifying the file until
 * it is persited using this thing.   That way we should prevent malicous overwrite.
 *
 *
 * @param path
 * @param options
 * @constructor
 */

var File = function File(path, options) {
    options = _u.extend({type:Object, index:true, select:true, strict:true}, options);

    this.name = String;
    this.size = Number;
    this.type = String;
    this.fileId = String;
    File.super_.call(this, path, options);
};
util.inherits(File, Schema.Types.Object);
File.prototype.checkRequired = function (val) {
    return null != val;
}
File.prototype.cast = function (test, obj, init) {
    console.log('cast', arguments, 'this', this);

    if (init){
        return test;
    }else{
      var ret = {};
      ['_id','__v','type','name','path', 'fileId', 'size'].forEach(function(v){
          ret[v] = test[v];
      })
      return ret;
    }
}


Schema.Types.File = File;
Types.File = File;
exports.File = File;


