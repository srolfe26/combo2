var shell = require('shelljs');
var buildJSHint = require('build-jshint');
var UglifyJS = require("uglifyjs");
var builder = require('wui-builder');
var jQuery = require('jquery-deferred');
var version = '1.1.5';
var destination = './dist';


var options = {};
var alt_version;
var doc_file_list = [];
var files = [
    './src/core-methods.js'
    , './src/Data.js'
    , './src/Smarty.js'
    , './src/Combo2.js'
];
var css_promise;
var doing_smarty = false;

/********************************** PROCESS OPTIONS *******************************************/
process.argv.slice(2).forEach(function (val, index, array) {
    options[val] = index;
});

// Print help
if (typeof options['--help'] != 'undefined') {
    console.log('');
    console.log('Wui.Combo2 Build Script');
    console.log('=======================');
    console.log('This build script will run linting on core-methods.js, Data.js, Smarty.js, and Combo2.js');
    console.log('and then concatenate them into minfied and unminified files in the dist (or otherwise');
    console.log('specified) folder.');
    console.log('');
    console.log('--help     Display the help menu');
    console.log('--docs     Do extra processing to generate docs');
    console.log('--noie8    Don\'t include the ES5 shim code');
    // console.log('--smarty   Just outputs Wui.Smarty in the distribution folder'); I'm doing this, but I don't want to advertise... yet.
    console.log('--version  If the version number is specified here, the output directory will be ');
    console.log('           \'combo2-v[version]\' instead of \'dist\'');
    console.log('');
    console.log('');
    
    return;
}


if (typeof options['--smarty'] != 'undefined') {
    var files = ['./src/Smarty.js'];
    destination = './wui-smarty';
    doing_smarty = true;
}

if (typeof options['--version'] != 'undefined') {
    alt_version = -1;
    
    for (var key in options) {
        if (options[key] == options['--version'] + 1) {
            alt_version = key;
        }
    }
    
    if (alt_version == -1) {
        console.log('Version flag was used, but no version was given.');
        return false;
    }
    else {
        version = alt_version;
        console.log(version);
        destination = './combo2-v' + version;
    }
    
}


// Perform init
shell.rm('-rf', destination);
if (!doing_smarty) {
    shell.mkdir('-p', destination + '/css');
}


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


buildJSHint(files, opts, function(err, hasError) {
    /*********************************** START BUILDING *******************************************/
    var buildSrc = [
        './src/libs/es5-shim.js',
        './src/libs/verge.js',
        builder.addCopyright(builder.concat(['./src/core-methods.js'])),
        builder.concat([
            './src/Data.js'
            , './src/Smarty.js'
            , './src/Combo2.js'
        ])
    ];

    if (typeof options['--noie8'] != 'undefined') {
        buildSrc.shift();
    }

    if (!doing_smarty) {
        // Create 'combo-2.js'
        builder.buildFile({
            src: buildSrc,
            dest: destination + '/combo-2.js',
            fn: []
        });

        // Create 'combo-2.min.js'
        builder.buildFile({
            src : [
                UglifyJS.minify(destination + '/combo-2.js').code
            ],
            dest : destination + '/combo-2.min.js',
            fn: ['addCopyright']
        });
    }
    else {
        builder.buildFile({
            src: [
                builder.addCopyright(builder.concat(['./src/Smarty.js']))
            ],
            dest: destination + '/Smarty.js',
            fn: []
        });

        // Create 'combo-2.min.js'
        builder.buildFile({
            src : [
                UglifyJS.minify(destination + '/Smarty.js').code
            ],
            dest : destination + '/Smarty.min.js',
            fn: ['addCopyright']
        });
    }


    /***************************************** DOCUMENTATION **************************************/
    if (typeof options['--docs'] != 'undefined') {
        console.log('... creating docs ...');
        shell.mkdir('-p', destination + '/docs');
        
        files.map(function(file) {
            var retval = {file: file, name: null};
            
            file.replace(/\/([\w-]+)\./g, function(match, name) {
                retval.name = 'wui-' + name.toLowerCase(); 
            });
            
            return retval;
        }).forEach(function(obj) {
            var filename = obj.name + '.json';
            
            doc_file_list.push('\'' + filename + '\'');
            shell.exec('documentation build ' + obj.file + ' > ' +destination+ '/docs/' + filename);
        });
        
        // Copy documentation interface
        shell.cp('-R', './docs_src/', destination + '/docs');
        shell.sed('-i', 'FILE_LIST_FROM_BUILD_SCRIPT', doc_file_list.join(','), destination + '/docs/assets/docsViews.js');
    }
    

    /********************************************** CSS *******************************************/
    if (!doing_smarty) {
        css_promise = builder.cssMinify('./src/css/combo-2.css', destination + '/css/combo-2.css', './src/css/');
    }
    else {
        css_promise = jQuery.Deferred().resolve();
    }

    css_promise.done(function() {
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
});