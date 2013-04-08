define(['underscore', 'modeleditor/views/admin/editors'], function (_, Editors) {
    "use strict";
    function editorFor(val) {
        var first = null, second = null, third = null, pos = -1;
        _.each(Editors, function (v, k) {
            if (k == val){
                first = k;
                //break;
                return false;
            }else if (v && v.types) {
                var idx = v.types.indexOf(val);
                if (idx > pos) {
                    third = k;
                    pos = idx;
                }else{
                    second = k;
                }
            }
        });
        return first || second || third || 'Text';
    }

    function editorsFor(val) {
        var editors = [];
        _.each(Editors, function (v, k) {
            if (v && v.types) {

                if (~v.types.indexOf(val))
                    editors.push(k);
            } else {
                editors.push(k)
            }
        });
        return editors;
    }

    return { editorFor: editorFor, editorsFor: editorsFor, Editors: Editors  }
});