define(['Backbone', 'libs/bobamo/edit', 'underscore', 'libs/editors/password-editor'], function (B, EditView, _) {
    var template = '<div class="edit-form">' +
        '<ul style="display:none" class="unstyled error-list alert-error"></ul>' +
        '<ul style="display:none" class="unstyled success-list"></ul>' +
            '<div class="form-wrap ">' +
                '<div class="form-container"> </div>' +
                '<div class="form-actions"></div>' +
            '</div>' +
        '</div>';

    return EditView.extend({
        template: _.template(template)            ,
        fieldsets: {legend: 'Change Password', fields: ['password', 'new_password', 'confirm_password']},
        model: B.Model.extend({
            url: '${pluginUrl}/change_password',
            schema: {
                'password': {
                    type: 'Text',
                    dataType:'password',
                    validators: [{type:'required'}],
                    title:'Current Password'
                },
                'new_password': {
                    type: 'Text',
                    dataType:'password',
                    title: 'New Password',
                    validators: [{type: 'match', match:'confirm_password'}, {type:'required'}],
                    matches: 'confirm_password'
                },
                'confirm_password': {
                    title: 'Confirm Password',
                    type: 'Text',
                    validators: [{type:'required'}],
                    dataType:'password'
                }
            }

        })
        ,
        buttons: {
            'left': [
                {
                    html: 'Cancel',
                    clsNames: 'cancel',
                    type: 'button',
                    events: {
                        'click .cancel': 'onCancel'
                    }
                }
            ],
            'right': [
                {
                    html: 'Change',
                    clsNames: 'save btn-primary',
                    type: 'button',
                    events: {
                        'click .save': 'onSave'
                    }
                }
            ]
        },
        config: {
            title: 'Change Password',
            plural: '',
            modelName: ''
        }

    });
});