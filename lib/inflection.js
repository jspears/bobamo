/*
 Copyright (c) 2010 Ryan Schuft (ryan.schuft@gmail.com)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/*
 This code is based in part on the work done in Ruby to support
 infection as part of Ruby on Rails in the ActiveSupport's Inflector
 and Inflections classes.  It was initally ported to Javascript by
 Ryan Schuft (ryan.schuft@gmail.com) in 2007.

 The code is available at http://code.google.com/p/inflection-js/

 The basic usage is:
 var InflectionJS = require('./inflection.js');

 Currently implemented functions:

 InflectionJSpluralize(string, plural) == String
 renders a singular English language noun into its plural form
 normal results can be overridden by passing in an alternative

 InflectionJS.singularize(string, singular) == String
 renders a plural English language noun into its singular form
 normal results can be overridden by passing in an alterative

 InflectionJS.camelize(string, lowFirstLetter) == String
 renders a lower case underscored word into camel case
 the first letter of the result will be upper case unless you pass true
 also translates "/" into "::" (underscore does the opposite)

 InflectionJS.underscore(string) == String
 renders a camel cased word into words seperated by underscores
 also translates "::" back into "/" (camelize does the opposite)

 InflectionJS.humanize(lstring, owFirstLetter) == String
 renders a lower case and underscored word into human readable form
 defaults to making the first letter capitalized unless you pass true

 InflectionJS.capitalize(string) == String
 renders all characters to lower case and then makes the first upper

 InflectionJS.dasherize(string) == String
 renders all underbars and spaces as dashes

 InflectionJS.titleize(string) == String
 renders words into title casing (as for book titles)

 InflectionJS.demodulize(string) == String
 renders class names that are prepended by modules into just the class

 InflectionJS.tableize(string) == String
 renders camel cased singular words into their underscored plural form

 InflectionJS.classify(string) == String
 renders an underscored plural word into its camel cased singular form

 InflectionJS.ordinalize(string) == String
 renders all numbers found in the string into their sequence like "22nd"
 */


/*
 This sets up some constants for later use
 This should use the window namespace variable if available
 */
