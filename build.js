var shell = require('shelljs');
var buildJSHint = require('build-jshint');
var UglifyJS = require("uglifyjs");
var builder = require('wui-builder');


// Perform init
shell.rm('-rf', './combo2-v0.2');
shell.mkdir('-p', './combo2-v0.2/css');


// Customize copyright
builder.addCopyright = function(src) {
    return  "/*! Combo2" + 
        // Copyright should be the year the work was first published to the year last modified
        "\n * Copyright (c) 2016 Stephen Rolfe Nielsen (rolfe.nielsen@gmail.com)" +
        "\n *" +
        "\n * @license MIT" +
        "\n * http://www.wui-js.com/wui-1-2-1/license.html" +
        "\n */ \n\n" + 
        src;
};


/*************************************** LINT BEFORE BUILD ****************************************/
var jshintErrors = 0;

var opts = {
    // Array of globs of files to skip 
    ignore: [],
    
    // Handles output of errors 
    // Default reporter logs errors to the console 
    reporter: function(error, file, src) {
        var lines = src.split(/\r\n|\n|\r/g);
        
        jshintErrors++;
        console.log(file.replace('./src/js/', '').toUpperCase() + ' '+ error.reason +'\n'+
        error.line + ':  ' + lines[error.line - 1].replace(/^\s+/,'') + '\n');
    },
 
    // Configuration for JSHint
    config: { 
        undef:  true,
        unused: true,
        
                // TODO: Currently we have instances where functions are made on the fly 
                // generating a  "The Function constructor is a form of eval." error (WO54), 
                // eventually, we want to get rid of this issue, but for now ignore it with (evil).
        evil:   false,
        
                // Exposes browser globals so they don't get caught (document, window)
        browser:true,
        
                // Exposes developer globals so they don't get caught (console, alert)
        devel:  true,
        
                // Exposes jQuery globals so they don't get caught ($, jQuery)
        jquery: true,
    },
 
    // Global variables declared (passed to JSHint) 
    globals: { 
        Wui: false
    }
};
 
var files = [
    './src/js/core-methods.js'
    , './src/js/Component/Data.js'
    , './src/js/Component/Smarty.js'
    , './src/js/goodies/Combo2.js'
];


buildJSHint(files, opts, function(err, hasError) {
    /*********************************** START BUILDING *******************************************/
    var combo = builder.concat([
        './src/js/Component/Data.js'
        , './src/js/Component/Smarty.js'
        , './src/js/goodies/Combo2.js'
    ]);

    // Create 'combo-2.js'
    builder.buildFile({
        src : [
            './src/js/libs/es5-shim.js',
            './src/js/libs/verge.js',
            builder.addCopyright(builder.concat(['./src/js/core-methods.js'])),
            combo
        ],
        dest : './combo2-v0.2/combo-2.js',
        fn: []
    });

    // Create 'combo-2.min.js'
    builder.buildFile({
        src : [
            UglifyJS.minify('./combo2-v0.2/combo-2.js').code
        ],   
        dest : './combo2-v0.2/combo-2.min.js',
        fn: ['addCopyright']
    });

    /********************************************** CSS ***********************************************/
    builder.cssMinify('./src/css/goodies/combo-2.css', './combo2-v0.2/css/combo-2.css', './src/css/goodies/');

    if (hasError === true) {
        console.log('---------------------------------------------------------------------------');
        console.log(jshintErrors+ ' JSHINT ERROR(S) (SEE ABOVE). VERIFY THE BUILD IS OKAY.');
        console.log('---------------------------------------------------------------------------');
    }
    else {
        console.log('---------------------------------------------------------------------------');
        console.log('BUILD COMPLETE AND LOOKING FINE.');
        console.log('---------------------------------------------------------------------------');
    }
});