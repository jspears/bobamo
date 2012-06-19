var Plugin = require('../../lib/plugin-api'), mongoose = require('mongoose'), _u = require('underscore'), util = require('util'), path = require('path'), static = require('connect/lib/middleware/static');
var VisPlugin = function () {
    Plugin.apply(this, arguments);
}
util.inherits(VisPlugin, Plugin);

VisPlugin.prototype.routes = function () {
    var app = this.app;
    var intervals = {
        day:function () {
            day = Date.UTC(this.created_at.getFullYear(), this.created_at.getMonth(), this.created_at.getDate());
            emit(day, 1);
        },
        hour:function(){
            day = Date.UTC(this.created_at.getFullYear(), this.created_at.getMonth(), this.created_at.getDate(), this.created_at.getHours());
            emit(day,1)
        },
        minute:function(){
            day = Date.UTC(this.created_at.getFullYear(), this.created_at.getMonth(), this.created_at.getDate(), this.created_at.getHours(), this.created_at.getMinutes());
            emit(day,1)

        }
    }
    var reduce = function (key, values) {
        var count = 0;
        values.forEach(function (v) {
            count += v;
        });
        return count;
    }
             //{"date": "1985-05-20", "count": 8}
    var pad = function(v){
        return v < 10 ? '0'+v : v;
    }
    var transform = function(v){
        var d = new Date(v._id)
        return {date:d.getFullYear()+'-'+ pad(d.getMonth()+1)+'-'+ pad(d.getDate()), count:v.value};
    }
    app.get(this.pluginUrl + '/data/:type', function (req, res, next) {
        var interval = req.query.interval || 'day';

        mongoose.model(req.params.type).collection.mapReduce(
            intervals[interval].toString(),
            reduce.toString(),
            {
                out:"kicktotals",
                query:{
//            id: ''
//            ,
//            created_at: {
//                $gte : new Date(options.startDate+''),
//                $lt : new Date(options.endDate+'')
//            }
                },
                include_statistics:true
            },
            function (err, collection, stats) {
                if (err)
                    return next(err);

                collection.find({}).limit(10).toArray(function (err, resp) {
                    if (err) return next(err);
                    res.send({
                        status:0,
                        payload:_u.map(resp, transform)
                    })
                });

            }
        );
    }.bind(this))

}

module.exports = VisPlugin;