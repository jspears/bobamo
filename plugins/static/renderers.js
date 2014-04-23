module.exports = [
    {
        name:'Text',
        ref:'renderer.Text',
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