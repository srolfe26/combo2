var shell = require('shelljs');
var buildJSHint = require('build-jshint');
var UglifyJS = require("uglifyjs");
var builder = require('wui-builder');
var version = '1.0';

// Perform init
shell.rm('-rf', './dist');
shell.mkdir('-p', './dist/css');


// Customize copyright
builder.addCopyright = function(src) {
    return  "/*! Combo2 " + version +  
        // Copyright should be the year the work was first published to the year last modified
        "\n * Copyright (c) 2016 Stephen Rolfe Nielsen" +
        "\n *" +
        "\n * https://github.com/srolfe26/combo2" +
        "\n *" +
        "\n * @license MIT 2016 Stephen Rolfe Nielsen" +
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
    './src/core-methods.js'
    , './src/Data.js'
    , './src/Smarty.js'
    , './src/Combo2.js'
];


buildJSHint(files, opts, function(err, hasError) {
    /*********************************** START BUILDING *******************************************/
    var combo = builder.concat([
        './src/Data.js'
        , './src/Smarty.js'
        , './src/Combo2.js'
    ]);

    // Create 'combo-2.js'
    builder.buildFile({
        src : [
            './src/libs/es5-shim.js',
            './src/libs/verge.js',
            builder.addCopyright(builder.concat(['./src/core-methods.js'])),
            combo
        ],
        dest : './dist/combo-2.js',
        fn: []
    });

    // Create 'combo-2.min.js'
    builder.buildFile({
        src : [
            UglifyJS.minify('./dist/combo-2.js').code
        ],   
        dest : './dist/combo-2.min.js',
        fn: ['addCopyright']
    });

    /********************************************** CSS *******************************************/
    builder.cssMinify('./src/css/combo-2.css', './dist/css/combo-2.css', './src/css/');

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