var InflectionJS =
{
    /*
     This is a list of nouns that use the same form for both singular and plural.
     This list should remain entirely in lower case to correctly match Strings.
     */
    uncountable_words:[
        'equipment', 'information', 'rice', 'money', 'species', 'series',
        'fish', 'sheep', 'moose', 'deer', 'news'
    ],

    /*
     These rules translate from the singular form of a noun to its plural form.
     */
    plural_rules:[
        [new RegExp('(m)an$', 'gi'), '$1en'],
        [new RegExp('(pe)rson$', 'gi'), '$1ople'],
        [new RegExp('(child)$', 'gi'), '$1ren'],
        [new RegExp('^(ox)$', 'gi'), '$1en'],
        [new RegExp('(ax|test)is$', 'gi'), '$1es'],
        [new RegExp('(octop|vir)us$', 'gi'), '$1i'],
        [new RegExp('(alias|status)$', 'gi'), '$1es'],
        [new RegExp('(bu)s$', 'gi'), '$1ses'],
        [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
        [new RegExp('([ti])um$', 'gi'), '$1a'],
        [new RegExp('sis$', 'gi'), 'ses'],
        [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'), '$1$2ves'],
        [new RegExp('(hive)$', 'gi'), '$1s'],
        [new RegExp('([^aeiouy]|qu)y$', 'gi'), '$1ies'],
        [new RegExp('(x|ch|ss|sh)$', 'gi'), '$1es'],
        [new RegExp('(matr|vert|ind)ix|ex$', 'gi'), '$1ices'],
        [new RegExp('([m|l])ouse$', 'gi'), '$1ice'],
        [new RegExp('(quiz)$', 'gi'), '$1zes'],
        [new RegExp('s$', 'gi'), 's'],
        [new RegExp('$', 'gi'), 's']
    ],

    /*
     These rules translate from the plural form of a noun to its singular form.
     */
    singular_rules:[
        [new RegExp('(m)en$', 'gi'), '$1an'],
        [new RegExp('(pe)ople$', 'gi'), '$1rson'],
        [new RegExp('(child)ren$', 'gi'), '$1'],
        [new RegExp('([ti])a$', 'gi'), '$1um'],
        [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$', 'gi'), '$1$2sis'],
        [new RegExp('(hive)s$', 'gi'), '$1'],
        [new RegExp('(tive)s$', 'gi'), '$1'],
        [new RegExp('(curve)s$', 'gi'), '$1'],
        [new RegExp('([lr])ves$', 'gi'), '$1f'],
        [new RegExp('([^fo])ves$', 'gi'), '$1fe'],
        [new RegExp('([^aeiouy]|qu)ies$', 'gi'), '$1y'],
        [new RegExp('(s)eries$', 'gi'), '$1eries'],
        [new RegExp('(m)ovies$', 'gi'), '$1ovie'],
        [new RegExp('(x|ch|ss|sh)es$', 'gi'), '$1'],
        [new RegExp('([m|l])ice$', 'gi'), '$1ouse'],
        [new RegExp('(bus)es$', 'gi'), '$1'],
        [new RegExp('(o)es$', 'gi'), '$1'],
        [new RegExp('(shoe)s$', 'gi'), '$1'],
        [new RegExp('(cris|ax|test)es$', 'gi'), '$1is'],
        [new RegExp('(octop|vir)i$', 'gi'), '$1us'],
        [new RegExp('(alias|status)es$', 'gi'), '$1'],
        [new RegExp('^(ox)en', 'gi'), '$1'],
        [new RegExp('(vert|ind)ices$', 'gi'), '$1ex'],
        [new RegExp('(matr)ices$', 'gi'), '$1ix'],
        [new RegExp('(quiz)zes$', 'gi'), '$1'],
        [new RegExp('s$', 'gi'), '']
    ],

    /*
     This is a list of words that should not be capitalized for title case
     */
    non_titlecased_words:[
        'and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at',
        'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over',
        'with', 'for'
    ],

    /*
     These are regular expressions used for converting between String formats
     */
    id_suffix:new RegExp('([A-Za-z0-9])(_id|Id|id_|_ID)(s?)$', 'g'),
    underbar:new RegExp('_', 'g'),
    space_or_underbar:new RegExp('[\ _-]+', 'g'),
    uppercase:new RegExp('([A-Z])', 'g'),
    underbar_prefix:new RegExp('^_'),
    camel_space_or_underbar:/([a-z])[-_ ]?([A-Z])/g,
    /*
     This is a helper method that applies rules based replacement to a String
     Signature:
     InflectionJS.apply_rules(str, rules, skip, override) == String
     Arguments:
     str - String - String to modify and return based on the passed rules
     rules - Array: [RegExp, String] - Regexp to match paired with String to use for replacement
     skip - Array: [String] - Strings to skip if they match
     override - String (optional) - String to return as though this method succeeded (used to conform to APIs)
     Returns:
     String - passed String modified by passed rules
     Examples:
     InflectionJS.apply_rules("cows", InflectionJs.singular_rules) === 'cow'
     */
    apply_rules:function (str, rules, skip, override) {
        if (override) {
            str = override;
        }
        else {
            var ignore = (skip.indexOf(str.toLowerCase()) > -1);
            if (!ignore) {
                for (var x = 0; x < rules.length; x++) {
                    if (str.match(rules[x][0])) {
                        str = str.replace(rules[x][0], rules[x][1]);
                        break;
                    }
                }
            }
        }
        return str;
    }
};


/*
 This function adds plurilization support to every String object
 Signature:
 InflectionJS.pluralize(plural) == String
 Arguments:
 plural - String (optional) - overrides normal output with said String
 Returns:
 String - singular English language nouns are returned in plural form
 Examples:
 "person".pluralize() == "people"
 "octopus".pluralize() == "octopi"
 "Hat".pluralize() == "Hats"
 "person".pluralize("guys") == "guys"
 */
InflectionJS.pluralize = function (str, plural) {
    return InflectionJS.apply_rules(
        str,
        InflectionJS.plural_rules,
        InflectionJS.uncountable_words,
        plural
    );
};

/*
 This function adds singularization support to every String object
 Signature:
 InflectionJS.singularize(singular) == String
 Arguments:
 singular - String (optional) - overrides normal output with said String
 Returns:
 String - plural English language nouns are returned in singular form
 Examples:
 "people".singularize() == "person"
 "octopi".singularize() == "octopus"
 "Hats".singularize() == "Hat"
 "guys".singularize("person") == "person"
 */
InflectionJS.singularize = function (str, singular) {
    return InflectionJS.apply_rules(
        str,
        InflectionJS.singular_rules,
        InflectionJS.uncountable_words,
        singular
    );
};


/*
 This function adds camelization support to every String object
 Signature:
 InflectionJS.camelize(lowFirstLetter) == String
 Arguments:
 lowFirstLetter - boolean (optional) - default is to capitalize the first
 letter of the results... passing true will lowercase it
 Returns:
 String - lower case underscored words will be returned in camel case
 additionally '/' is translated to '::'
 Examples:
 "message_properties".camelize() == "MessageProperties"
 "message_properties".camelize(true) == "messageProperties"
 */
InflectionJS.camelize = function (str, lowFirstLetter) {
    var str_path = str.toLowerCase().split('/');
    for (var i = 0; i < str_path.length; i++) {
        var str_arr = str_path[i].split(InflectionJS.space_or_underbar);
        var initX = ((lowFirstLetter && i + 1 === str_path.length) ? (1) : (0));
        for (var x = initX; x < str_arr.length; x++) {
            str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
        }
        str_path[i] = str_arr.join('');
    }
    return str_path.join('::');
};

/*
 This function adds underscore support to every String object
 Signature:
 InflectionJS.underscore() == String
 Arguments:
 N/A
 Returns:
 String - camel cased words are returned as lower cased and underscored
 additionally '::' is translated to '/'
 Examples:
 "MessageProperties".camelize() == "message_properties"
 "messageProperties".underscore() == "message_properties"
 */
InflectionJS.underscore = function (str) {
    var str_path = str.split('::');
    for (var i = 0; i < str_path.length; i++) {
        str_path[i] = str_path[i].replace(InflectionJS.uppercase, '_$1');
        str_path[i] = str_path[i].replace(InflectionJS.underbar_prefix, '');
    }
    return str_path.join('/').toLowerCase();
};

/*
 This function adds humanize support to every String object
 Signature:
 InflectionJS.humanize(lowFirstLetter) == String
 Arguments:
 lowFirstLetter - boolean (optional) - default is to capitalize the first
 letter of the results... passing true will lowercase it
 Returns:
 String - lower case underscored words will be returned in humanized form
 Examples:
 "message_properties".humanize() == "Message properties"
 "message_properties".humanize(true) == "message properties"
 */
InflectionJS.humanize = function (str, lowFirstLetter) {
    var rstr = str.replace(InflectionJS.id_suffix, '$1$3').replace(InflectionJS.camel_space_or_underbar, '$1 $2').replace('.', ' ').toLowerCase();
    if (!lowFirstLetter)
        return InflectionJS.capitalize(rstr);

    return rstr;
};


/*
 This function adds capitalization support to every String object
 Signature:
 InflectionJS.capitalize() == String
 Arguments:
 N/A
 Returns:
 String - all characters will be lower case and the first will be upper
 Examples:
 "message_properties".capitalize() == "Message_properties"
 "message properties".capitalize() == "Message properties"
 */
InflectionJS.capitalize = function (str) {
    return  str.toLowerCase().substring(0, 1).toUpperCase() + str.substring(1);
};

/*
 This function adds dasherization support to every String object
 Signature:
 InflectionJS.dasherize() == String
 Arguments:
 N/A
 Returns:
 String - replaces all spaces or underbars with dashes
 Examples:
 "message_properties".capitalize() == "message-properties"
 "Message Properties".capitalize() == "Message-Properties"
 */
InflectionJS.dasherize = function (str) {
    return str.replace(InflectionJS.space_or_underbar, '-');
};

/*
 This function adds titleize support to every String object
 Signature:
 InflectionJS.titleize() == String
 Arguments:
 N/A
 Returns:
 String - capitalizes words as you would for a book title
 Examples:
 "message_properties".titleize() == "Message Properties"
 "message properties to keep".titleize() == "Message Properties to Keep"
 */
InflectionJS.titleize = function (str) {
    var d = str.toLowerCase().split(InflectionJS.space_or_underbar);
    for (var i = 0, l = d.length; i < l; i++) {
        var w = d[i];
        if (InflectionJS.non_titlecased_words.indexOf(w) < 0) {
            d[i] = InflectionJS.capitalize(w);
        }
    }
    return d.join(' ');
};


/*
 This function adds ordinalize support to every String object
 Signature:
 InflectionJS.ordinalize() == String
 Arguments:
 N/A
 Returns:
 String - renders all found numbers their sequence like "22nd"
 Examples:
 "the 1 pitch".ordinalize() == "the 1st pitch"
 */
InflectionJS.ordinalize = function (str) {
    var str_arr = str.split(' ');
    for (var x = 0; x < str_arr.length; x++) {
        var i = parseInt(str_arr[x]);
        if (i === NaN) {
            var ltd = str_arr[x].substring(str_arr[x].length - 2);
            var ld = str_arr[x].substring(str_arr[x].length - 1);
            var suf = "th";
            if (ltd != "11" && ltd != "12" && ltd != "13") {
                if (ld === "1") {
                    suf = "st";
                }
                else if (ld === "2") {
                    suf = "nd";
                }
                else if (ld === "3") {
                    suf = "rd";
                }
            }
            str_arr[x] += suf;
        }
    }
    return str_arr.join(' ');
};

InflectionJS.underscore = function (camelCaseStr) {
    return InflectionJS.camelTo(camelCaseStr, '_');
};
InflectionJS.hyphenize = function (camelCaseStr) {
    return InflectionJS.camelTo(camelCaseStr, '-');
};
InflectionJS.camelTo = function camelTo (camelCaseStr, delim) {
    return camelCaseStr
        .replace(/([a-z])([A-Z])/g, '$1'+delim+'$2')
        .toLowerCase();
};

module.exports = InflectionJS;