var DataTypes = require('./data-types'), _u = require('underscore');
var SelectOpts = {
    options:{
        type:'List',
        help:'A list of options, A, B, C... mutually exclusive with collection and url'
    },
    collection:{
        type:'String',
        help:'the path to a collection to use to populate'
    },
    url:{
        type:'String',
        help:'A url to pull the response from expecting it in [{label:label, val:val}] format'
    },
    refresh:{
        type:'Checkbox',
        help:'Refresh the select list with every render'
    }
}

module.exports = [
    {
        name:'Text',
        types:['String', 'Boolean', 'Number', 'Date'],
        schema:{
            placeholder:{ type:'Text' },
            dataType:{ type:'Select', options:DataTypes.String}

        }
    },
    {
        name:'FilterText',
        types:['String', 'Boolean', 'Number', 'Date'],
        schema:{
            placeholder:{ type:'Text' },
            filter:{
                type:'FilterTextConfigEditor',
                help:'A regular expression to match against'
            },
            dataType:{ type:'Select', options:DataTypes.String}

        }
        //,fields:['filter', 'placeholder', 'dataType']

    },
    {
        name:'Integer',
        types:[ 'Number'],
        schema:{
            placeholder:{ type:'Text' }
        }
    },
    {
        name:'TypeAhead',
        types:['String'],
        schema:_u.extend({placeholder:{ type:'Text' }},SelectOpts)
    },
    {
        name:'TextArea',
        types:['String', 'Boolean', 'Number', 'Date'],
        schema:{
            placeholder:{ type:'Text' },
            dataType:{ type:'Select', options:DataTypes.String},
            maxChars:{type:'Number', help:'Maximum number of charecters for twitter-esq display'},
            rows:{type:'Number', help:'Default number of rows'},
            cols:{type:'Number', help:'Default number of cols'}

        }
    },
    {
        name:'Hidden',
        types:['String', 'Boolean', 'Number', 'Date'],
        schema:{
            defaultValue:{type:'Text' }
        }
    },
    {   name:'Checkbox',
        types:['String', 'Number', 'Boolean'],
        schema:{
            defaultValue:{type:'Checkbox' }
        }
    },
    {   name:'Date',
        types:['Date', 'Number', 'String'],
        schema:{
            yearStart:{type:'Number', help:'The year to start the display'},
            yearEnd:{type:'Number', help:'The year to stop display'},
            showMonthNames:{type:'Checkbox', checked:true},
            monthNames:{type:'Text', help:"Comma deliminted listing of month names 'Jan', 'Feb', ...'"}
        }
    },
    {   name:'DateTime',
        types:['Date', 'Number', 'String'],
        schema:{
            minsInterval:{type:'Number', help:'Defaults to 15, so it is populated with 0, 15, 30, and 45 minutes.'}
        }
    },
    {
        name:'Password',
        types:['String']
    },
    {
        name:'Radio',
        types:['Boolean', 'String'],
        schema:{
            options:{
                type:'List',
                help:'A list of options, A, B, C...'
            }
        }
    },
    {
        name:'Select',
        types:['String'],
        schema:SelectOpts

    },
    {
        name:'MultiEditor',
        types:[ 'ObjectId'],
        schema:SelectOpts

    },
    {
        name:'TokenEditor',
        types:['ObjectId'],
        schema:{
            url:{
                type:'Text',
                help:'By default token editor will query and filter on whatever is labelAttr, use this' +
                    ' to use a different rest url for this, the id of the parent object will be passed as ' +
                    ' an attribute _id',
                placeholder:'/rest/{ref}?transform=labelval&limit=10&_id={id}'
            }
        }
    },
    {   name:'Number',
        types:['Number', 'String'],
        schema:{
            placeholder:{ type:'Text' },
            defaultValue:{type:'Number' },
            dataType:{ type:'Select', options:DataTypes.Number}
        }
    },
    //  { name:'Search', types:['ObjectId']},
    //  { name:'Link', types:['ObjectId']},
    //  { name:'List', types:['ObjectId']},
    { name:'NestedModel', types:['ObjectId', 'Object']},
    { name:'Object', types:['Object']}

];