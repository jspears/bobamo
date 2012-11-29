var requirejs = require('requirejs');
requirejs.config({
    nodeRequire:require
});
requirejs(['../public/js/validators'], function (v) {
    console.log('v', v);
    var t = v.inject();
    console.log('message', t.min({min:2})(1));
    console.log('message', t.max({max:3})(4));
    console.log('message', t.enum({enum:['a', 'b', 'c']})('d'));
    console.log('message', t.minlength({minlength:2})("a"));
    console.log('message', t.maxlength({maxlength:3})("abcd"));

});
