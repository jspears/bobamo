var mongoose = require('mongoose'), User = require('../../../examples/model/user');
mongoose.connect('mongodb://localhost/bobamo_development', function () {
    console.log('connected');
                         var log = function(err, resp){

                             console.log('log', resp);
                             process.exit(0);
                         }

    var map = function(){
        day = Date.UTC(this.created_at.getFullYear(), this.created_at.getMonth(), this.created_at.getDate());
        emit(day,{count:1});
    }
    var reduce = function(key, values){
        var count = 0;
        values.forEach(function(v){
           count += v['count'];
        });
        return {count:count};
    }
    User.collection.runCommand( { dbStats: 1 } )
    User.collection.mapReduce(
        map.toString(),
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
                throw err;

            collection.find({}).limit(10).toArray(log);

        }
    );
});