
/*
 * GET home page.
 */

exports.index = function(req, res, next){
//  res.render(req.isAuthenticated() ? 'index' : 'signin', { title: 'Mojaba' })
    res.render('index', { title: 'Mojaba' })
};