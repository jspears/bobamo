var should = require('should'), lessf = require('../lib/less-factory'), fs = require('fs'), _u = require('underscore'), less = require('less');
var lf = new lessf();
describe('It should do less stuff', function () {
    it('should parse a nice thing', function (done) {
//        var lines = fs.readFileSync('./public/js/libs/bootstrap/less/variables.less', 'utf-8').split('\n');
        var vars = lf.variables;
        vars.should.have.property('Grays');
        vars.Grays.should.have.property('black');

        var schema = lf.schemaFor(vars);
        console.log('schema',schema);
        var fields = lf.fieldsets(vars);
        console.log('fieldsets',fields);
        done();
    });
//   it('should calculate a color', function(done){
//       var path = './public/js/libs/bootstrap/less'
//        var parser = new (less.Parser)({
//           paths:[path],
//           filename:path + '/bootstrap.less'
//       });
//       var at_imports = ["reset.less",
//           "variables.less",
//           "mixins.less",
//           "scaffolding.less",
//           "grid.less",
//           "layouts.less",
//           "type.less",
//           "code.less",
//           "forms.less",
//           "tables.less",
//           "sprites.less",
//           "dropdowns.less",
//           "wells.less",
//           "component-animations.less",
//           "close.less",
//           "buttons.less",
//           "button-groups.less",
//           "alerts.less",
//           "navs.less",
//           "navbar.less",
//           "breadcrumbs.less",
//           "pagination.less",
//           "pager.less",
//           "modals.less",
//           "tooltip.less",
//           "popovers.less",
//           "thumbnails.less",
//           "labels.less",
//           "progress-bars.less",
//           "accordion.less",
//           "carousel.less",
//           "hero-unit.less",
//           "utilities.less"]
//       function genImports(){
//
//           var str = [];
//           _u(at_imports).each(function onImport(v, k) {
//               str.push('@import "' + v + '";\n');
//           });
//           return str;
//       }
//       parser.parse(genImports().join('')+'\n .new-color { color:darken(spin(@linkColor, -10), 13%) }', function(e, tree){
//           console.log(tree.toCSS());
//           done();
//       })
//   })
})