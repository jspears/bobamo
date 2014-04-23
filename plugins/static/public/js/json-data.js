define('json-data', ['json-data-preferences'], function(preferences) {

  // default expire stored data in seconds
  var STORE_EXPIRE = 86400;

  // copped from http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz01234567890+/=';

  function base64encode(input) {
    input = escape(input);
    var output = '';
    var chr1, chr2, chr3 = '';
    var enc1, enc2, enc3, enc4 = '';
    var i = 0;

    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4);
      chr1 = chr2 = chr3 = '';
      enc1 = enc2 = enc3 = enc4 = '';

    } while (i < input.length);

    return output;
  }

  function makeAuth(user, pass) {
    var out = [];
    if (user) {
      out.push(user);
    }
    if (pass) {
      out.push(pass);
    }
    return base64encode(out.join(':'));
  }

  var XMLHttpFactories = [
    function() {
      return new XMLHttpRequest();
    },
    function() {
      return new ActiveXObject('Msxml2.XMLHTTP');
    },
    function() {
      return new ActiveXObject('Msxml3.XMLHTTP');
    },
    function() {
      return new ActiveXObject('Microsoft.XMLHTTP');
    }
  ];

  function createXMLHTTPObject() {
    var xmlhttp = false;
    for (var i = 0; i < XMLHttpFactories.length; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }

  // copped from http://stackoverflow.com/questions/2557247/easiest-way-to-retrieve-cross-browser-xmlhttprequest
  function xhr(options) {

    var success = options.success || function() {};
    var error = options.error || function() {};
    var req = createXMLHTTPObject();

    req.open('GET', options.url, true);

    if (options.headers) {
      for (var k in options.headers) {
        req.setRequestHeader(k, options.headers[k]);
      }
    }

    req.onreadystatechange = function() {
      if (req.readyState !== 4) {
        return;
      }

      if (req.status !== 200 && req.status !== 304) {
        error(null);
        throw new Error('Error loading JSON Data for ' + options.url);
      }

      var response = req.responseText;
      response = JSON.parse(response);
      success(response);
    };

    if (req.readyState === 4) {
      return;
    }

    req.send(null);
  }

  // Strip query string and add baseURL if present
  function formatURL(name, config) {
    name = name.replace(/\?.*?$/, '');
    return (config.jsonData.baseURL || '') + name;
  }

  function willStoreData(name) {
    return name.match(/\?store=([a-z0-9]+)(?:&|$)/i);
  }

  return {

    load: function(name, req, onLoad, config) {

      // Don't fetch JSON when in build mode
      if (config.isBuild) {

        onLoad(null);

      } else {

        config.jsonData = config.jsonData || {};

        var storeExpire = config.jsonData.storeExpire || STORE_EXPIRE;

        var url = formatURL(name, config);

        var storeLocally = willStoreData(name);

        if (storeLocally) {
          var fromCache = preferences.get(url);
          if (fromCache) {
            try {
              var now = new Date().getTime();
              var ts = fromCache.ts;
              if (now - ts < (storeExpire * 1000)) {
                onLoad(fromCache.data);
                return;
              }
            } catch(e) {
              console.log(e);
            }
          }
        }

        var success = function(data) {
          if (storeLocally) {
            var ts = new Date().getTime();
            preferences.set(url, {ts: ts, data: data});
          }
          onLoad(data);
        };

        var error = function() {
          onLoad(null);
        };

        var options = {
          url: url,
          success: success,
          error: error,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        };

        // Allow passing in pre-computed encoded auth string
        var auth = config.jsonData.auth;
        if (config.jsonData.username || config.jsonData.password) {
          auth = makeAuth(config.jsonData.username,
                                     config.jsonData.password);
        }
        if (auth) {
          options.headers['Authorization'] = 'Basic ' + auth;
        }

        xhr(options);
      }
    },

    // Don't ever write out data during build, we only want live data
    write: function(pluginName, moduleName, write) {
    }

  };

});