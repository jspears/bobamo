define(['Backbone', 'libs/bobamo/edit', 'underscore'], function (B, Edit, _) {
    var template = '<div class="edit-form">' +
        '<ul style="display:none" class="unstyled error-list alert-error"></ul>' +
        '<ul style="display:none" class="unstyled success-list"></ul>' +
        '<div class="form-wrap ">' +
        '    <div class="form-container"></div>' +
        '</div>' +
        '<div class="form-actions">' +
        '    <div class="btn-group pull-left">' +
        '        <button class="btn cancel">Cancel</button>' +
        '    </div>' +
        '    <button class="btn pull-right btn-primary save finish">Save</button>' +
        '    <div style="clear:right"></div>' +
        '  </div>' +
        '</div>';
    return Edit.extend({

        model:B.Model.extend({
            url:'${pluginUrl}/change_password',
            schema:{
                'password':{
                    type:"Password"
                },
                'new_password':{
                    type:'Password',
                    title:'New Password',
                    validator:{type:'match'},
                    matches:'confirm_password'
                },
                'confirm_password':{
                    title:'Confirm Password',
                    type:'Password'
                }
            }
        }),
        template:_.template(template),
        fieldsets:{legend:'Change Password', fields:['password','new_password','confirm_password']},
        config:{
            title:'Change Password',
            plural:'',
            modelName:''
        }
    })


});