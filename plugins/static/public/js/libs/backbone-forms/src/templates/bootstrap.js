(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['Backbone.Form'], factory);
    } else {
        // RequireJS isn't being used. Assume backbone is loaded in <script> tags
        factory(Backbone.Form);
    }
}(function (Form) {
    "use strict";
  var templates = {
    form: '\
      <form class="form-horizontal">{{fieldsets}}</form>\
    ',

    fieldset: '\
      <fieldset title="{{help}}">\
        {{legend}}\
        {{fields}}\
      </fieldset>\
    ',

    field: '\
      <div class="control-group">\
        <label class="control-label" for="{{id}}">{{title}}</label>\
        <div class="controls">\
          <div class="input-xlarge">{{editor}}</div>\
          <div class="help-block">{{help}}</div>\
        </div>\
      </div>\
    '
  };
  
  var classNames = {
    error: 'error'
  };

  Form.helpers.setTemplates(templates, classNames);
  return templates;
}));
