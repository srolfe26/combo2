// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError
    // exception. // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}


/**
 * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
 * on host objects like NamedNodeMap, NodeList, and HTMLCollection
 * (technically, since host objects have been implementation-dependent,
 * at least before ES6, IE hasn't needed to work this way).
 * Also works on strings, fixes IE < 9 to allow an explicit undefined
 * for the 2nd argument (as in Firefox), and prevents errors when
 * called on other DOM objects.
 */
(function () {
  'use strict';
  var _slice = Array.prototype.slice;

  try {
    // Can't be used with DOM elements in IE < 9
    _slice.call(document.documentElement);
  } catch (e) { // Fails in IE < 9
    // This will work for genuine arrays, array-like objects, 
    // NamedNodeMap (attributes, entities, notations),
    // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
    // and will not fail on other DOM objects (as do DOM elements in IE < 9)
    Array.prototype.slice = function(begin, end) {
      // IE < 9 gets unhappy with an undefined end argument
      end = (typeof end !== 'undefined') ? end : this.length;

      // For native Array objects, we use the native slice function
      if (Object.prototype.toString.call(this) === '[object Array]'){
        return _slice.call(this, begin, end); 
      }

      // For array like object we handle it ourselves.
      var i, cloned = [],
        size, len = this.length;

      // Handle negative value for "begin"
      var start = begin || 0;
      start = (start >= 0) ? start : Math.max(0, len + start);

      // Handle negative value for "end"
      var upTo = (typeof end == 'number') ? Math.min(end, len) : len;
      if (end < 0) {
        upTo = len + end;
      }

      // Actual expected size of the slice
      size = upTo - start;

      if (size > 0) {
        cloned = new Array(size);
        if (this.charAt) {
          for (i = 0; i < size; i++) {
            cloned[i] = this.charAt(start + i);
          }
        } else {
          for (i = 0; i < size; i++) {
            cloned[i] = this[start + i];
          }
        }
      }

      return cloned;
    };
  }
}());


// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}


if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}


// ES 15.2.3.6 Object.defineProperty ( O, P, Attributes )
// Partial support for most common case - getters, setters, and values
(function() {
  if (!Object.defineProperty ||
      !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
    var orig = Object.defineProperty;
    Object.defineProperty = function (o, prop, desc) {
      // In IE8 try built-in implementation for defining properties on DOM prototypes.
      if (orig) { try { return orig(o, prop, desc); } catch (e) {} }

      if (o !== Object(o)) { throw TypeError("Object.defineProperty called on non-object"); }
      if (Object.prototype.__defineGetter__ && ('get' in desc)) {
        Object.prototype.__defineGetter__.call(o, prop, desc.get);
      }
      if (Object.prototype.__defineSetter__ && ('set' in desc)) {
        Object.prototype.__defineSetter__.call(o, prop, desc.set);
      }
      if ('value' in desc) {
        o[prop] = desc.value;
      }
      return o;
    };
  }
}());

/*!
 * verge 1.9.1+201402130803
 * https://github.com/ryanve/verge
 * MIT License 2013 Ryan Van Etten
 */
!function(a,b,c){"undefined"!=typeof module&&module.exports?module.exports=c():a[b]=c()}(this,"verge",function(){function a(){return{width:k(),height:l()}}function b(a,b){var c={};return b=+b||0,c.width=(c.right=a.right+b)-(c.left=a.left-b),c.height=(c.bottom=a.bottom+b)-(c.top=a.top-b),c}function c(a,c){return a=a&&!a.nodeType?a[0]:a,a&&1===a.nodeType?b(a.getBoundingClientRect(),c):!1}function d(b){b=null==b?a():1===b.nodeType?c(b):b;var d=b.height,e=b.width;return d="function"==typeof d?d.call(b):d,e="function"==typeof e?e.call(b):e,e/d}var e={},f="undefined"!=typeof window&&window,g="undefined"!=typeof document&&document,h=g&&g.documentElement,i=f.matchMedia||f.msMatchMedia,j=i?function(a){return!!i.call(f,a).matches}:function(){return!1},k=e.viewportW=function(){var a=h.clientWidth,b=f.innerWidth;return b>a?b:a},l=e.viewportH=function(){var a=h.clientHeight,b=f.innerHeight;return b>a?b:a};return e.mq=j,e.matchMedia=i?function(){return i.apply(f,arguments)}:function(){return{}},e.viewport=a,e.scrollX=function(){return f.pageXOffset||h.scrollLeft},e.scrollY=function(){return f.pageYOffset||h.scrollTop},e.rectangle=c,e.aspect=d,e.inX=function(a,b){var d=c(a,b);return!!d&&d.right>=0&&d.left<=k()},e.inY=function(a,b){var d=c(a,b);return!!d&&d.bottom>=0&&d.top<=l()},e.inViewport=function(a,b){var d=c(a,b);return!!d&&d.bottom>=0&&d.right>=0&&d.top<=l()&&d.left<=k()},e});jQuery.extend(verge);

/*! Combo2 1.0.3
 * Copyright (c) 2016 Stephen Rolfe Nielsen
 *
 * https://github.com/srolfe26/combo2
 *
 * @license MIT 2016 Stephen Rolfe Nielsen
 */ 

// Make sure the WUI is defined.
var Wui = Wui || {};


/**
 * Returns a string that will be a unique to use on the DOM. Output in the format 'prefix-n'.
 *
 * @param       {String}    prefix      Optional. A string to use before the number. Default is 'wui'.
 *
 * @returns     {String}    The prefix plus a number that is incremented each time this function is called.
 */
