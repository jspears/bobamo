var _u = require('underscore');
module.exports = function MField(p, field) {
    this.path = p;
    _u.extend(this, field);
}
