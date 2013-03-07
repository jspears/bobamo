define('preferences', function() {

  // Define window if in optimization mode
  if (typeof window === 'undefined') {
    window = global;
  }

  var store = window.localStorage;

  var coercions = [
    { /* boolean true */
      match: /^true$/i,
      coerce: function(value) {
        return true;
      }
    },
    { /* boolean false */
      match: /^false$/i,
      coerce: function(value) {
        return false;
      }
    },
    { /* number */
      match: /^[0-9]+$/,
      coerce: function(value) {
        return Number(value);
      }
    },
    { /* array or object */
      match: /^(\[|\{).*?(\}|\])/,
      coerce: function(value) {
        return window.JSON.parse(value);
      }
    }
  ];

  function getAll() {
    var out = {};
    for (var k in store) {
      out[k] = coerce(store[k]);
    }
    return out;
  }

  function coerce(value) {
    if (typeof value !== 'undefined' && value !== null) {
      for (var k in coercions) {
        if (value.match(coercions[k].match)) {
          value = coercions[k].coerce(value);
          break;
        }
      }
    }
    return value;
  }

  function get(key) {
    return coerce(store.getItem(key));
  }

  function set(key, value) {
    if (typeof value === 'object') {
      value = window.JSON.stringify(value);
    }
    return store.setItem(key, value);
  }

  function remove(key) {
    return store.removeItem(key);
  }

  function keys() {
    var out = [];
    for (var k in store) {
      out.push(k);
    }
    return out;
  }

  return {
    get: get,
    set: set,
    remove: remove,
    getAll: getAll,
    keys: keys
  };

});