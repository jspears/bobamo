module.exports = function (bobamo) {
    var mongoose = bobamo.mongoose, Schema = mongoose.Schema;

    var GroupSchema = new Schema({
        name: {type: String, unique: true, index: true, required: true},
        description: {type: String},
        created_at: {type: Date},
        modified_at: {type: Date}
    }, {display: {labelAttr: 'name'}});

    GroupSchema.pre('save', function (next) {
        if (this.isNew) {
            this.created_at = Date.now();
        } else {
            this.modified_at = Date.now();
        }
        next();
    });
    GroupSchema.statics.search = function (q, search) {
        search = search || q.search || '.*';
        var re = new RegExp(search, 'gi');
        return this.find({}).or([
            {name: re},
            {description: re}
        ]);
    };
    GroupSchema.statics.search.display = {
        data: {search: ''},
        schema: {
            search: {type: 'Text', title: 'Search', help: 'Search for groups'}
        },
        method: 'GET',
        fieldsets: [
            {"legend": "Search Group", "fields": ["search"]}
        ]
    };
    var summary = GroupSchema.statics.summary = function (q) {
        //todo implement query that counts users in groups
        return this.find(q);

    }
    summary.display = {
        schema: {
            search: {type: 'Text', title: 'Summary', help: 'Summary of groups'}
        },
        responseModel: {
            modelName: 'GroupSummary',
            schema: {
                user_count: { type: 'Number'},
                group: {type: 'Text'}
            }
        }

    }
    var Group = mongoose.model('group', GroupSchema);
}