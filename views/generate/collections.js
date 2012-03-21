define([
    'modelcollections/${schema.modelName}'
], function(ns) {
  {{if isAdmin}}
      var data = {{html JSON.stringify(modelData)}}
        return new ns.Collection(data);
  {{else}}
        return new ns.Collection;

  {{/if}}
});
