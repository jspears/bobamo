var gen = require('../genschema'), fs = require('fs'), bobamo = require('../../../index'), Model = bobamo.DisplayModel, should = require('should');
function prettyLog(json) {
    var str = [];
    for (var i = 0, l = arguments.length; i < l; i++) {
        if (typeof arguments[i] == 'string')
            str.push(arguments[i]);
        else
            str.push(JSON.stringify(arguments[i], null, 3))
    }
    console.log(str.join(' '));
}
var LoanPoolSummary = {
    loan:{
        schemaType:"Object",
        type:"NestedModel",
        subSchema:{
            amount:{type:'Number'}
        }
    }
}

var LoanPoolStateSummary = {
    requested:{
        type:"NestedModel",
        schemaType:"Object",
        subSchema:LoanPoolSummary
    }
}

var StatusLoanPoolSummary = new Model('StatusLoanPoolSummary', [
    {
        schema:{
            forDt:{
                type:'Date'
            },
            status:{
                type:'List',
                subSchema:LoanPoolStateSummary
            }
        }
    }
])

prettyLog('StatusLoanPoolSummary', StatusLoanPoolSummary);
var m2 = {};
var slp = gen.modelToSchema(StatusLoanPoolSummary, null, null, m2);

prettyLog('slp', slp, 'm2', m2);


m2.should.have.property('StatusLoanPoolSummaryStatus');
m2.StatusLoanPoolSummaryStatus.should.have.property('properties');
m2.StatusLoanPoolSummaryStatus.properties.should.have.property('requested');
m2.StatusLoanPoolSummaryStatus.properties.requested.should.have.property('properties');
var l = m2.StatusLoanPoolSummaryStatus.properties.requested.properties.should.have.property('loan')
    .obj.should.have.have.property('properties')
        .obj.should.have.property('amount')
        .obj.should.have.property('type', 'number')

    ;
//prettyLog(l);
//m2.StatusLoanPoolSummaryStatus.properties.requested.properties.loan.should.have.property('type', 'number');

process.exit(0);
