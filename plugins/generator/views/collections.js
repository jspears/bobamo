define([
    'modelcollections/{{if collection}}${collection}{{else}}${modelName}{{/if}}'
], function(ns) {
  {{if isAdmin}}
      var data = {{json modelData}}
        return new ns.Collection(data);
  {{else}}
        return new ns.Collection;

  {{/if}}
});
