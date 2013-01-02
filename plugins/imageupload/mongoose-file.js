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

    this.path = String;
    this.hash = String;
    this.type = String;

//    this.size = Number;
//    this.lastModified = Date;
    File.super_.call(this, path, options);
//    SchemaType.call(this, path, options);

};
util.inherits(File, Schema.Types.Object);
//File.prototype.__proto__ = SchemaType.prototype;
//util.inherits(File, mongoose.Schema.Types.Object);
File.prototype.checkRequired = function (val) {
    console.log('checkrequired', val);
    return null != val;

}
File.prototype.cast = function (test, obj, init) {
    console.log('cast', arguments, 'this', this);

    if (init){
        return test;
    }else{
      var stat = fs.statSync(test.path);
      ['ctime','size'].forEach(function(v){
          test[v] = stat[v];
      });
      this.hash(test);
      return test;
    }
}
File.prototype.hash = function(test){

}

Schema.Types.File = File;
Types.File = File;
exports.File = File;


