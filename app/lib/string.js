var reCamel = /((\[_-\s]+)?)([a-zA-Z0-9]*)/g;
var sp = /[_-\s]+/g;
function toTitleRe($4,$3,$2,$1){
     return $1.substring(0,1).toUpperCase()+$1.substring(1);
};

function toTitle(str) {
    return str.replace(reCamel, toTitleRe).replace(sp, ' ').trim();
}
module.exports = {
    toTitle:toTitle
}