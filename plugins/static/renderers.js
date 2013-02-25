module.exports = [
    {
        name:'Text',
        types:['String', 'Boolean', 'Number', 'Date'],
        description:"Settings for text fields",
        schema:{
            default:{ type:'Text' },
            ellipsis:{
                type:'Number',
                help:'Maximum length of string before ellipsing...'
            }
        }
    },
    {
        name:'Hidden'
    },
    {   name:'Boolean',
        types:['String', 'Number', 'Boolean'],
        schema:{
            trueDisplay:{type:'Text', placeholder:'true' },
            falseDisplay:{type:'Text', placeholder:'false'}
        }
    },
    {   name:'Date',
        types:['Date', 'Number', 'String'],
        schema:{
            format:{
                type:'Text'
            }
        },
        defaults:{
            format:'dd/mm/yyy'
        }
    },
    {   name:'DateTime',
        ref:'static/Date',
        defaults:{
            format:'HH:MM dd/mm/yyy'
        }
    },
    {
        name:'Password',
        types:['String']
    },
    {
        name:'Multiple',
        types:['List'],
        schema:{
            itemType:{
                type:'Select',
                multiple:false,
                collection:'renderer/admin/collection',
                refresh:true,
                help:'Select a renderer for renderering each item'
            },
            number:{
                type:'Integer',
                help:'The number of items to show before ellipsing...'
            }
        }
    },
    {   name:'Number',
        types:['Number', 'String'],
        schema:{
            format:{ type:'Text', placeholder:"###.##" }
        }
    }
];