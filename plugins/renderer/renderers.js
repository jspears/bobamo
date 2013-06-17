module.exports = [

    {
        name: 'Text',
        schema: {
            default: 'Text',
            labelAttr: 'Text',
            maxLength: 'Number'
        }
    },
    {
        name: 'Hidden'
    },
    {
        name:'Collection',
        schema:{
            collection:{
                type:'Select',
                collection:'modeleditor/views/admin/schema-collection'
            }
        }
    },
    {
        name :'Template',
        schema:{
            template:{
                type:'TextArea',
                validators:[{type:'required'}]
            }
        },
        defaults:{
            template:'<%=value%>'
        }
    },
    {   name: 'Boolean',
        types: ['String', 'Number', 'Boolean'],
        schema: {
            trueDisplay: {type: 'Text', placeholder: 'true' },
            falseDisplay: {type: 'Text', placeholder: 'false'}
        }
    },
    {   name: 'Date',
        types: ['Date', 'Number', 'String'],
        schema: {
            format: {
                type: 'Text',
                help: 'See <a target="_blank" href="http://momentjs.com">momentjs</a> for information on formatting'
            }
        },
        defaults: {
            format: "MMMM Do YYYY"
        }
    },
    {   name: 'DateTime',
        ref: 'renderer.Date',
        defaults: {
            format: 'MMMM Do YYYY, h:mm:ss a'
        }
    },
    {   name: 'Time',
        ref: 'renderer.Date',
        defaults: {
            format: 'h:mm:ss a'
        }
    },
    {
        name: 'Password',
        types: ['String']
    },
    {
        name: 'Multiple',
        types: ['List'],
        schema: {
            itemType: {
                type: 'Select',
                multiple: false,
                collection: 'renderer/admin/collection',
                refresh: true,
                help: 'Select a renderer for renderering each item'
            },
            number: {
                type: 'Integer',
                help: 'The number of items to show before ellipsing...'
            }
        }
    },
    {   name: 'Number',
        types: ['Number', 'String'],
        schema: {
            format: { type: 'Text', placeholder: "###.##", help: 'See <a  target="_blank" href="http://numeraljs.com/">numeraljs</a> for help with formatting numbers' }
        }
    }
]