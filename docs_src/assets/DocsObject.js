var _w = _w || {};

/**
 * Document object responsible for getting the .json file contents.
 *
 * @param   {Object}    args    A config object with the following form:
 *                              {
 *                                  fileList:   ['wui-core-methods.json','wui-data.json', ...],
 *                                  namespace:  'Wui'
 *                              }
 */
_w.DocObj = function(args){ 
    $.extend(this, {
        fileList:   ['../core.js'],
        namespace:  'Wui'
    },args);

    // A promise that gives the status of whether all documents specified in the fileList are
    // gathered.
    this.docsGathered = $.Deferred();

    this.getFiles();
};

_w.DocObj.prototype = {
    /**
        Gets all of the files in 'fileList' and creates a record of the success in getting the files
        contained in 'deferredCollection'. Proceeds to call 'process' when the requested files have
        been acquired.
    */
    getFiles: function() {
        var me = this;

        // List of promises that will later be repurposed to show status of ajax requests
        me.deferredCollection = [];

        me.successCount = 0;

        me.fileList.forEach(function(itm,i,arry) {
            var fileItemDeferredObj = $.Deferred();

            // Create a deferred that can be resolved on complete
            // otherwise the failure of a resource will mess up all of them
            me.deferredCollection.push(fileItemDeferredObj);

            $.ajax({
                url:        itm,
                dataType:   'text',
                cache:      false,
                complete:   function(xhr, status) {
                                var xhrResult = {
                                    uri:    itm,
                                    success: (status == 'success')
                                };

                                if (xhrResult.success) {
                                    $.extend(xhrResult, {json: xhr.responseText});
                                    me.successCount++;
                                }
                                else {
                                    $.extend(xhrResult, {error: xhr.statusText});
                                }

                                fileItemDeferredObj.resolve(xhrResult);
                            }
            });
        });

        $.when.apply( $, me.deferredCollection ).done(function() {
            // Repurpose the list to show status
            me.deferredCollection = arguments;

            me.process();
            
            // Signals that all requests have been processed for this document
            me.docsGathered.resolve(me.deferredCollection);
        });
    },
    
    process: function(){
        var me = this;

        if(me.successCount < me.fileList.length) {
            // Fire some less than 100% message
            console.log('Didn\'t process all files.');
        }

        if(me.successCount > 0) {
            // Break the code into objects, methods, and configs
            _.each(me.deferredCollection,function(itm, i) {
                if(itm.success) {
                    itm.json = JSON.parse(itm.json);
                }
            });
        }
        else {
            // Admit defeat. There's nothing more to do.
            console.log('Total Failure. No files retrieved.');
        }
    }
};

// APP SETUP
var dv = {
    docEngine1:     new _w.DocObj({
                        fileList:   [FILE_LIST_FROM_BUILD_SCRIPT],
                        namespace:  'Wui'
                    }),
    data:           [],
    instance:       {}
};

dv.data = [dv.docEngine1.docsGathered];


// VIEWS
$.when.apply($, dv.data).done(function() {
    console.log(arguments);
});