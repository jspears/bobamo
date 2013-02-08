var DataTypes = require('./data-types')
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
                help:'A regular expression to match against',
            },
            dataType:{ type:'Select', options:DataTypes.String}

        }
        //,fields:['filter', 'placeholder', 'dataType']

    },
    {
        name:'TypeAhead',
        types:['String', 'Number', 'Date'],
        schema:{
            placeholder:{ type:'Text' },
            dataType:{ type:'Select', options:DataTypes.String},
            options:{
                type:'List'
            }
        }
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
        schema:{
            options:{
                type:'List',
                help:'A list of options, A, B, C...'
            }
        }
    },
    {
        name:'MultiEditor',
        types:[ 'ObjectId'],
        schema:{
            ref:{
                type:'Select',
                collection:'views/modeleditor/admin/schema-collection'
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