var path = require('path'),
    inflection = require('../../index').inflection,
    _u = require('underscore'), fs = require('fs'), child = require('child_process'), spawn = child.spawn, exec = child.exec;
function zip(dir, cb) {
    var dirname = path.basename(dir);
    var cwd = path.dirname(dir);
    var zipfile = dir+".zip";
    if (fs.existsSync(zipfile)){
        console.log('zipfile exists sending', zipfile);
        return cb(null, zipfile)
    }

    console.log('zipping '+dir);
    exec('jar cf \"' + zipfile + '\" .', {cwd:dir}, function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
            cb(error);
        } else {
            console.log('zipped ', zipfile);
            cb(null, zipfile)
        }
    });
}
/**
 * Generates the clients, with any luck.
 * @param pluginDir
 * @param version
 * @param type
 * @param cb
 * @return {*}
 */
module.exports = function genDoc(plugin, type, cb) {
//    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
//    export CLASSPATH="$DIR/../target/lib/*:$DIR/../target/*"
//    export JAVA_OPTS="${JAVA_OPTS} -XX:MaxPermSize=256M -Xmx1024M -DloggerPath=conf/log4j.properties"
//    JAVA_OPTS=$JAVA_OPTS scala -cp $CLASSPATH "$@" samples/client/petstore/java/JavaPetstoreCodegen.scala http://petstore.swagger.wordnik.com/api/api-docs.json special-key
    var app = plugin.pluginManager.appModel;
    var codegen = plugin.conf.codegen;
    var scala = plugin.conf.scala;
    var joots = plugin.conf.java_opts;
    var code = [
        'com',
        'wordnik',
        'swagger',
        'codegen',
        'Basic' + (type) + 'Generator'
    ];
    var title = app.title+"";
    var clientName = [title.replace(/\s+?/g, '_'), app.version, type].join('-').toLowerCase();
    var out = [plugin.path, 'public', 'export', 'client', type, clientName];
    var _p = '', dirPath = path.join.apply(path, out);
    console.log('dirPath '+dirPath, out);
    if (fs.existsSync(dirPath)) {
        return zip(dirPath, cb);
    }
    out.forEach(function (v, k) {
        _p = path.join(_p, v);
        if (!fs.existsSync(_p)) {
            console.log('making', _p);
            fs.mkdirSync(_p)
        }
    });

    var scalaPath = path.join(scala, 'bin', 'scala');
//concat(joots.split(/\s+?/))
    var args = [
        //'-cp',
        //path.join(codegen, 'target', 'lib', '*') + ":" + path.join(codegen, 'target', '*')].concat(
//        [
        code.join('/'),
        '-DfileMap=' + plugin.conf.url + plugin.pluginUrl + '/swagger'];
   var java_home = plugin.conf.java;
    var opts = {
        cwd:_p,
        env:_u.extend({
            'JAVA_OPTS':joots,
            JAVA_HOME:java_home,
            PATH:java_home+'/bin/java',
            CLASSPATH:java_home+'/lib:'+path.join(codegen, 'target', 'lib')+":"+path.join(codegen, 'target', 'classes') + ":" + path.join(codegen, 'target', '*')
        }, process.env)

    };
    console.log('spawn', scalaPath, args, opts);

    exec(codegen+'/bin/runscala.sh '+ code.join('.')+' -DfileMap=' + plugin.conf.url + plugin.pluginUrl + '/swagger', {
        cwd:_p,
        env:{
            PATH:scala+"/bin:"+java_home+'/bin:'+process.env.PATH
        }
    }, function(e, o){
        if (e){
            console.log('error', e);
            return cb(e, null);
        }else{
            zip(_p, cb);
//            cb(null, clientName);
        }
    });
//    var proc = spawn(scalaPath, args, opts);
//    proc.stdout.on('data', function (d) {
//        console.log('exec:', d.toString('utf8'));
//    })
//    proc.stderr.on('data', function (d) {
//        console.log('error:', d.toString('utf8'));
//    })
//    proc.on('exit', function (e) {
//        console.log('exited on ', e);
//        if (e == null) {
//            zip(null, clientName, cb);
//        }
//        else
//            cb('did not gen client', null);
//    });


}