Wui.id = function(prefix) {
    prefix = prefix || 'wui';
    
    return prefix +'-'+ (Wui.idCounter = ~~++Wui.idCounter);
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

/**
 @event        datachanged    When the data changes (name, data object)
 @author    Stephen Nielsen (rolfe.nielsen@gmail.com)

The WUI Data Object is for handling data whether remote or local. It will fire 
namespacedevents that can be used by an application, and provides a uniform 
framework for working with data.

If data is remote, Wui.Data is an additional wrapper around the jQuery AJAX method 
and provides for pre-processing data. Data can be pushed and spliced into/out of 
the object and events will be fired accordingly.
*/
Wui.Data = function(args){
    $.extend(this,{
        /** Array of data that will be stored in the object. Can be specified for the object or loaded remotely */
        data:           [],
        
        /** Name a key in the data that represents the identity field. */
        identity:       null,
        
        /** Name of the data object. Allows the object to be identified in the listeners, and namespaces events. */
        name:           null,
        
        /** Object containing keys that will be passed remotely */
        params:         {},
        
        /** URL of the remote resource from which to obtain data. A null URL will assume a local data definition. */
        url:            null,
        
        /** Special configuration of the ajax method. Defaults are:
        
            data:       me.params,
            dataType:   'json',
            success:    function(r){ me.success.call(me,r); },
            error:      function(e){ me.failure.call(me,e); },
        */
        ajaxConfig:     {},
        
        /** The total number of records contained in the data object */
        total:          0
    },args);
};
Wui.Data.prototype = {
    /** An object in the remote response actually containing the data.
    Best set modifying the prototype eg. Wui.Data.prototype.dataContainer = 'payload'; */
    dataContainer:  null,
    /** An object in the remote response specifying the total number of records. Setting this
    feature will overrride the Data object's counting the data. Best set modifying the prototype eg. Wui.Data.prototype.totalContainer = 'total'; */
    totalContainer: null,
    
    /** 
    @param {array}    newData    Array of the new data
    @eventhook Used for when data is changed.
    */
    dataChanged:    function(){},
    
    /**
    @param {function} fn A function that gets called for each item in the object's data array
    
    @return true
    The passed in function gets called with two parameters the item, and the item's index.
    */
    dataEach:       function(f){
                        for(var i = 0; i < this.data.length; i++)
                            if(f(this.data[i],i) === false)
                                break;
                        return true;
                    },
    
    /**
    Performs a remote call and aborts previous requests
    Between loadData(), success() and setData() fires several event hooks in this order:
    
    1. setParams()
    2. beforeLoad()
    3. onSuccess()
    4. beforeSet()
    5. processData()
    6. dataChanged()
    -  'datachanged' event is fired
    7. afterSet()
    
    Upon failure will fire onFailure()
    */
    loadData:       function(){
                        var me = this,
                            config = $.extend({
                                data:       me.params,
                                dataType:   'json',
                                success:    function(){ me.success.apply(me,arguments); },
                                error:      function(){ me.failure.apply(me,arguments); },
                            },me.ajaxConfig);
                        
                        // Work in additional parameters that will change or stop the request
                        var paramsOkay = me.setParams.apply(me,arguments),
                            beforeLoad = me.beforeLoad.apply(me,arguments);

                        // Perform request
                        if(paramsOkay !== false && beforeLoad !== false){
                            // abort the last request in case it takes longer to come back than the one we're going to call
                            if(me.lastRequest && me.lastRequest.readyState != 4) {
                                me.lastRequest.abort();
                            }
                            
                            me.lastRequest = $.ajax(me.url,config);
                            
                            return me.lastRequest;
                        }
                        
                        // If there was no request made, return a rejected deferred to keep return types consistent
                        return $.Deferred().reject();
                    },
    /**
    @param {object} params    Params to be set
    @eventhook Can be used as is or overridden to run when parameters change.
    Can be used as is to set parameters before an AJAX load, or it can also be used as an event hook and overridden.
    This method is called from loadData with its arguments passed on, so arguments passed to load data will be sent here. 
    See loadData(). If this function returns false, load data will not make a remote call.
    */
    setParams:      function(params){
                        if(params && typeof params === 'object')
                            $.extend(this.params,params);
                    },
    
    /**
    @param {array} d Data to be set on the ojbect
    @param {number} [t] Total number of records in the data set. If not specified setData will count the data set.
    
    Can be called to set data locally or called by loadData(). Fires a number of events and event hooks. See loadData().
    */
    setData:        function(d,t){
                        var me = this;
                        
                        // Event hook for before the data is set
                        me.beforeSet(d);
                        
                        // Set the data
                        me.data = me.processData(d);
                        me.total = ($.isNumeric(t)) ? t : (me.data) ? me.data.length : 0;
                        
                        me.fireDataChanged();
                    },

    fireDataChanged:function(){
                        var me = this, dn = (me.name || 'w121-data');

                        me.dataChanged(me.data);
                        $(document).trigger($.Event('datachanged.' + dn),[dn, me])
                            .trigger($.Event('datachanged'),[dn, me]);
                        me.afterSet(me.data);
                    },
    
    /** @eventhook Event hook that will allow for the setting of the params config before loadData performs a remote call. Meant to be overridden. See loadData().
        If this function returns false, load data will not make a remote call. */
    beforeLoad:     function(){},
    
    /**
    @param    {array}    data    The value of the data cofig of the current object
    @eventhook  Fires after data is set. Meant to be overridden. See loadData().
    */
    afterSet:       function(){},
    
    /**
    @param {array} d Data to be set on the ojbect
    @eventhook  Fires after the remote call but before data is set on the object. Meant to be overridden. See loadData().
    */
    beforeSet:      function(){},
    
    /**
    @param {object or array} r Response from the server in JSON format
    Runs when loadData() successfully completes a remote call.
    Gets data straight or gets it out of the dataContainer and totalContainer.

    Calls setData() passing the response and total.
    */
    success:        function(r){
                        var me = this,
                            unwrapped = Wui.unwrapData.call(me,r);
                        
                        me.onSuccess(r);
                        me.setData(unwrapped.data, unwrapped.total);
                    },
    
    /** @eventhook AllowS for the setting of the params config before loadData performs a remote call. Meant to be overridden. See loadData(). */
    onSuccess:      function(){},
    
    /** @eventhook Allows for the setting of the params config before loadData performs a remote call. Meant to be overridden. See loadData(). */
    onFailure:      function(){},
    
    /** Runs when loadData() fails. */
    failure:        function(e){ this.onFailure(e); },
    
    /** 
    @param {array} Data to be processed.
    Allows for pre-processing of the data before it is taken into the data object. Meant to be overridden, otherwise will act as a pass-through. See loadData().*/
    processData:    function(response){ return response; },

    /**
    @param {object} [obj,...] One or more objects to be added to the end of the parent object's items array
    @return The new length of the array 
    Same as Array.push() but acting on the data array of the object.
    */
    push:           function(){
                        var retVal = Array.prototype.push.apply(this.data || (this.data = []), arguments);
                        this.total = this.data.length;
                        this.fireDataChanged();
                        return retVal;
                    },

    /**
    @param  {number}    idx         Position to start making changes in the items array.
    @param  {number}    howMany     Number of elements to remove.
    @param  {object}    [obj,...]   One or more objects to be added to the array at position idx
    @return An array of the removed objects, or an empty array. 
    Same as Array.splice() but acting on the data array of the object.
    */
    splice:         function(){
                        var retVal = Array.prototype.splice.apply(this.data || (this.data = []), arguments);
                        this.total = this.data.length;
                        this.fireDataChanged();
                        return retVal;
                    }
};

/**
 * Wui.Smarty is a way to create DOM elements based on data. Wui.Smarty should be considered a replacement to Wui.Template
 * in that it addresses Wui.Template's vulnerabilities, namely:
 *      - The risk of XSS attack through use of inline functions
 *      - Inability to escape HTML and Javascript values
 *      - Inability to access nested variables in a fail-safe manner
 *      - Inability to "compile" the template - a 2X speed improvement in Wui.Smarty
 *
 * Wui.Smarty syntactically follows the familiar usage of placing variables in the template surrounded by braces (or curly
 * brackets). Data is set as a parameter to the make() method, and make() always returns a string. Functions are available
 * via a 'function' flag that will be described below. Additionaly, it borrows many features and syntax from the PHP
 * server-side templating system Smarty.
 *
 *      (http://www.smarty.net/)
 *
 * Wui.Smarty will "compile" its template on the first run, meaning rather than parsing the template string with a regex on
 * every iteration, it will dynamically create a function on the first iteration that will then be called with the new data
 * of each subsequent iteration. This creates approximately a 2X speed advantage (tested on a 10,000 X 4 data set), even
 * with the more functionality in the template.
 *
 * Template syntax can be understood through the follow examples, starting with the most simple:
 *
 *      '<p>{firstname}</p>'
 *
 * An only slighty more complex example would be as follows, notice the nested variable reference:
 *
 *      '<p>{name.last}, {name.first}</p>'
 *
 * As usual, values which don't exist will be returned as empty strings, however values that are set with a javascript
 * 'undefined' object will return 'undefined'.
 *
 * Another example shows the smarty syntax now, with the addition of flags:
 *
 *      '<p>{name.last|upper}, {name.first|capitalize}</p>'
 *
 * Flags are processed left to right as added to the template. Here we protect against possible XSS injection:
 *
 *      '<p>{name.last|upper|escape:html}, {name.first|capitalize|escape:html}</p>'
 *
 * Using functions to process parameters is possible, and is done in a strict manner that closes a potential
 * attack vector. Rather than effectively eval'ing code that is passed into the template, processing functions are
 * member methods of the template, and called with fixed parameters as in the following example:
 *
 * Given the following template definition and data:
 *
 *      data =  [
 *                   { name: 'Stephen <b>The Steve</b>', age: {number: 32, description:'Thirty-two'} },
 *                   { name: 'Kayli', age: {number: 24, description:'Twenty-four'} },
 *                   { name: 'Girl', age: {number: 4, description:'Four'} },
 *                   { name: 'Boy', age: {number: 2, description:'Two'} },
 *                   { name: 'Super-Fly', age: {number: 0.5, description:'Six Months'} },
 *              ];
 *
 *      template = new Wui.Smarty({
 *          html:       '<p>{name|escape:"html"}, {|function:processAge:age}</p>',
 *
 *          processAge: function(age){
 *                          // How every parent should describe the age of their children ;-)
 *                          if(age.number > 1) {
 *                              return age.number;
 *                          } else {
 *                              return age.description;
 *                          }
 *                      }
 *      });
 *
 *      data.forEach(function(itm){
 *          $(template.make(itm)).appendTo('body');
 *      });
 *
 * Will output the following:
 *
 *      <p>Stephen &lt;b&gt;The Steve&lt;/b&gt;, 32</p>
 *      <p>Kayli, 24</p>
 *      <p>Girl, 4</p>
 *      <p>Boy, 2</p>
 *      <p>Super-Fly, Six Months</p>
 *
 * Notice in this example, values processed by the function are parameters to the function flag, not named in the place
 * for variable names. This pattern allows for safer functions, defined with comments, and allows for more complex
 * operations including the use of closures. Globally defined methods can be referenced either directly or within
 * methods on the template config.
 *
 * Avaialble modifiers/flags are:
 *
 *      capitalize  Will capitalize the first letter of every word in the string
 *
 *      default     Accepts a parameter to use as a default value if variable is a blank string. Example: {undefinedVar|default:"Default Text"}
 *
 *      escape      Used to encode special characters. Accepts 'html', 'javascript', 'json' and 'url'
 *
 *      function    Will call a function within the scope of the template. Parameters are the function name, and then arguments to pass.
 *                  Example {|function:funcName:param1Name:param2Name:...} When functions are used, the function flag MUST be the first one,
 *                  and the the key value MUST be blank since the keys are parameters to the function.
 *
 *      lower       Equivalent to toLowerCase()
 *
 *      unescape    Used to decode, countering the effect of the escape modifier (Accepts 'html', 'javascript', 'json' and 'url')
 *
 *      upper       Equivalent to toUpperCase()
 *
 */
Wui.Smarty = function(args) {
    $.extend(this, {
        html:       '',
        compiled:   null,
        build:      [],
        __s:        ""
    }, args);
};


Wui.Smarty.prototype = {
    /*
     * Given an array of flags, applies them on the value passed in
     *
     * @param   {string}    str     A string that will have the flags applied
     * @param   {array}     flags   An array of flags that will be parsed and functions applied
     *
     * @return  {string}    The string passed in as 'str' with the flag functions applied
     */
    applyFlags: function(str, flags){
        var me = this;

        // Method for adding flags and params to the build array
        function addToBuid(fn, params) {
            var latestKey = me.build[me.build.length - 1];

            latestKey.fn = latestKey.fn || [];
            latestKey.params = latestKey.params || [];

            latestKey.fn.push(fn);
            latestKey.params.push($.extend(true, [], params));
        }

        for (var index = 0; index < flags.length; index++) {
            var params = flags[index].split(':'),
            // Replaces the first element (which is the name of the flag), with the string to be
            // modified. Then splice returns the flag in an array, so get the first element.
                flag;

            // Remove quotes from around params, they're already a string at this point
            for (var i = 1; i < params.length; i++) {
                params[i] = me.trimSpecial(params[i],'"\'');
            }

            // The flag is the first parameter
            flag = params.shift();

            if (flag == 'function') {
                // Add the functions to the build
                addToBuid('js_function', params);

                // Function is a JS keyword and requires special parsing
                str = me.js_function.apply(me, params);
            }
            else {
                // Default is a keyword in javascript so it needs to be changed.
                if (flag == 'default') {
                    flag = 'defaultVal';
                }
                
                if (typeof me[flag] !== 'function') {
                    new Error('wui-smarty.js - Unsupported flag: \'' + flag + '\'.');
                }
                else {
                    // Add the functions to the build
                    addToBuid(flag, params);

                    // Add the string to be modified as the first parameter
                    params.splice(0,0,str);

                    // Run the function with all parameters
                    str = me[flag].apply(me, params);
                }
            }
        }

        return str;
    },


    /*
     * Capitalizes the first letter of every word in the string
     *
     * @param   {string}    str     A string to be capitalized. ie: "foo bar baz"
     * @return  {string}    Capitalized string. ie: "Foo Bar Baz"
     */
    capitalize: function(str) {
        return String(str).replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },


    /*
     * Allows a named function to be chainable through using the common me.__s
     *
     * @param   {string}    fn     The name of a function to call within the context of this object
     * @param   {array}     params Array of parameters to be passed into function
     * @return  {object}    A reference to the template object so that chaning can occur
     */
    chain: function(fn, params) {
        var me = this;

        params.splice(0, 0, me.__s);
        me.__s = me[fn].apply(me, params);

        return me;
    },


    /*
     * Turns the build array into a function that will be run in all future uses
     * of the template. Makes use of me.build[] to create the function.
     *
     * @return  {function}  The compiled function
     */
    compile: function() {
        var me = this,
            fnString = 'var me = this, retString = "";';

        function arrToStr(arr) {
            return '[\'' + arr.join('\',\'')+ '\']';
        }

        // Contstruct the compiled function from the array items
        for (var i = 0; i < me.build.length; i++) {
            var itm = me.build[i];

            if ($.isPlainObject(itm)) {
                // Do a lookup of keys that have a name (not function expressions)
                if(itm.key.length > 0) {
                    fnString += 'me.__s = me.lookup(rec, \'' + itm.key + '\');';
                }
                // Set the initial value from the function (function flag must be first)
                else if (typeof itm.fn !== 'undefined') {
                    fnString += 'me.__s = me.' +itm.fn.shift()+ '.apply(me, ' +arrToStr(itm.params.shift())+ ');';
                }

                // Perform additional flags on me.__s if they exist
                if (typeof itm.fn !== 'undefined' && itm.fn.length > 0) {
                    fnString += 'me';
                    for (var f = 0; f < itm.fn.length; f++) {
                        fnString += '.chain(\'' +itm.fn[f]+ '\',' +arrToStr(itm.params[f])+ ')';
                    }
                    fnString += ';';
                }

                fnString += 'retString += me.__s;';
            }
            // Item is a string
            else {
                fnString += 'retString += \'' + me.escape(itm,'javascript') + '\';';
            }
        }

        fnString += "return retString;";

        // create function that will perform the conditional statement
        return Function.apply(null, ['rec', fnString]);
    },


    /*
     * Returns the string passed in, or the default string if the value is blank.
     *
     * @param   {string}    str     Any string
     * @param   {string}    default A value to replace a blank string with
     *
     * @return  {string}    The value string passed in, or the default value
     */
    defaultVal: function(str, dflt) {
        // A blank or undefined string will evaluate to false in JS
        if (str) {
            return str;
        }

        return dflt;
    },


    // Characters that ought to be escaped in HTML
    escapeHTML: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    },


    // Characters that ought to be escaped in javascript strings
    escapeJS: {
        '\\':   '\\\\',
        "'":    "\\'",
        '"':    '\\"',
        "\r":   '\\r',
        "\n":   '\\n',
        '</':   '<\/'
    },


    /*
     * Escape a string for a given type of output, or reverse that escaping
     *
     * @param   {string}    str         The string to escape/unescape
     * @param   {string}    type        String containing the escape type ('html'|'javascript'|'json'|'url')
     * @param   {boolean}   unescape    Flag to reverse the usual escape sequence
     *
     * @return  {string}    An escaped string.
     */
    escape: function(str, type, unescape) {
        unescape = unescape || false;

        var me = this,
            actions = {
                html: function() {
                    var baseMap = me.escapeHTML,
                        map = unescape ? me.invert(baseMap) : baseMap,
                        regex = new RegExp('[' + me.getKeys(map).join('').replace(/\//,'\\/') + ']', 'g');

                    return String(str).replace(regex, function(match) {
                        return map[match];
                    });
                },
                
                javascript: function() {
                    var baseMap = me.escapeJS,
                        map = unescape ? me.invert(baseMap) : baseMap,
                        // The JS regex cannot be constructed like the HTML one above because the JS string
                        // has to be escaped to be made into a regex, but then the map won't work.
                        regex = unescape ? /\\\\|\'|\\"|\\r|\\n|<\//g : /<\/|"|'|\\|\n|\r/g;

                    return String(str).replace(regex, function(match) {
                        return map[match];
                    });
                },
                
                json: function() {
                    var action = unescape ? 'parse' : 'stringify';
                    return JSON[action](str);
                },
                
                url: function() {
                    var action = unescape ? 'decodeURI' : 'encodeURI';
                    return JSON[action](str);
                }
            };

        if(typeof actions[type] === 'function') {
            return actions[type]();
        }
        else {
            return actions.html();
        }
    },


    /*
     * Returns the keys of an object as an alphabetically sorted array.
     *
     * @param   {object}    obj     Any plain object. Example:
     *                              {
     *                                  asdf: 1,
     *                                  zxcv: 2,
     *                                  qwer: 3
     *                              }
     * @return  {array}     Sorted array of object keys. i.e: ['asdf', 'qwer', 'zxcv'].
     */
    getKeys: function(obj){
        var retArray = [];

        if ($.isPlainObject(obj)) {
            $.each(obj,function(key){
                retArray.push(key);
            });
        }

        return retArray.sort();
    },


    /*
     * Inverts an object so that its keys are its values, and its values are its keys.
     * Complex values will be dropped (functions, arrays, and objects). If a non-object,
     * or an empty object is passed in, an empty object will be returned.
     *
     * @param   {object}    obj         The object to be searched within.
     * @param   {string}    property    A string of the property to search for within 'obj'.
     *
     * @return  {boolean}   Whether the property exists within the object
     */
    hasProperty: function(obj, property) {
        return obj !== null && typeof obj === 'object' && (property in obj);
    },


    /*
     * Inverts an object so that its keys are its values, and its values are its keys.
     * Complex values will be dropped (functions, arrays, and objects). If a non-object,
     * or an empty object is passed in, an empty object will be returned.
     *
     * @param   {object}    obj     The object to be inverted.
     * @return  {object}    The passed in object copied and inverted, or an empty object.
     */
    invert: function(obj) {
        var retObj = {};

        if ($.isPlainObject(obj) && !$.isEmptyObject(obj)) {
            $.each(obj, function(key, value){
                // Values that are not simple will be dropped from the new object
                if (!$.isArray(value) && !$.isPlainObject(value) && !$.isFunction(value)) {
                    retObj[value] = key;
                }
            });
        }

        return retObj;
    },


    /*
     * Looks for a javascript function and passes parameters to it
     *
     * @param   {string}    fn      The name of a function that has been added as a config
     *                              to an instance of this template
     * @param   {string}    ...     Zero or more names of parameters to be looked up in the
     *                              template's data record
     *
     * @return  {string}    The return value from the function
     */
    js_function: function(fn){
        var me = this,
        // Function name is the first argument, function parameters are all afterward
            index = 1,
            paramVals = [];
        for (index; index < arguments.length; index++) {
            paramVals.push(me.lookup(me.rec, arguments[index]));
        }

        return me[fn].apply(me, paramVals);
    },


    /* Determine whether a key exists in the record, and either inserts it into the template,
     * or safely ignores it and inserts a blank string.
     *
     * @param   {object}    rec     The data object to look for values in
     * @param   {string}    key     A string containing a refence to a value to return
     *
     * @return  {string}    Either the value referenced in key, or a blank string if the value
     *                      did not exist.
     */
    lookup: function(rec, key) {
        var me = this,
            value = "";

        // If the key exists in rec, use its value
        if (rec.hasOwnProperty(key)) {
            value = rec[key];
        }
        else {
            // If the key is a nested value, determine if the nested value exists
            if (key.indexOf('.') > 0) {
                var context = rec,
                    keys = key.split('.'),
                    index = 0;

                while (context !== null && index < keys.length) {
                    if (index === keys.length - 1 && me.hasProperty(context, keys[index])) {
                        value = context[keys[index]];
                    }

                    context = context[keys[index++]];
                }
            }

            // In this instance, key may be an attribute of the prototype
            else if (me.hasProperty(rec, key)) {
                value = rec[key];
            }
        }

        return value;
    },


    /*
     * Capitalizes the entire string.
     *
     * @param   {string}    str     A string to be capitalized. ie: "FOO BAR BAZ"
     * @return  {string}    Lower-case string. ie: "foo bar baz"
     */
    lower: function(str) {
        return String(str).toLowerCase();
    },


    /*
     * Returns a filled template. One of the important features of this method is to
     *
     * @param   {object}    rec     Data to fill into the template
     * @return  {string}    A template string with data values filled in
     */
    make: function(rec){
        var me = this;

        // The engine will break if we don't have both of these pieces
        if(!(rec && me.html)) {
            throw new Error('wui-smarty.js - Template engine missing data and/or html template.');
        }

        // Make the rec data available to the whole object without having to pass it from
        // method to method
        me.rec = rec;

        if (me.compiled === null) {
            // Since the template is not compiled, parse through it to get a build list to compile the template
            var retStr = me.parse();

            // Create a "compiled" function representing the parsed template from the build object
            me.compiled = me.compile();

            return retStr;
        }
        else {
            return me.compiled.call(me, rec);
        }
    },
    

    /**
     * Separates variables from string literals in the template and pushes them individually onto
     * the build array which is used to create the 'compiled' function. Also fills the template
     * string with values for the current record.
     *
     * @returns     String      The full template string with comments removed and values inserted.
     */
    parse: function() {
        var me = this,
            offsetLast = 0,
            tplCopy = me.html,
            commentsClean;

        // Remove comments. Comments are of the form {* ... *} and can be multi-line
        tplCopy = commentsClean = tplCopy.replace(/{\*[\w\s.,\/#!$%\^&\*;:{}=\-_`~()\[\]@]*\*}/g,'');
        
        // Fill values into the template
        tplCopy = tplCopy.replace(/{([\w+|:\. '"-]+)}/g,function(match, expr, offset) {
            // '/*The regex throws off code hilighting in Sublime. So killing it with a comment*/
            var flags = expr.split('|'),
                key = flags.shift(),
                value = "";
                
            // Add the string literal to the build array
            me.build.push(commentsClean.substr(offsetLast, offset - offsetLast));
            
            offsetLast = offset + expr.length + 2;
            
            // Add the key val to the build array
            me.build.push({key: key});
            
            // Lookup the value in the record
            value = me.lookup(me.rec, key);
            
            // Run any flags on the value before returning it
            value = me.applyFlags(value, flags);
            
            return value;
        });
        
        // Add the final string literal before returning tplCopy for the first outputted template
        me.build.push(commentsClean.substr(offsetLast));
        
        return tplCopy;
    },
    
    
    /*
     * Trims any set of custom characters off of the beginning and end of a string
     *
     * @param   {string}    str         The string to trim
     * @param   {string}    characters  An undelimited string of characters to trim off both sides of the string
     * @param   {string}    flags       Optional. Regex flags that would be used in a javascript regex. Defaults to 'g'.
     * @return  {string}    A trimmed string
     */
    trimSpecial: function trim(str, characters, flags) {
        flags = flags || "g";
        if (typeof str !== "string" || typeof characters !== "string" || typeof flags !== "string") {
            throw new TypeError("argument must be string");
        }
        if (!/^[gi]*$/.test(flags)) {
            throw new TypeError("wui-smarty.js - Invalid regex flags supplied '" + flags.match(new RegExp("[^gi]*")) + "'");
        }
        characters = characters.replace(/[\[\](){}?*+\^$\\.|\-]/g, "\\$&");
        return str.replace(new RegExp("^[" + characters + "]+|[" + characters + "]+$", flags), '');
    },
    
    
    /*
     * Unescape a string for a given type of output.
     *
     * @param   {string}    str         The string to escape/unescape
     * @param   {string}    type        String containing the escape type ('html'|'javascript'|'json'|'url')
     * @return  {string}    An unescaped string.
     */
    unescape: function(str, type){
        return this.escape(str, type, true);
    },
    
    
    /*
     * Makes the entire string lower-case.
     *
     * @param   {string}    str     A string to be capitalized. ie: "foo bar baz"
     * @return  {string}    Capitalized string. ie: "FOO BAR BAZ"
     */
    upper: function(str) {
        return String(str).toUpperCase();
    }
};

/**
 * Combo2 - A WUI-based control
 * =================================================================================================
 * (a combination of a select and an autocomplete)
 *
 * Examples
 * --------
 *
 * // For the standard select box consumption
 *  standard_select = new Wui.Combo2({}, '#target');
 *
 * // Combo with its own dataset
 * local_dataset = new Wui.Combo2({
 *     valueItem: 'id',
 *     titleItem: 'name',
 *     data:   [
 *         {id:0, name:"Jeff"},
 *         {id:2, name:"Steve"},
 *         {id:1, name:"Tim"}
 *     ],
 *     // 'append'|'prepend'|'before'|'after'
 *     append: // Some parent target to perform the append on
 * });
 *
 * 
 * Functionality
 * -------------
 *
 * - Combo requires valueItem and titleItem attributes. 
 *     - If consuming a `<select>` off the DOM (see below), these values will be set automatically
 *       to 'value' for valueItem, and 'title' for titleItem.
 *     - By default, these will automatically create a template of '<li>{titleItem|escape:html}</li>'
 * - Custom templates can be defined for the option list items on the Combo, and follow the rules 
 *   of the Wui.Smarty object.
 * - Multiple selection is not supported at this time
 * - Arrow button can be removed to make the control appear more like an autocomplete.
 *
 * 
 * - Can be asynchronously loaded from a remote data store and search locally
 *     - Configs: url, [params], autoLoad = true
 * - Can be asynchronously loaded from a remote data store and search asynchronously
 *     - Configs: url, [params], searchLocal = false
 * - Can assume the position and values of a `<select>` element on the DOM
 *     - Data set in the object definition, OR
 *     - Data will be created from a select box
 *         - Combo construction will take the form `new Wui.Combo(<config object>, <select box>)`.
 *         - Disabled options will have a value of `null`.
 *         - Options without a value attribute will get the value of the text they contain.
 *         - Options with a blank value, or no value attribute and no text sub-node, will return
 *           a value of "".
 *         - Data will be in the form:
 *             ```
 *             {
 *                 value: '<value attribute, or other as described above>', 
 *                 label: '<text sub-node of the option tag>'
 *             }
 *             ```
 *
 * Interactions
 * ------------
 *
 * - Clicking:
 *     - When the Combo's field doesn't have focus, clicking on the field will open the dropdown
 *       and select all of the text currently in the field.
 *     - Clicking the Combo's field when it does have focus merely moves the cursor within the field.
 *     - Clicking the Combo's arrow button toggles the dropdown open and shut
 *     - Clicking on a menu item in the option list will select the item, fill the field with the
 *       selected item, close the drop down, and put the cursor at the end of the field.
 *     - Clicking away from the Combo will close the option list (if open) and remove focus.
 * 
 * - Typing
 *     - Focusing
 *         - When the field receives focus from a click it will open the options list. Otherwise if 
 *           focus comes from another source, a key must be pressed to open the options list.
 *         - If the field is searchable a search icon will appear in the left of the field. A remote
 *           search will cause a loading icon to appear in place of the search icon. When a selection
 *           us made on the field, the search icon no longer appears on focus. This is for the
 *           purpose of the search icon being a training mechanism more than anything else.
 *     - Tabbing
 *         - Tabbing into the drop down will select the text in the field, but will not 
 *           open the dropdown.
 *         - Tabbing when the field has focus will set the current selection and move away from the
 *           field to the next tab item.
 *             - If the option list is open, it will be closed
 *             - If the field is blank, and there is a blank item in the options, the field will be 
 *               blanked. Otherwise the field will revert to the currently selected item. Any text in
 *               the text field from a hover (see 'Hovering' above) will revert to the selected item.
 *     - Arrow Down
 *         - If the option list is open, the selection will move within the list, filling the field
 *           with the 'titleItem' of the selected item. When the selection reaches the bottom of the 
 *           list an arrow down press will remove selection and focus will be set on the field with
 *           whatever value was in the field the last time the field had focus. An arrow down from
 *           focus in the field will select the first item in the options list.
 *         - If the option list is closed, an arrow up or down will open the list and hilight the
 *           first available option.
 *     - Arrow Up
 *         - Same functionality of arrow down in reverse order
 *     - Enter
 *         - If the options list is open, enter key will set the value of the field to the currently 
 *           hilighted item in the option list, and close the list.
 *         - If the options list is closed, enter key events will be pased through to the
 *           surrounding DOM.
 *     - Escape
 *         - Sets the value of the field back to its previous value, and closes the options list 
 *           if it's open.
 *     - Any other typing will cause a search of the options list if the number of options is great
 *       than or equal to the searchThreshold. If less than, typing will behave similar to on a 
 *       standard select box.
 *         - Local searching (determined by the searchLocal attribute, default: true) will cause an
 *           unbounded search of the DOM text of the items in the options list.
 *         - Remote searching will send requests to the server, and will be at the mercy of the rules
 *           of the search method on the server.
 *             - Causes a redraw of the options list
 *             - Matching text in the DOM elements of the options list will be hilighted, but may not
 *               necessarily match the rules of the remote search. This is not an error, but care
 *               should be taken to make sure hilighting is not spotty or nonsensical if/when
 *               rules mismatch.
 *             - The search parameter passed to the back-end is the value of the field, and by default
 *               it's named 'srch'. It can be changed via the `searchArgName` prameter.
 *             - A minimum number of characters can be set before a remote search will fire so that
 *               there are not too many search results. This is set with the `minKeys` attribute. The
 *               default value though is 1.
 *         - If there are no matching results, by default 'No Results.' will be shown in the options
 *           list. This message can be changed with the `emptyMsg` attribute.
 *
 * @param       Object      args    A configuration object containing overrides for the default configs
 *                                  below as well as methods in the prototype.
 *
 * @param       Node        target  Optional. A target can be a DOM node, a jQuery Object, or a selector
 *                                  string that returns one item that is expected to reference a <select>
 *                                  box that will have its data pulled into the Combo's data array.
 *
 * @returns     Object      The Wui.Combo2 object is returned. Should be called as:
 *                              combo = new Wui.Combo2({...}, select);
 */
Wui.Combo2 = function(args, target) {    
    $.extend(this, {        
        // Whether to load remote data on instantiation of the Combo (true), or to load 
        // remote data based on a user's search. Default: false.
        autoLoad: false,
        
        // A CSS class that will be applied to the options list (or dropdown). This class can be
        // useful for setting a max/min height or width, or for special styling.
        ddCls: '',
        
        // Attributes to set on the object - good for setting 'data-' items
        attr: {},

        // The message to display when a search yields no results, whether local or remote. May be
        // a plain text string, or HTML formatted.
        emptyMsg: 'No Results.',
        
        // The text field for the combo. This field is specified in the constructor of the Combo (as
        // opposed to the prototype) because it must be a new DOM node for every instance of
        // the Combo.
        field: $('<input>').attr({
            type:               'text',
            autocomplete:       'off',
            autocorrect:        'off',
            autocapitalize:     'off',
            spellcheck:         'false'
        }).addClass('wui-combo-search'),
        
        hiddenCls: 'wui-hidden',
        
        // The minimum number of characters that must be in the field before a search will occur. If
        // searching against a very large dataset, increasing this number will help reduce the
        // size of the search results.
        minKeys: 1,
        
        // Text to put in the placeholder of the combo
        placeholder: '',

        // The name of the search parameter that will be sent to the server for remote filters.
        searchArgName: 'filter',
        
        // Tells the combo box to only search the local data rather than perform a remote call. This
        // can be used where the data is defined locally, or in concert with `autoLoad` where 
        // remotely loaded data is only searched on the client.
        searchLocal: true,
        
        // Do not perform search/filtering if there are n or fewer options. Zero means the search
        // is always on
        searchThreshold: 0,
        
        // An array of the currently selected records
        selected: [],
        
        // Determines whether to show the arrow button (that toggles the option list). A false 
        // value and makes the Combo appear more like an autocomplete field.
        showOpenButton: true,
        
        // The HTML template that the data will fit into. Null value will cause an error to be 
        // thrown. Specification required.
        template: null,
        
        // Object containing functions that will be utilized by a specified template. These functions
        // become members of Combo2.engine.
        templateFn: {},

        // The name of the part of the data containing the value that will be shown to the user.
        // For example: if the data is US states: [{state_id: 1, state_name:"Alabama"}, ...]
        // the titleItem will be 'state_name'. titleItem is REQUIRED.
        titleItem: null,

        // The value part of the data that will be used/stored by the program.
        // For example: if the data is US states: [{state_id: 1, state_name:"Alabama"}, ...]
        // the valueItem will be 'state_id'. valueItem is REQUIRED.
        valueItem: null
    }, args, {
        // Determies whether multiple selections can be made. At this time, on this control, 
        // multiselect is not available.
        multiSelect: false
    });
    
    this.init(target);
};


Wui.Combo2.prototype = $.extend(new Wui.Data(), {
    /**
     * Add the element to the DOM where specified by parameters, object configs, or by default appended to the body.
     * 
     * @param       {Node}      target      A node, jQuery object, or selector string for where to perform the action.
     * @param       {string}    action      Name of a jQuery method that will be run against the object's element
     *                                      in the array ['appendTo','prependTo', 'before', 'after'].
     *                                      
     * @returns     {Node}      The jQuery element of the Combo2
     */
    addToDOM: function(target, action){
        var me = this,
            possible_actions = ['append','prepend', 'before', 'after'];

        // Try to get action and target from configs if not passed in as parameters
        if (typeof action == 'undefined' || typeof target == 'undefined') {
            $.each(possible_actions, function(idx, act) {
                if (typeof me[act] != 'undefined') {
                    action = act;
                    target = me[act];
                    return false;
                }
            });
        }

        // Default action
        if (typeof action == 'undefined') {
            action = 'append';
        }

        // Default target
        if (typeof target == 'undefined') {
            target = 'body';
        }

        $(target)[action](me.el);
        me.cssByParam();
        
        return me.el;
    },
    
    
    /**
     * Calculates the width of the drop down based on its contents
     */
    adjustDropDownSize: function() {
        var me = this, 
            width,
            widestChild = 0;
            
        // Look at the size of any style on the item, if width is explicity defined, 
        // don't change it here (max-width doesn't apply). Storing the variable here also makes
        // it so this is only calculated once, and so the effect of this method don't interfere
        // with future running of this method.
        if (me.ddCSSRetrieved !== true) {
            me.ddWidthStyle = Wui.getStylesForElement(me.dd[0]).width;
            me.ddCSSRetrieved = true;
        }
        
        // The drop down has to be display block, but we don't necessarily want to show it
        if (!me._open) {
            me.dd.css({visibility: 'hidden'}).removeClass(me.hiddenCls);
        }
        
        // Clear the current width on the field
        me.dd.css({width: ''});
        
        if (isNaN(parseInt(me.ddWidthStyle)) && String(me.ddWidthStyle).indexOf('calc') !== 0) {
            // As default, set drop-down width according to the width of the field
            width = (me.el.innerWidth() < 100) ? 100 : me.el.innerWidth();

            // Look at the items in the drop down and determine the widest, then
            // account for padding on the container
            // me.dd.children(':not(.wui-hidden)').each(function(index, item) {
            //     if(item.offsetWidth > widestChild) {
            //         widestChild = item.offsetWidth;
            //     }
            // });
            
            widestChild = me.dd.outerWidth() + Wui.getScrollbarWidth();

            // // Account for margin/padding
            // // Add the scrollbar width, just in case the content scrolls
            // widestChild += (me.dd.outerWidth() - me.dd.width() + 1) + Wui.getScrollbarWidth();

            // Set drop-down to the widest between the field and its children
            
            width = (width > widestChild) ? width : widestChild;
            me.dd.width(width);
        }
        
        if (!me._open) {
            me.dd.addClass(me.hiddenCls);
        }
    },
    
    
    /**
     * Applies attributes defined on the WUI object to the field on the DOM. In this implementation,
     * the parameters are not utilized.
     *
     * @param   {Object}    altAttr     Attributes that should be applied to the alternate target
     * @param   {jQuery}    altTarget   Alternate target from setting ids on the 'el' of the object
     */
    argsByParam: function() { //(altAttr, altTarget) {
        var me = this,
            attributesToApply = {},
            // altTargetAttributes = {},
            wuiToHTMLTranslation = {
               id:          'id',
               name:        'name',
               tabindex:    'tabIndex',
               lang:        'lang',
               title:       'titleAttr'
            };

        $.each(wuiToHTMLTranslation, function(html_attr, wui_attr){
            var attributeVal = me[wui_attr];
            
            if ((typeof attributeVal == 'string' || typeof attributeVal == 'number')) {
                // Just for this implementation of Wui.Combo2
                if (html_attr == 'name') {
                    me.selectTag.attr(html_attr, attributeVal);
                }
                else {
                    attributesToApply[html_attr] = attributeVal;
                }
                    
                // For every other instance
                // if (altTarget && !$.isEmptyObject(altAttr)) {
                //     altTargetAttributes[html_attr] = attributeVal;
                // }
                // else {
                //     attributesToApply[html_attr] = attributeVal;
                // }
            }
        });

        me.field.attr(attributesToApply);

        // Regular implementation
        // $(me.el).attr(attributesToApply);
        // if(altTarget) {
        //     altTarget.attr(altTargetAttributes);
        // }
    },

    
    /**
     * Attach the combo box to a select box. The combo will assume the options of the select as its 
     * data, and place itself in the DOM in the position of the select box. The select box will be 
     * placed within the 'el' of the Wui.Combo and will be hidden, but still accessible.
     *
     * @param   {Node}  select  DOM node of a select box to attach the Wui.Combo
     */
    attachToElement: function(select) {
        var me = this;

        // Add an object observer on the select box so that value changes translate well
        me.selectObserver($(select));
        
        // Add listeners to mirror events between combo and select
        select.on({
            change: function() {
                // false makes the change 'silent' so the second listener won't fire
                me.val(select.val(), false);
            }
        });
        
        me.el.on('valchange', function(event, combo, newVal) {
            var foundItem,
                setSelect = (function() {
                    // In cases where there is not a null option in the select, make setting the
                    // Combo2 to 'null' translate to a blank string. The value of the select may
                    // be null anyway if there is no blank string option in the select.
                    if(newVal === null) {
                        foundItem = me.getItemBy(me.valueItem, newVal);
                        if (typeof foundItem == 'undefined') {
                            return "";
                        }
                        else {
                            return newVal;
                        }
                    }
                    else if ($.isPlainObject(newVal)) {
                        return newVal[me.valueItem];
                    }
                    else {
                        return newVal;
                    }
                })();
                
            select.val(setSelect);
        });  
    },


    /**
     * Builds the combo and positions it on the DOM based on the selectTag target passed 
     * to the combo.
     */
    buildComboFromSelect: function() {
        var me = this;
        
        // Hide select box and replace it with the Combo2. Apply styles.
        me.selectTag.after(me.el).addClass(me.hiddenCls).prependTo(me.el);
        me.attachToElement(me.selectTag);
        me.cssByParam();
        
        // Default data model returned from Wui.parseOptions();
        me.valueItem =  'value';
        me.titleItem =  'label';
        
        // If the user hasn't defined a template, provide a default
        if (!me.template) {
            // No sense escaping the HTML here, because if you're getting injection at the
            // HTML level, it has already occurred.
            me.engine.html = me.template = '<li>{label}</li>';
        }
        
        // Get data from the select
        me.setData(Wui.parseSelect(me.selectTag));
        
        // Set value of Wui field to selected value
        me.val(me.selectTag.val(), false);
    },
    
    
    /**
     * Builds the combo from config parameters set on the Combo.
     */
    buildComboFromJS: function() {
        var me = this;
        
        // Create template if one hasn't been defined
        if (!(me.hasOwnProperty('template') && me.template !== null && me.template !== undefined) &&
            me.hasOwnProperty('valueItem') &&
            me.hasOwnProperty('titleItem') &&
            me.valueItem &&
            me.titleItem
        ) {
            me.engine.html = me.template = '<li>{' +me.titleItem+ '|escape:html}</li>';
        }

        // Ensure that all required items are present
        if (!me.template) {
            throw new Error('Wui.js - valueItem and titleItem, or template, are required configs for a Combo.');
        }

        // Attach the target to a config based location
        me.addToDOM();

        // Loads data per the method appropriate for the config object
        me.getSrcData();
    },


    /**
     * Closes the drop-down menu and restores the body to whatever scroll state it was in previously.
     */
    close: function() { 
        var me = this;
            
        if (me._open === true) {
            me.lockBodyScroll();
            
            me._open = false;
            me.dd.addClass(me.hiddenCls);
            
            // Only reselect the field in the instance that the close options list button was pressed.
            if (me.isBlurring !== undefined) {
                me.isBlurring = true;
                me.field.focus().select();
                
            }
        }
    },
    
    
    /**
     * Creates the button for toggling the options list based on the value of the Combo's `showDD` property
     */
    createOptionListToggle: function() {
        var me = this,
            retBtn;

        if (me.showOpenButton) {
            // This is a link instead of a button because when setListeners lets the ENTER keydown event
            // fly, within a form, the next button on the DOM within the form will catch it
            // which would be the OptionListToggle. That would in turn fire the button 'click'
            // event which would open the option list before the ENTER keyup event runs, which would
            // see an open dropdown and catch the event.
            retBtn = $('<a>', {
                unselectable:'on',
                tabindex: -1
            })
                .addClass('wui-button drop-down-switch')
                .html('')
                .on({
                    mousedown: function() {
                        if (me.field.is(':focus')) {
                            me.isBlurring = false;
                        }
                    },
                    click: function(event) {
                        // Required so that the click doesn't trigger the listener on the document for closing
                        // the dropdown
                        event.preventDefault();
                        event.stopPropagation();
                        
                        if (me._open === true) {
                            me.close();
                        }
                        else {
                            me.field.mousedown();
                        }
                    }
                });
                
            me.el.addClass('wui-has-dd-btn');
                
            return retBtn;
        }
    },


    /**
     * Applies styles from the parameters on the WUI object to the DOM elements, things such as attributes, CSS classes
     * and inline definitions for height and width are set here.
     *
     * @returns     {jQuery}    The DOM element  or 'el' of the current Wui object
     */
    cssByParam: function() {
        var me = this,
            el = me.el,
            a,
            cssParamObj = {};

        me.argsByParam();


        // Add attributes if defined
        if (!$.isEmptyObject(me.attr)) {
            el.attr(me.attr);
        }
            
        // calculate dimensions
        if ($.isNumeric(me.height) && me.height >= 0) {
            $.extend(cssParamObj,{height: me.height});
        }
        if ($.isNumeric(me.width) && me.width >= 0) {
            $.extend(cssParamObj,{width: me.width, flex:'none'});
        }

        // calculate percentage based dimensions
        if (Wui.isPercent(me.width)) {
            a = Wui.percentToPixels(el,me.width, 'width');
            if(a !== 0) $.extend(cssParamObj,{width:a, flex:'none'});
        }
        if (Wui.isPercent(me.height)) {
            a = Wui.percentToPixels(el,me.height, 'height');
            if(a !== 0) $.extend(cssParamObj,{height:a});
        }
        
        // hide an object based on its hidden value
        if(me.hidden) {
            $.extend(cssParamObj,'display','none');
        }

        return el.addClass(me.cls).css(cssParamObj);
    },


    /**
     * Overwrites the Wui.Data event hook to do something when the data changes
     */
    dataChanged: function() { 
        this.make(); 
    },
    

    /**
     * Loops through each of the objects items. The passed in function gets
     * called with two parameters the item, and the item's index.
     *
     * @param   {function}  fn          Function that gets called for each item of the object.
     * @param   {boolean}   ascending   Whether the loop happens in ascending or descending order. 
     *                                  Defaults to true.
     *
     * @returns {boolean}   True if the items array exists
     */
    each: function(fn, ascending) {
        var me = this,
            i = 0,
            arry = me.items || me;  // Allows this method to be used on regular arrays too when
                                    // by calling each: me.each.call([], function(){...})

        if (!$.isArray(arry)) {
            return false;
        }

        // ascending
        if ((ascending !== false)) {
            for (i; i < arry.length; i++) {
                if (fn(arry[i], i) === false) {
                    break;
                }
            }
        }

        // descending
        else {
            for (i = arry.length; i >= 0; i--) {
                if (fn(arry[i], i) === false) {
                    break;
                }
            }
        }

        return true;
    },
    
    
    /**
     * Overrides Wui.Data.failure to turn the spinner off and show an error icon when there is 
     * an AJAX problem.
     */
    failure: function(jqXHR) {
        var me = this;

        // Discern between aborted and failed requests so that we don't show the fail indicator
        // when a user types faster than the server can respond.
        if (jqXHR.status === 0 || jqXHR.readyState === 0) {
            return;
        }

        me.el.removeClass('wui-loading').addClass('wui-error');
        
        setTimeout(function() {
            me.el.removeClass('wui-error');
        }, 1000);
    },
    
    
    /**
     * Returns a record containing a key value pair to be found in a record.
     *
     * @param    {String}           key     The data item to look for
     * @param    {any}              val     The value to look for
     *
     * @return {Object|undefined}   An object containing the dataList, row, and record, 
     *                              or undefined if there was no matching row.
     */       
    getItemBy: function(key, val) {
        var me = this,
            retVal;
        
        me.each(function(itm) {
            if(itm.rec[key] !== undefined && itm.rec[key] === val) {
                retVal = itm;
                
                // false breaks out of the loop when a match is found
                return false;
            }
        });
        
        return retVal;
    },
    
    
    /**
     * Determines whether to get data from a local or remote source, and whether the data has
     * already had an initial load so it doesn't repeat remote calls.
     */
    getSrcData: function() {
        var me = this;
        
        if (me.initLoaded !== true && $.isArray(me.data) && me.data.length > 0) {
            me.setParams(me.params);
            me.initLoaded = true;

            return me.setData(me.data);
        }
        else {
            if (me.autoLoad) {
                if (this.url !== null) {
                    return me.loadData();
                }
                else {
                    return me.setData(me.data);
                }
            }
        }
    },


    /**
     * Returns only the simple value of an item.
     */
    getVal: function() {
        var me = this,
            ret_val = ($.isPlainObject(me.value) && typeof me.value[me.valueItem] != 'undefined') ?
                me.value[me.valueItem] :
                    me.value;

        return ret_val;
    },
    
    
    /**
     * Performs an unbound search for the search term (srchVal) within the options list and adds a span.wui-hilight
     * class around all matches.
     *
     * @param   {string}    srchVal    A search term
     */
    hilightText: function(srchVal) {
        var me = this,
            hilightCls = 'wui-highlight';

        function clearHilight(obj) {
            return $(obj).find('.' + hilightCls).each(function() {
                $(this).replaceWith($(this).html());
            }).end();
        }

        function addHilight(text) {
            return text.replace( new RegExp(srchVal, "ig"), function(m) {
                return '<span class="' +hilightCls+ '">' +m+ '</span>';
            });
        }

        function hilightText(obj) {
            var node = (obj instanceof jQuery) ? obj[0] : obj;
            
            // There may be previous hilighting
            clearHilight(obj);

            // Previous hilighting may have split text nodes apart that belong together. Restore them:
            node.normalize();
            
            Array.prototype.forEach.call(node.childNodes, function(childNode) {
                // Act on text nodes that are not blank, else recurse
                if (childNode.nodeType == 3 && childNode.nodeValue.replace(/^\s+|\s+$/g, '').length > 0) {
                    var hilightedText = addHilight(childNode.nodeValue),
                        parsedNodes = $.parseHTML(hilightedText);
                    
                    // If there was zero parsed nodes, the text node probably contained an XSS injection.
                    // Best to leave it as a text node.
                    // If there is only one node, either no hilighting took place, do nothing; or 
                    // the entire node was hilighted in which case it will have changed node type.
                    if (parsedNodes.length > 1 || (parsedNodes.length === 1 && parsedNodes[0].nodeType != childNode.nodeType)) {
                        // The parsed text is probably broken up into multiple nodes with the hilighting
                        // so replace it with the one or more results.
                        parsedNodes.forEach(function(parsedNode) {
                            node.insertBefore(parsedNode, childNode);
                        });
                        node.removeChild(childNode);
                    }
                }
                else if (childNode.hasChildNodes()) {
                    hilightText(childNode);
                }
            });

            return $(obj);
        }

        // We have a search string, hilight and hide stuff
        if (typeof srchVal != 'undefined' && $.trim(srchVal).length !== 0) {
            // Un-hide all optgroups
            me.dd.find('.wui-optgroup-label.' + me.hiddenCls).removeClass(me.hiddenCls);
            
            me.searchHTMLText(
                srchVal,
                function(itm) { hilightText(itm).removeClass(me.hiddenCls); },
                function(itm) { clearHilight(itm).addClass(me.hiddenCls); }
            );
            
            // Clear disabled items in a search
            me.dd.children('.wui-combo-disabled').addClass(me.hiddenCls);
            
            // Clear any optgroups that don't have visible items in them
            me.dd.children('.wui-optgroup-label').each(function() {
                var group = $(arguments[1]);
                
                if (group.children('ul').children(':visible').length === 0) {
                    group.addClass(me.hiddenCls);
                }
            });
        }
        
        // No search string, clear all hilighting, show all options/items
        else {
            me.dd.find('.' + me.hiddenCls).removeClass(me.hiddenCls);
            me.dd.find('.' + hilightCls).each(function() {
                $(this).replaceWith($(this).html());
            });
        }
        
        Wui.positionItem(me.el, me.dd);
    },


    /**
     * Init sets variables needed for the combo and its methods to function, as well as setting
     * the initial state of the field based on configs.
     *
     * @param   {Node}  target  A DOM node, jQuery object, or selectot string for a target select 
     *                          tag on the DOM.
     */
    init: function(target) {
        var me = this;
            
        me.selectTag = (typeof target != 'undefined') ? $(target) : undefined;    
            
        $.extend(me, {
                            // Build the field.
            el:             $('<div>').addClass('wui-form-field').append(
                                me._setListeners()
                            ),
            
                            // Create template engine and add applicable functions.
            engine:         new Wui.Smarty($.extend({html: me.template}, me.templateFn)),
            
                            // Used to tie the drop down and focus events back to the parent field.
            idCls:          me.selectTag ? Wui.id(me.selectTag.attr('name')) : Wui.id(),
            
                            // Array will contain objects that bind the Combo's data and DOM nodes.
            items:          [],
            
                            // If the user didn't specify multiselect, check the underlying select.
            multiSelect:    (me.multiSelect === true || (me.selectTag && me.selectTag.prop('multiple') === true)),
                            
                            // Set remote configs.
            searchLocal:    (me.url === null || me.autoLoad === true),
            
                            // Set initial value.
            value:          me.hasOwnProperty('value') ? me.value : null
        });

        // Create dropdown container.
        $('body').append(
            me.dd = $('<ul>').addClass('wui-combo-dd ' + me.hiddenCls + ' ' + me.ddCls)
        );
        
        // Placeholder text should be set before the combo is build because if a disabled option
        // is set selected on the combo, that will be made the placeholder text, and this would
        // override that.
        me.setPlaceholder(me.placeholder);
        
        // Add field elements before the 'build' steps because they include making the options
        // drop down which may take a long time to render, and we want the field to get its
        // appearance quickly.
        me.el
            .addClass('wui-combo ' + me.idCls)
            .append(
            // Add drop down button per configs
            me.createOptionListToggle()
        );
        
        // Build the combo box
        if (me.selectTag) {
            me.buildComboFromSelect();
        }
        else {
            me.buildComboFromJS();
        }
        
        me.toggleFieldSearchability();
    },
    

    /**
     * Performs mutations and fires listeners when an item is deselected @private
     *
     * @param   {Object}    itm     The item passed in will be returned.
     *
     * @returns {*}         The item passed in will be returned.
     */
    itemDeselect: function(itm) {
        var me = this;

        if (me.selected.length > 0) {
            itm.el.removeClass('wui-selected');
            me.selected = [];
            me.el
                .trigger($.Event('wuideselect'),[me, itm.el, itm.rec])
                .trigger($.Event('wuichange'), [me, itm.el, itm.rec, me.selected]);
                
            return itm;
        }
    },
    

    /**
     * Performs mutations and fires listeners when an item is selected.
     *
     * @param       {Object}    itm         Wui item containing 'el' and 'rec' items
     * @param       {Boolean}   silent      Optional. Whether to fire events or not. Default is true.
     *
     * @returns     {*}         The same item that was passsed in
     */
    itemSelect: function(itm, silent) {
        var me = this;

        if (itm) {
            me.dd.find('.wui-selected').removeClass('wui-selected');
            itm.el.addClass('wui-selected');
            me.selected = [itm];

            if (!me.multiSelect && !silent) {
                me.el.trigger($.Event('wuiselect'), [me, itm.el, itm.rec])
                    .trigger($.Event('wuichange'), [me, itm.el, itm.rec, me.selected]);
            }
        }

        return itm;
    },


    /**
     * Minor Override for Wui.Data.loadData that adds a class to display a spinner
     */
    loadData: function() {
        var me = this;
        
        me.el.addClass('wui-loading');
        
        return Wui.Data.prototype.loadData.apply(me, arguments);  
    },
    

    /**
     * Locks or unlocks the ability for the DOM <body> to scroll while the option list is open.
     * Necessary so we don't have the drop down get disassociated from the field.
     *
     * @param       {Boolean}   lockIt      Whether to lock scrolling. Default is false.
     *
     * @returns     {jQuery}    Returns the jQuery wrapped body element.
     */
    lockBodyScroll: function(lockIt) {
        var me = this,
            body = $('body'),
            win = $(window),
            scrollCls = 'wui-combo-no-scroll',
            eventName = 'resize.wui-combo2',
            scrollTop;
        
        // Only necessary to lock scrolling if the body height is larger than the viewport.
        if (lockIt === true && body.outerHeight(true) > $.viewportH()) {
            body.css({
                            // Use $(window).scrollTop because $(body) scrolltop doesn't work in IE8
                    top:    win.scrollTop() * -1,
                    
                            // We have to manage body width here because putting 'width:100%' in
                            // the CSS class doesn't work for a body that has a margin.
                    width:  body.width()
                })
                .addClass(scrollCls);
                
            // Since we're manually setting width on the body, we have to account for window resize
            win.on(eventName, function() {
                // turn scroll lock off quickly, adjust drop down and body, and turn lock back on
                me.lockBodyScroll();
                me.sizeAndPositionDD();
                body.css({width: body.width()});
                me.lockBodyScroll(true);
            });
        } 
        else {
            scrollTop = parseInt(body.css('top')) * -1;
            
            body.removeClass(scrollCls)
                .css({
                    top:    '',
                    width:  ''
                });
                
            win.scrollTop(scrollTop)
                .off(eventName);
        }
            
        return body;
    },
    

    /**
     * Creates the items in the options list making their DOM representations through a Wui.Smarty
     * template, and associating the data with those nodes.
     *
     * @returns     {Number}    The number of items that were created
     */
    make: function() {
        var me = this,
            holder = $('<div>'),
            optGroups = {};

        // Clear out items list
        me.items = [];

        // Show data in list, Add items to me.items
        me.data.forEach(function(rec) {
            var templateString = me.engine.make(rec),
                itm = {
                    el: $(templateString),
                    rec: rec
                };
            
            // Add newly made item to the items array which represents data (rec) bound with a
            // DOM node (el).
            me.items.push(itm);
            
            // No listeners for disabled items disables them in this context
            if (rec.disabled !== true) {
                me.optionEventListeners(itm);
            }
            else {
                itm.el.addClass('wui-combo-disabled');
            }
            
            // Put item into optgroups if necessary 
            if (typeof rec.optgroup != 'undefined' && String(rec.optgroup).length !== 0) {
                if (typeof optGroups[rec.optgroup] != 'undefined') {
                    optGroups[rec.optgroup].find('ul').append(itm.el);
                }
                else {
                    holder.append(
                        optGroups[rec.optgroup] = $('<li class="wui-optgroup-label">' +
                            rec.optgroup + '<ul class="wui-optgroup"></ul></li>')
                                .find('ul')
                                    .append(itm.el)
                                        .end()
                    );
                }
            }
            else {
                holder.append(itm.el);
            }
        });
        

        // Clear out items in the drop down and add new items from wrapper.
        // Ensure clicking on the drop down doesn't close it.
        me.dd.empty()
            .append(holder.children())
            .off('mousedown')
            .on('mousedown', function() { 
                me.isBlurring = false; 
            });

        // Show some feedback even with no data, or select current if it exists.
        if (me.data.length === 0) {
            me.dd.html(me.emptyMsg);
        }
        else {
            me.hilightText(me.previous);
        }

        // Necessary here because remote queries will remake the list with every keystroke and
        // that can change the size/position of the options list.
        me.sizeAndPositionDD();
        me.el.removeClass('wui-loading');

        return me.items.length;
    },
    
    
    /**
     * Method meant to be overridden. Runs when the pre-applied value for the combo is not found 
     * in the dataset.
     */
    notFound:   function() {},
    
    
    /**
     * Adds the interaction listeners to passed in option list item's 'el' node.
     *
     * @param       {Object}    itm     A Wui Object item with an 'el' node and 'rec' data property.
     *
     * @returns     {Object}    The 'itm' object that was passed in.
     */
    optionEventListeners: function(itm) {
        var me = this;
        
        itm.el.data('itm', itm)
            .bind('touchstart', function() {
                    me.itemSelect($(this).data('itm'));
                    me.isBlurring = false;
            })
            .on({
                mousemove: function(event) { 
                    event.stopPropagation();
                    
                    if (typeof me.selected[0] == 'undefined') {
                        me.itemSelect($(this).data('itm'));
                    }
                    
                    if (me.selected[0].el[0] !== this) {
                        me.itemSelect($(this).data('itm'));
                    }
                },
                            
                mousedown: function(event) { 
                    event.stopPropagation();
                    me.isBlurring = false; 
                },
                            
                click: function(event) { 
                    event.stopPropagation();
                    me.set();
                    me.close();
                }
            });
        
        return itm;
    },

    
    /**
     * Opens the drop down and resizes the dropdown accordingly based on whether there are 
     * existing CSS rules.
     */
    open: function() {
        var me = this;

        if (!me._open) {
            me._open = true;
            
            me.lockBodyScroll(true);
            
            // Close the drop down when field loses focus.
            $(document).one('click:' + me.idCls,'*:not(.' +me.idCls+ ' input)', function(event) { 
                if (event.target !== me.field[0]) {
                    me.setVal(me.value);
                    me.close();
                }
            });
            
            me.sizeAndPositionDD();
            me.field.focus().select();
        }
    },
    
    
    /**
     * Scrolls the list to the currently selected item.
     */
    scrollToCurrent: function() {
        var me = this;
        var firstSelect = me.dd.find('.wui-selected:first');
        var ofstP = firstSelect.offsetParent();
        var offset = (function(){ 
                var r = 0;

                firstSelect.prevAll().each(function(){ r += $(this).outerHeight(); });
                r -= ((me.dd).height()) / 2 - (firstSelect.outerHeight() / 2);

                return  r; 
            })();
            
        ofstP.animate( { scrollTop:offset }, 100 );
    },
    
    
    /**
     * Searches locally within the drop-down's data for the srchVal, otherwise if searchLocal
     * is false, the data is searched remotely.
     */
    searchData: function() {
        var me = this,
            srchVal = $.trim(me.field[0].value),
            oldSearch = me.previous || undefined,
            srchParams = {};

        me.previous = srchVal;
        
        if (me.searchLocal) {
            me.hilightText(srchVal);
        }
        else {
            if ((srchVal.length >= me.minKeys || srchVal.length === 0) && me.previous != oldSearch) {
                srchParams[me.searchArgName] = srchVal;
                me.loadData(srchParams);
            }
        }
    },
    
    
    /**
     * Performs an unbound search for the search term (srchVal) within the options list and retuns
     * arrays of those elements matched, and those not matched.
     *
     * @param   {string}        srchVal     A search term
     * @param   {function}      foundFn     Function that accepts the DOM node of the item as a parameter
     *                                      when text is found in the node.
     * @param   {function}      absentFn    Function that accepts the DOM node of the item as a parameter
     *                                      when text is absent in the node.
     */
    searchHTMLText: function(srchVal, foundFn, absentFn) {
        var me = this,
            options = me.items.map(function(itm) {
                return itm.el;
            });
            
        me.each.call(options, function(itm) {
            // Search only visible text here (rather than regex'ing on the html) so we only get visible items
            // Also allows us to use pseudo-classes to add non-searchable text.
            if(itm.text().toUpperCase().indexOf(srchVal.toUpperCase()) >= 0 && typeof foundFn == 'function') {
                return foundFn(itm);
            }
            else if (typeof absentFn == 'function') {
                return absentFn(itm);
            }
        });
    },
    
    
    /**
     * Selects the list item immediately before or after the currently selected item, works on the filtered
     * visibility if the drop down is open.
     *
     * @param       {Number}    dir     Direction to go to select an ajacent value [1, -1]
     *
     * @returns     {Object}    The selected item
     */
    selectAjacent: function(dir) {
        var me = this,
        
            // Determine the visible elements.
            options = me.items.map(function(itm) {
                if (itm.rec.disabled === true || !itm.el.is(':visible')) {
                    return undefined;
                }
                else {
                    return itm.el;
                }
            }).filter(function(itm){
                return (itm !== undefined);
            }),
            
            // Get the index of the selected element in the current options array (if any).
            selectedIndex = (function(selection) {
                var retVal;
                
                // If there is a selected item, move from it, else go from an end.
                if (selection.length > 0) {
                    options.forEach(function(option, index) {
                        if (option[0] === selection[0].el[0]) {
                            retVal = index;
                            
                            // breaks loop
                            return false;
                        }
                    });
                }
                
                return retVal;
            })(me.selected),
            
            // Determine the value of the edge depending on an arrow key.
            theEnd = (dir > 0) ? 0 : options.length - 1,
            itm,
            el;
            
        // If the drop down was just opened, we only want to show the selected item, not change it.
        if (me.justOpened === true) {
            dir = 0;
            me.justOpened = false;
        }
            
        // If there is a selected item, move from it, else go from an end.
        if ($.isNumeric(selectedIndex)) {
            el = options[selectedIndex + dir];
        }
        else {
            el = options[theEnd];
        }
        
        itm = me.selectByEl(el);
        
        // If itm is not a Wui object, we're likely on an edge. Go to the other end of the list.
        if (!$.isPlainObject(itm)) {
            itm = me.selectByEl(options[theEnd]);
        }
    },


    /**
     * Selects an item according to the key value pair to be found in a record.
     *
     * @param    {string}           key     The data item to look for
     * @param    {string|number}    val     The value to look for
     *
     * @returns  An object containing the dataList, row, and record, or undefined if there was no matching row.
     */
    selectBy: function() {
        var me = this,
            itm = me.getItemBy.apply(me, arguments);
            
        return me.itemSelect(itm);
    },


    /**
     * Selects the matching DataList item.
     *
     * @param       {jQuery Object}     el          An object that will match an element in the DataList.
     * @param       {Boolean}           doScroll    Will prevent scrolling to the item if set to 'false'.
     *
     * @returns     {Object}            A Wui object containing 'el' and 'rec' members, or undefined.
     */
    selectByEl: function(el, doScroll) {
        var me = this,
            retVal;

        me.itemSelect(
            retVal = $(el).data('itm')
        );
        
        if (doScroll !== false) {
            me.scrollToCurrent();
        }
        
        return retVal;
    },
    
    
    /**
     * If there is a currently selected item, select it afresh in the new data/item-set.
     */
    selectCurrent: function() {
        var me = this,
            selectedItm;
        
        // Select a pre-applied value if it exists
        if (me.value && me.field.val().length === 0) {
            selectedItm = me.selectBy(me.valueItem, me.value);
        }
    
        if (typeof selectedItm == 'undefined' && $.isPlainObject(me.value)) {
            selectedItm = me.selectBy(me.valueItem, me.value[me.valueItem]);
        }
       
        if (typeof selectedItm !== 'undefined') {
            me.set();
        }
        else {
            me.notFound();
        }
    },
    

    /**
     * Overrides object change parameters so that if a select box is changed programmatically
     * that change events will still fire.
     *
     * @param   {Node}      mySelect    A select box that will have its events communicated back and forth to and from
     *                                  the Combo2 control
     *
     * @returns {Node}      The item that was passed in
     */
    selectObserver: function(mySelect) {
        var me = this;
        
        // Different browsers (Safari) will fire events in differing order, so this makes sure the
        // observer events are fired for ALL option values in the select before firing a change
        // that will update the value on the WUI control. If a change fires prematurely, the wrong
        // value will be captured by the WUI field.
        function wui_select_observer() {
            var elem = mySelect[0],
                option_count = (~~elem.option_count !== 0) ? elem.option_count : mySelect.find('option').length;
            
            // The select box has been modified
            if(me.selectTag && option_count != me.total) {
                me.setData(Wui.parseSelect(me.selectTag));
            }
            
            elem.observer_count = ~~++elem.observer_count;
            
            if(elem.observer_count + 1 == option_count) {
                elem.observer_count = 0;
                
                // Used to put this call on the event loop because in the case where the data gets
                // reset, the field hasn't yet registered the change in value, so this way the event
                // will execute after the change in value.
                setTimeout(function() {
                    mySelect.trigger('change');
                }, 0);
            }
        }
        
        // For jQuery-type setters and others which utilize changing the option to change value.
        mySelect.find('option').each(function(index, option) {
            // Property mutation for hidden input
            Object.defineProperty(option, "selected", {
                get: function() {
                    return this.getAttribute("selected");
                },
                set: function(val) {
                    // handle select change here
                    if (val === false) {
                        option.removeAttribute('selected');
                    }
                    else if (option.disabled !== true) {
                        option.setAttribute('selected', true);
                    }
                    
                    wui_select_observer();
                }
            });
        });
        
        // For standard JS type setters who will set the value attribute on the field.
        Object.defineProperty(mySelect[0], "value", {
            get: function() {
                return $.valHooks.select.get(this);
            },
            set: function(val) {
                $.valHooks.select.set(this, val);
            }
        });
        
        // Makes the function a pass-through
        return mySelect; 
    },


    /**
     * Sets the value of the drop down to the value of the selected item in the options list.
     */
    set: function() {
        var me = this,
            selection = me.selected[0];

        if (selection) {
            // me.setVal calls this function so this if statement prevents an infinite loop
            if (me.value !== selection.rec) {
                me.val(selection.rec);
            }   
            
            // Set the field to the value
            if (selection.rec.disabled !== true) {
                me.field.val(selection.rec[me.titleItem]);
                me.setPlaceholder('');
                me.toggleFieldSearchability();
            }
            else {
                me.setPlaceholder(selection.rec[me.titleItem]);
            }
             
        }
            
        if (me._open) {
            me.close();
        }
    },
    

    /**
     * Marks the parent form as changed if the field belongs to a form, calls the valChange event hooks and listeners.
     *
     * @param       {*}     oldVal      The old value of the Combo2
     * @private
     */
    _setChanged: function(oldVal) {
        var me = this;
        
        // Marks the parent form as 'changed'
        if(me.parent && me.parent instanceof Wui.Form)
            me.parent.formChange(true, me);
        
        // Calls listeners for valchange
        me.el.trigger($.Event('valchange'), [me, me.value, oldVal]);
    },
    

    /**
     * Sets listeners on the field that give it HTML5 Datalist-like interactions
     *
     * @private
     *
     * @returns     {jQuery}    The field object of the Combo2
     */
    _setListeners: function() {
        var me = this,
            keys = {
                TAB:    9,
                ENTER:  13,
                SHIFT:  16,
                ESC:    27,
                UP:     38,
                DOWN:   40
            };
                    
        return me.field
            .on('keydown', function(event) {
                // If the option list is open, enter will set a value, otherwise it passes
                // through so a user can submit a form while focus is on this field.
                if (event.keyCode == keys.ENTER) {
                    me.can_search = false;
                    
                    if (me._open) {
                        event.stopPropagation();
                        event.preventDefault();
                        me.set();    
                    }
                }
                else {
                    event.stopPropagation();
                }
                
                // When the field is readonly, don't perform default for any keys except tab so
                // that behavoirs like backspace causing page navigation don't occur.
                if (me.items.length < me.searchThreshold && me.searchLocal && event.keyCode != keys.TAB) {
                    event.preventDefault();
                }
                
                // So shift-tabbing out of a field and going back to it doesn't result in the 
                // field being needlessly filtered.
                if (event.keyCode == keys.SHIFT) {
                    return false;
                }
                
                // So tabbing off of the field will select the last selected option and not get
                // confused by the mouse hovering over an item.
                if (event.keyCode == keys.TAB) {
                    if (!me._open) {
                        me.set();
                    }
                    else {
                        // Should not tab when the option list is open - like standard <select>
                        event.preventDefault();
                    }
                }
                else {
                    // Open drop down on any keypress that isn't shift or enter.
                    if ($.inArray(event.keyCode,[keys.ENTER, keys.SHIFT]) == -1) {
                        if (!me._open) {
                            me.justOpened = true;
                        }
                        me.open();
                    }
                    
                    if ($.inArray(event.keyCode,[keys.DOWN, keys.UP, keys.ESC]) != -1) {
                        event.preventDefault();
                        me.can_search = false;
                        
                        switch (event.keyCode) {
                            case keys.DOWN:
                                me.selectAjacent(1);
                                break;
                            case keys.UP:
                                me.selectAjacent(-1);
                                break;
                            case keys.ESC:
                                me.close();
                                break;
                        }
                    }
                    else {
                        // for ie8's lack of 'input' support.
                        me.can_search = true;
                    }
                }
            })
            .on('keyup', function(event) {
                var key = null;
                
                if (event.keyCode == keys.ENTER) {
                    if (me._open) {
                        event.stopPropagation();
                        event.preventDefault();
                        me.set();
                    }
                }
                else {
                    event.stopPropagation();
                }
                
                if (me.can_search && $.inArray(event.keyCode,[keys.TAB, keys.SHIFT]) == -1) {
                    if (me.total >= me.searchThreshold || !me.searchLocal) {
                        me.searchData();
                    }
                    // When not filtering, we want to behave like a standard select box and jump
                    // to the item in the select that matches the filter
                    else {
                        // Get the character of the key being pressed
                        if (event.which !== 0 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                            key = String.fromCharCode(event.which);
                            
                            if (typeof me.selectTypeBuffer == 'undefined') {
                                me.selectTypeBuffer = key;
                                
                                // This buffer should only last for a second, then it will clear.
                                // Allows a user to quickly type out the first few characters of an
                                // option item and have the combo move the selection to them.
                                setTimeout(function(){
                                    me.selectTypeBuffer = undefined;
                                }, 1000);
                            }
                            else {
                                // If the user presses multiple keys under a second, use them all
                                // to search
                                me.selectTypeBuffer += key;
                            }
                            
                            me.searchHTMLText(me.selectTypeBuffer, function(itm) {
                                me.selectByEl(itm);
                            });
                        }
                    }
                    
                }
            })
            .on('focus', function(event) {
                event.stopPropagation();
                
                // check the isBlurring value because if its explicitly false, that means we're
                // not receiving a true 'focus' event and shouldn't call the handler for the
                // underlying field.
                if (me.isBlurring !== true) {
                    if (me.selectTag && me.isBlurring === undefined) {
                        me.selectTag.triggerHandler('focus');
                    }
                    
                    me.isBlurring = undefined;
                    me.el.addClass('wui-fe-focus');
                }
            })
            .on('blur', function() {
                // If isBlurring is false, the event came from the control itself, so ignore it.
                if (me.isBlurring !== false) {
                    me.close();
                    me.isBlurring = undefined;
                    me.el.removeClass('wui-fe-focus');
                }
            })
            .on('mousedown', function(e) {
                if (!$(this).is(':focus')) {
                    e.preventDefault();
                }
                
                me.open();
            });
    },


    /**
     * Sets a placeholder on the field.
     */
    setPlaceholder: function(placeholder) {
        var me = this;
        
        me.placeholder = placeholder;
        me.field.attr('placeholder', placeholder);
        
        return placeholder;
    },
                    

    /**
     * Allows the value to be set via a simple or complex value.
     */
    setVal: function(sv){
        var me = this,
            searchItem = ($.isPlainObject(sv)) ? sv[me.valueItem] : sv,
            item = me.selectBy(me.valueItem, searchItem);
        
        if ($.isPlainObject(item)) {
            me.value = item.rec;
            me.set();
            return item;
        }
    },
    
    
    /**
     * Hide drop down while we resize and position, then show it.
     */
    sizeAndPositionDD: function() {
        var me = this;
        
        me.dd.css({visibility: 'hidden'}).removeClass(me.hiddenCls);
        me.adjustDropDownSize();
        Wui.positionItem(me.el, me.dd);
        me.dd.css('visibility', '');
        
        // Select the current item in the option list and scroll to it.
        if ($.isPlainObject(me.value)) {
            me.getItemBy(me.valueItem, me.value[me.valueItem]);
            me.scrollToCurrent();
        }
    },
    
    /**
     * If the items in the options list are fewer than the searchThreshold, the field is made 
     * readonly so that filtering cannot be performed. However, typing in the field still causes
     * the selection to move to an option containing a typed value. The CSS definition of 
     * 'wui-combo-searchable' toggles a search icon. 
     */
    toggleFieldSearchability: function() {
        var me = this,
            isSearchable = (me.items.length >= me.searchThreshold || !me.searchLocal),
            hasNoSelection = (me.selected.length === 0 || me.field.val().length === 0);
        
        if (isSearchable && hasNoSelection) {
            me.el.addClass('wui-combo-searchable');
            me.field.prop('readonly', false);
        }
        else {
            me.el.removeClass('wui-combo-searchable');
            
            if (!isSearchable) {
                me.field.prop('readonly', true);
            }
        }
    },


    /**
     * Works similarly to jQuery's val() method. If arguments are omitted the value of the FormField will be returned.
     * If arguments are specified the field's setVal() method and _setChanged() method are called, and the values
     * passed in are passed through.
     *
     * @param       {[any]}     newVal      The type of this parameter depends on the type of form field
     *
     * @returns     Either the value of the field if no arguments are passed, or the value of the arguments passed in
     */
    val: function() {
        var me = this;

        if (!arguments.length) {
            return me.getVal();
        }
        else {
            var oldVal = me.value;

            // Set the actual value of the item
            me.setVal.apply(me,arguments);
            
            // Call change listeners
            if(arguments[1] !== false)
                me._setChanged(oldVal);
            
            // Return the passed value(s)
            return arguments;
        }
    }
});