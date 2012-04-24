
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('redir_index', { title: 'Express' })
};