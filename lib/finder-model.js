var  inflection = require('./inflection');
var Finder = function (v, k, model) {
    this.name = k || v.name;
    this.display = v.display || {};
    if (!this.display.title)
        this.display.title = inflection.humanize(this.name)
    this.title = this.display.title;
    if (!this.display.list_fields){
        this.display.list_fields = model.list_fields;
    }
    this.model = new Finder._Model(model.modelName, [this.display], true);
    _parent = model;
    this.parent = function(){
        return _parent;
    }
  }
module.exports = Finder;