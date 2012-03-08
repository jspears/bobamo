var app = require('../app/lib/app-model'), should =require('should');

describe('Application Model', function(){
    describe('Chained Fields', function(){
        it('should chain the fields', function(done){
            var obj = {
                type:'Text',
                path:'test',
                dataType:'String'
            }
            var m = new app.Field(obj);
            console.log('m',m);
            m.should.have.property('type', 'Text');
            done();
        })

    })

})