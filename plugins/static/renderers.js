module.exports = [
    {
        name:'Text',
        description:"Settings for text fields",
        schema:{
            default:{ type:'Text' },
            ellipsis:{
                type:'Number',
                help:'Maximum length of string before ellipsing...'
            }
        }
    }
];