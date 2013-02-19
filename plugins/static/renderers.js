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
                type:'Text',
                default:'dd/mm/yyy'
            }
        }
    },
    {   name:'DateTime',
        types:['Date', 'Number', 'String'],
        schema:{
            format:{
                type:'Text',
                default:'HH:MM dd/mm/yyy'
            }
        }
    },
    {
        name:'Password',
        types:['String']
    },
    {
        name:'Multiple',
        schema:{
            itemType:{
                type:'Select',
                options:[]
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