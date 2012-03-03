var s = require('../app/lib/string'), should = require('should');

describe('String Functions', function(){
    describe('toTitle', function(){
        it('should return title case underscore sepeartor', function(done){
           s.toTitle('stuff_like_this').should.eql('Stuff Like This');
            done();
        });

        it('should return title case hyphen seperator', function(done){
            s.toTitle('stuff-like-this').should.eql('Stuff Like This');
            done();
        });

        it('should return title case space seperator', function(done){
            s.toTitle('stuff like this').should.eql('Stuff Like This');
            done();
        });
        it('should return title case mixed seperator', function(done){
            s.toTitle('stuff-like_this stuff').should.eql('Stuff Like This Stuff');
            done();
        });
        it('should return title case multiple seperator', function(done){
            s.toTitle('--stuff--like__this stuff').should.eql('Stuff Like This Stuff');
            done();
        });
        it('should return title case with number', function(done){
            s.toTitle('--stuff--like__this 0stuff0').should.eql('Stuff Like This 0stuff0');
            done();
        });
        it('should return title case multiple seperator and case', function(done){
            s.toTitle('--STuff--like__this stuff').should.eql('STuff Like This Stuff');
            done();
        });

    })

})