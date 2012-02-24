define(['Backbone', 'jQuery'], function (Backbone, $) {
    var Employee = Backbone.Model.extend({

        url:function () {
           return "/api/employee/"+this.id+'?populate[manager]=firstName,lastName,_id'
        },

        initialize:function onIntialize() {
            this.reports = new EmployeeCollection();
            this.reports.url = '/api/employee/' + this.id + '/reports?populate=reports';
        },
        idAttribute:'_id',
        parse:function (resp) {
            console.log('parse', resp);
            return resp.payload;
        },
        defaults:{
            title:'',
            url:'default.png',
            firstName:null,
            lastName:null,
            officePhone:null,
            cellPhone:null,
            email:null,
            twitterId:null,
            manager:{
                _id:null,
                firstName:null,
                lastName:null
            }

        }

    });

    var EmployeeCollection = Backbone.Collection.extend({

        model:Employee,
        parse:function (resp) {
            console.log('parse', resp);
            return resp.payload;
        },
        url:"/api/employee",
        idAttribute:'_id',
        findByName:function (key) {
            // TODO: Modify service to include firstName in search
            var url = (key == '') ? '../api/employee' : "../api/employee/finder/search?term=" + key;
            console.log('findByName: ' + key);
            var self = this;
            $.ajax({
                url:url,
                dataType:"json",
                success:function (data) {
                    console.log('success', data);
                    console.log("search success: " + data);
                    self.reset(data.payload);
                }
            });
        }

    });
    return {
        EmployeeCollection:EmployeeCollection,
        Employee:Employee
    };
});