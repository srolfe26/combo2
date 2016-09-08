// Make sure the WUI is defined.
/* jshint ignore:start */
var Wui = Wui || {};
/* jshint ignore:end */

/**
 * Returns a string that will be a unique to use on the DOM. Output in the format 'prefix-n'.
 *
 * @param       {String}    prefix      Optional. A string to use before the number. Default is 'wui'.
 *
 * @returns     {String}    The prefix plus a number that is incremented each time this function is called.
 */
Wui.id = function(prefix) {
    prefix = (Wui.isset(prefix) && prefix.length && prefix.length > 0) ? prefix : 'wui';
    
    return prefix +'-'+ (Wui.idCounter = ~~++Wui.idCounter);
};

/**
 * Shorthand for typing typeof comparisons everywhere.
 *
 * @param       {Object}    v   Only an object in the sense that everything in JS is an object. It
 *                              can be any variable you want to check whether it is defined.
 *
 * @returns     {Boolean}   True if the item is not undefined.
 */
Wui.isset = function(v) {
    return (typeof v !== 'undefined');
};


/**
 * Gets the maximum CSS z-index on the page and returns one higher, or one if no z-indexes are defined.
 *
 * @param       {Node}      (Optional) and not named, a parameter passed to this method will be taken as
 *                          the item itself we are seeking the z-index for and will not include itsef when
 *                          calculating the maximum index (not doing this will increment the z-index of the item
 *                          every time this method is called on it).
 *
 * @returns     {number}    A number representing the maximum z-index on the page plus one.
 */
Wui.maxZ = function() {
    var self      = (arguments[0] instanceof jQuery) ? arguments[0][0] : arguments[0],
        bodyElems = $('body *'),
        useElems  = bodyElems.length < 2500 ? bodyElems : $('body > *, [style*="z-index"]'),
        topZ      = Math.max.apply(null, 
                        $.map(useElems, function(e) {
                            if ($(e).css('position') != 'static' && e != self)
                                return parseInt($(e).css('z-index')) || 0;
                        })
                    );
        
    return ($.isNumeric(topZ) ? topZ : 0) + 1;
};


/**
 * Determines whether the passed in string can be used as a percentage
 *
 * @param   {string}    val     A string to be taken as a percent
 *
 * @returns {boolean}   True if the value is a number with a percent character
 */
Wui.isPercent = function(val) {
    val = String(val);

    return (val.indexOf('%') != -1 && $.isNumeric(parseFloat(val)));
};


/**
 * Determines the width of the scrollbar for the current browser/OS 
 *
 * @returns {Number}    The width of the scrollbar
 */
Wui.getScrollbarWidth = function() {
    var parent,
        child;

    if (Wui.scrollbarWidth === undefined) {
        parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
        child = parent.children();
        Wui.scrollbarWidth = child.innerWidth() - child.height(99).innerWidth();
        parent.remove();
    }
    
    return Wui.scrollbarWidth;
};


/**
 * Gets an object containing all the styles defined for an object from stylesheets to inline styles.
 *
 * @param   {Node}      elem    The element for which to get styles. This should NOT be a jquery object.
 * @returns {Object}    Object containing key value pairs of style rules and their values.
 */
Wui.getStylesForElement = function(elem) {
    var result = {};

    Array.prototype.slice.call(document.styleSheets).forEach(function (stylesheet) {
        // some stylesheets don't have rules
        if (!stylesheet.rules) {
            return;
        }
        
        Array.prototype.slice.call(stylesheet.rules).forEach(function (rule) {
            if (!stylesheet.rule) {
                return;
            }
            
            // account for multiple rules split by a comma
            rule.selectorText.split(',').forEach(function (selector) {
                if (elem.matches(selector)) {
                    for (var index=0; index < rule.style.length; ++index) {
                        var prop = rule.style[index];
                        result[prop] = rule.style[prop];
                    }
                }
            });
        });
    });

    var styles = elem.style;
    
    $.each(styles, function(index, rule) {
       result[rule] = styles[rule];
    });

    return result;
};


/**
 * Gets all of the options in a select box
 *
 * @param   {Node}      target  A node, jQuery object, or selector string for a <select> node
 *
 * @returns {Array}     An array full of objects that represent the option values in the select
 */
Wui.parseSelect = function(target) {
    var data = [],
        options = $(target).find('option');
        
    options.each(function(index, item) {
        var option = $(item),
            optgroup = option.parent('optgroup'),
            disabled = optgroup.prop('disabled') || option.prop('disabled');
            
        data.push({
            element: option,
            index: index,
            value: (disabled) ? null : option.val(),
            label: option.text(),
            optgroup: optgroup.attr( "label" ) || "",
            disabled: disabled
        });
    });
    
    return data;
};


/**
 * Converts a percentage string to an integer pixel value based on the passed in element's parent
 *
 * @param       {Node}      el          The element that will get the percentage applied to it
 * @param       {String}    percent     A string containing a number and percent sign
 * @param       {String}    dim         Optional. 'width'|'height'. Default is 'width'.
 *
 * @returns     {number}    The Math.floor pixel value of the percent of the width of 'el''s parent.
 */
Wui.percentToPixels = function(el, percent, dim){
    var parent = el.parent(),
        useWindow = (parent[0] === $(window)[0] || parent[0] === $('html')[0] || parent[0] === $('body')[0]),
        parentSize = (useWindow) ? ((dim == 'height') ? $.viewportH() : $.viewportW()) : parent[dim]();

    return Math.floor((parseFloat(percent) / 100) * parentSize);
};


/**
 * Absolutely positions a child element, relative to its parent, such that it will be visible within the viewport
 * and at the max z-index. Useful for dialogs and drop-downs.
 *
 * @param   {Object}    parent  The element to which the child will be relatively positioned.
 * @param   {Object}    child   The element to be positioned.
 */
Wui.positionItem = function(parent, child) {
    var ofst    =   parent[0].getBoundingClientRect(),
        top     =   ofst.top,
        cWidth  =   child.outerWidth(),
        cHeight,
        spaceAbove = ofst.top,
        spaceBelow = $.viewportH() - spaceAbove - parent.outerHeight(),
        plBelow =   spaceBelow > spaceAbove,
        plRight =   (ofst.left + parent.outerWidth() - cWidth > 0);
    
    child.css({
        'max-height': (plBelow ? spaceBelow : spaceAbove) - 15
    });
    
    cHeight = child.outerHeight();
    top = (plBelow) ? top + parent.outerHeight() : top - ($.isNumeric(cHeight) ? cHeight : child.outerHeight());

    child.css({
        left:           (plRight) ? ofst.left + parent.outerWidth() - cWidth : ofst.left,
        top:            top,
        position:       'fixed',
        zIndex:         Wui.maxZ(child)
    });
};


/**
 * Determines whether data is expected to be in containers separating values for the total and the
 * data, or if the data cones in in an array, there is no need to unwrap it.
 *
 * @param       {Object|Array}      r   Object or array that is the resopnse data from a request.
 *
 * @returns     {Object}            An object with cleanly separated data and total columns.
 */
Wui.unwrapData = function(r){
    var me          = this,
        dc          = me.hasOwnProperty('dataContainer') ? me.dataContainer : Wui.Data.prototype.dataContainer,
        tc          = me.hasOwnProperty('totalContainer') ? me.totalContainer : Wui.Data.prototype.totalContainer,
        response    = (dc && r[dc]) ? r[dc] : r,
        total       = (tc && r[tc]) ? r[tc] : response.length;
    
    return {data:response, total:total};
};