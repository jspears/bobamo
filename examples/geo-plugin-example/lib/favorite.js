var mongoose = require('mongoose');
var FavoriteSchema = new mongoose.Schema({
    meta        : {
        favorite:Number,
        links:[
            {type:String}
        ],
        terms:[
            {
                label:{type:String},
                value:{type:Number}
            }
        ]
    }
});
var Favorite = mongoose.model('Favorite', FavoriteSchema)

module.export = Favorite;