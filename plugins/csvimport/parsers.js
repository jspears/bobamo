var _ = require('underscore'), moment = require('moment');
module.exports  = [
    {
        type:'Date',
        types:['Date'],
        schema:{
            format:'Text',
            defaultValue:{
                type:"Text",
                help:"A javascript date string, a unix timestamp or now for the current time"
            }
        },
        parser:function (opts) {
            var dv = opts.defaultValue;
            return function (value) {
                if (!value) {
                    if (dv == 'now')
                        return new Date();
                    value = dv;
                }
                if (opts.format){
                    return moment(value, opts.format).toDate();
                }
                return moment(value).toDate();
            }
        }
    },
    {
        type:'Number',
        types:['Number'],
        schema:{
            format:{
                type:'Text'
            },
            defaultValue:'Number'
        },
        parser:function (opts) {
            var dv = opts.defaultValue;
            return function (value) {
                if (_.isUndefined(value))
                    return parseFloat(opts.defaultValue);
                return parseFloat(value);
            }
        }
    },
    {
        type:'Counter',
        types:['Number'],
        help:"Counter just increments a number per row to allow for keeping track of what row the csv was at",
        schema:{
            startValue:{
                type:'Integer',
                help:'Start value by default is 0, which means the first value returned will be 1, change to start at another number'
            }
        },
        parser:function (opts) {
            var dv = opts.startValue || 0;
            return function (value) {
                return ++dv;
            }
        }
    },
    {
        type:'automatic',
        schema:{
            ignoreErrors:{
                type:'Checkbox',
                help:'Ignore errors will use the defaultValue if available for the derived mapping type, if no derived default than it will insert null and log the error'
            }
        }
    },
    {
        type:'split',
        types:['List'],
        schema:{
            regexp:{
                type:'Text'
            },
            seperator:{
                type:'Text'
            }
        },
        defaults:{
            regexp:',\s+?'
        },
        parser:function (opts) {
            var re = opts.regexp ? new RegExp(opts.regexp) : opts.seperator;
            return function (value) {
                return value && value.split(re);
            }
        }
    },
    {
        type:'JSON',
        parser:function(){
            return function(value){
                try {
                    return JSON.parse(value)
                }catch(e){
                    console.log('error parsing', value);
                }
            }
        }
    },
    {
        type:'Regex',
        types:['String'],
        schema:{
            regexp:{
                type:'Text',
                help:"Regular Expression Substitution",
                placeholder:"(.*)"
            },
            pattern:{
                type:'Text',
                placeholder:"$1",
                help:"Pattern to do replacement"
            }
        },
        parser:function (opts) {
            var re = new RegExp(opts.regexp), pattern = opts.pattern || "$1";
            return function (value) {
                return value && value.replace(re, pattern);
            }
        }
    },
 /*Think about how we could combine columns to create Lists, very often in csv
    you see col1,col2,col3, etc.   and what they really mean is it is a list..
    So the idea is you specify the column names, and it will parse them with what is
    configured, but it will put them in the list format.    To add to the difficulty
    the individual list items might be async.   I think for the short term, use split
    instead of this.... on to saving....
*/
//    {
//      type:'Combine',
//      types:['List'],
//      schema:{
//          itemType:{
//              type:'Text'
//          },
//          columns:{
//              type:'List',
//              itemType:'Select',
//              options:[]
//          }
//      }
//    },
    {
        type:'String',
        types:['String'],
        schema:{
            trim:'Checkbox',
            stringCase:{
                type:'Select',
                options:[
                    {label:'Natural', val:''},
                    {label:'Upper Case', val:'uppercase'},
                    { label:'Lower Case', val:'lowercase'}
                ]
            },
            defaultValue:'Text'
        },
        exporter:function () {

        },
        parser:function (opts) {
            var trim = opts.trim, lowercase = opts.lowercase, uppercase = opts.uppercase;
            return function (value) {
                if (!value) {
                    return opts.defaultValue;
                }

                var val = value;
                if (trim)
                    val = val.trim();

                if (lowercase)
                    val = val.toLowerCase();
                else if (uppercase)
                    val = val.toUpperCase();

                return val;

            }
        }
    }
]