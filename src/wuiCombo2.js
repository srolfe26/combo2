import "./import-jquery";
import "./css/combo-2.css";
import { Wui } from './core-methods';
import { wuiData } from './wuiData';
import { wuiSmarty } from './wuiSmarty';

/**
 * Combo2 - Combination of a select element and an autocomplete
 * =================================================================================================
 * A Wui based control. See the [demo](http://www.wui-js.com/combo2/) page for more advanced implementation examples.
 *
 * Examples
 * --------
 * 
 * ```
 * // For the standard select box consumption
 *  standard_select = new wuiCombo2({}, '#target');
 *
 * // Combo with its own dataset
 * local_dataset = new wuiCombo2({
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
 * ```
 * 
 * Functionality
 * -------------
 *
 * - Combo requires valueItem and titleItem attributes. 
 *     - If consuming a `<select>` off the DOM (see below), these values will be set automatically
 *       to 'value' for valueItem, and 'title' for titleItem.
 *     - By default, these will automatically create a template of '<li>{titleItem|escape:html}</li>'
 * - Custom templates can be defined for the option list items on the Combo, and follow the rules 
 *   of the wuiSmarty object.
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
 *           list. This message can be changed with the `noResultsMessage` attribute.
 *
 * @class wuiCombo2
 *
 * @author  Stephen Nielsen (rolfe.nielsen@gmail.com)
 * 
 * @param   {Object}    args    A configuration object containing overrides for the default configs
 *                              below as well as methods in the prototype.
 *
 * @param   {Boolean}   args.autoLoad[false]    Whether to load remote data on instantiation of the
 *                                              Combo (true), or to load remote data based on a
 *                                              user's search. Default: false.
 *
 * @param   {Node}      target  Optional. A target can be a DOM node, a jQuery Object, or a selector
 *                                  string that returns one item that is expected to reference a select
 *                                  box that will have its data pulled into the Combo's data array.
 *
 * @returns {Object}    The wuiCombo2 object is returned.
 */
const wuiCombo2 = function(args, target) {    
    $.extend(this, {
        autoLoad: false,

        /**
         * @property    {String}    A space separated string containing names of CSS class(es) that
         *                          will be applied to the options list (or dropdown). This class
         *                          can be useful for setting a max/min height or width, or for
         *                          special styling. Default: ''.
         * @memberof    wuiCombo2
         */
        ddCls: '',

        /**
         * @property    {Object}    Attributes to set on the object - good for setting 'data-' items
         *                          Default: {}.
         * @memberof    wuiCombo2
         */
        attr: {},

        /**
         * @property    {String}    The message to display when a search yields no results, whether
         *                          local or remote. May be  a plain text string, or HTML formatted.
         *                          Default: 'No Results'.
         * @memberof    wuiCombo2
         */
        noResultsMessage: 'No Results.',

        /**
         * @property    {HTMLElement}   A jQuery wrapper of the text field for the combo. This field
         *                              is specified in the constructor of the Combo (as opposed to
         *                              the prototype) because it must be a new DOM node for every
         *                              instance of the Combo.
         * @memberof    wuiCombo2
         */
        field: $('<input>').attr({
            type:               'text',
            autocomplete:       'off',
            autocorrect:        'off',
            autocapitalize:     'off',
            spellcheck:         'false'
        }).addClass('wui-combo-search'),
        
        /** 
         * @property    {Boolean}   forceSelect     The user MUST select an item from the option list when true.
         * @memberof wuiCombo2
         */
        forceSelect: false,
        
        // Class that is used for hiding items, when filtering
        hiddenCls: 'wui-hidden',
        
        // The minimum number of characters that must be in the field before a search will occur. If
        // searching against a very large dataset, increasing this number will help reduce the
        // size of the search results.
        minKeys: 1,
        
        /** 
         * @property {String} name  The name of the hidden field within the combo2 control.
         *                          This allows this control to be used within this form as well 
         *                          as attached to existing DOM elements.
         * @memberof wuiCombo2
         */
        
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


wuiCombo2.prototype = $.extend(new wuiData(), {
    /**
     * Add the element to the DOM where specified by parameters, object configs, or by default appended to the body.
     * 
     * @param       {Element}   target      A node, jQuery object, or selector string for where to perform the action.
     * @param       {string}    action      Name of a jQuery method that will be run against the object's element
     *                                      in the array ['appendTo','prependTo', 'before', 'after'].
     *                                      
     * @returns     {Element}   The jQuery element of the Combo2
     */
    addToDOM: function(target, action){
        var me = this,
            possible_actions = ['append','prepend', 'before', 'after'];

        // Try to get action and target from configs if not passed in as parameters
        if (!Wui.isset(action) || !Wui.isset(target)) {
            $.each(possible_actions, function(idx, act) {
                if (Wui.isset(me[act])) {
                    action = act;
                    target = me[act];
                    return false;
                }
            });
        }

        // Default action
        if (!Wui.isset(action)) {
            action = 'append';
        }

        // Default target
        if (!Wui.isset(target)) {
            target = 'body';
        }

        $(target)[action](me.el);
        me.cssByParam();
        
        return me.el;
    },
    
    
    /**
     * Adds the mouse enter / mousemove listener for the drop down list. This is spit out here because
     * it needs to be added immediately when the dropdown opens as well as whenever it gets re-added
     * when the arrow keys / scrolling have turned it off.
     */
    addMouseEnterListener: function() {
        var me = this,
            cls = '.' + me.itemCls,
            boundCls = 'wui-mm-bound';
        
        
        if (!me.dd.hasClass(boundCls)) {
            me.dd
                .addClass(boundCls)
                .on('mousemove.wui_list_elements', cls, function(event) {
                    event.stopPropagation();
                    me.selectListItem($(this));
                    
                    if (me.mouseEnterListener) {
                        clearInterval(me.mouseEnterListener);
                    }
                });
        }
    },

    
    /**
     * Adds change listeners to the passed in target.
     *
     * @param   {Element}   target      An HTMLInputElement or HTMLSelectElement where the value is
     *                                  stored for use in a form.
     *
     * @returns {Element}   The same target that was passed in, now with listeners.
     */
    addTargetBinding: function(target) {
        var me = this;
        
        // Add listeners to mirror events between combo and the target, false makes the change 
        // silent so the valchange listener below won't send the combo into an infinite loop.
        target.on('change', function() {
            me.val(target.val(), false);
        });

        // Set the value from the JS on the HTML field.
        me.el.on('valchange', function(event, combo, newVal) {
            target.val(me.valueToString(newVal));
        });
        
        return target;
    },
    
    
    /**
     * Calculates the width of the drop down based on its contents
     */
    adjustDropDownSize: function() {
        var me = this, 
            width,
            widestChild = 0,
            ddElement = me.dd[0];
            
        // Look at the size of any style on the item, if width is explicity defined, 
        // don't change it here (max-width doesn't apply). Storing the variable here also makes
        // it so this is only calculated once, and so the effect of this method don't interfere
        // with future running of this method.
        if (!Wui.isset(ddElement.CSSRetrieved)) {
            ddElement.CSSRetrieved = Wui.getStylesForElement(ddElement);
            ddElement.cssWidth = ddElement.CSSRetrieved.width;
        }
        
        // The drop down has to be display block, but we don't necessarily want to show it
        if (!me._open) {
            me.dd.css({visibility: 'hidden'}).removeClass(me.hiddenCls);
        }
        
        // Clear the current width on the field
        me.dd.css({width: ''});
        
        if (isNaN(parseInt(ddElement.cssWidth)) && String(ddElement.cssWidth).indexOf('calc') !== 0) {
            // As default, set drop-down width according to the width of the field
            width = (me.el.innerWidth() < 100) ? 100 : me.el.innerWidth();
            
            // Add the scrollbar width, just in case the content scrolls
            widestChild = me.dd.outerWidth() + Wui.getScrollbarWidth();

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
                // Just for this implementation of wuiCombo2
                if (html_attr == 'name') {
                    me.target.attr(html_attr, attributeVal);
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
     * Builds the combo and positions itself in the DOM in the position of the select element passed
     * to Combo2. The original select element will be placed within the 'el' of the Wui.Combo and 
     * will be hidden, but still accessible.
     */
    buildComboFromSelect: function() {
        var me = this,
            select = me.target;
        
        // Add object observer on the select element so programmatic changes fire a change event.
        me.selectObserver(select);
        
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
        me.setData(Wui.parseSelect(select));
    },
    
    
    /**
     * Builds the combo from config parameters set on the Combo. This method of construction requires
     * a DOM target to be specified in the configs for the component to be visible/usable on screen.
     * See documentation for addToDOM() for more details on how to add a DOM target.
     *
     * This version of the combo2 will create a hidden field that gets updated with the valueItem when
     * the value of the combo changes. This item can be named through the 'name' property.
     * .
     */
    buildComboFromJS: function() {
        var me = this,
            target = me.target[0];
        
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

        // Modify the getter and setter on the input's value object so that a change event gets
        // fired so that binding successfully works - creating an observable.
        Object.defineProperty(target, 'value', {
            get: function() {
                return this.getAttribute("value");
            },
            set: function(val) {
                this.setAttribute("value",val);
                me.target.trigger('change');
            }
        });

        // Loads data per the method appropriate for the combo's configs.
        me.getSrcData();
    },


    /**
     * Closes the drop-down menu and restores the body to whatever scroll state it was in previously.
     */
    close: function() { 
        var me = this;
            
        if (me._open === true) {
            // Turn off event listeners for list items
            me.optionListEventsActive(false);
            
            me.lockBodyScroll();
            
            me._open = false;
            me.dd.addClass(me.hiddenCls);
            
            // Change the dropdown button to a close button
            me.el.find('.drop-down-switch').removeClass('open');
            
            // Make sure there is nothing weird left in the search box on close, it should 
            // reflect the value of the field.
            if ($.isPlainObject(me.value)) {
                me.setFieldValue(me.value[me.titleItem]);
            }
            
            // Only reselect the field in the instance that the close options list button was pressed.
            if (me.isBlurring !== undefined) {
                me.isBlurring = true;
                me.field.focus().select();
            }
        }
    },
    
    
    /**
     * Creates the button for toggling the options list based on the value of the Combo's 'showDD' property
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
                .on('touchstart mousedown', function() {
                        if (me.field.is(':focus')) {
                            me.isBlurring = false;
                        }
                })
                .on('touchend click', function(event) {
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
                });
                
            me.el.addClass('wui-has-dd-btn');
                
            return retBtn;
        }
    },


    /**
     * Applies styles from the parameters on the WUI object to the DOM elements, things such as
     * attributes, CSS classes and inline definitions for height and width are set here.
     *
     * @returns     {Element}    The DOM element of the combo with the CSS attributes applied.
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
     * Overwrites the wuiData event hook to do something when the data changes
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
     * Overrides wuiData.failure to turn the spinner off and show an error icon when there is 
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
     * @param    {*}                val     The value to look for
     *
     * @returns {Object|undefined}  An object containing the dataList, row, and record,
     *                              or undefined if there was no matching row.
     */       
    getItemBy: function(key, val) {
        var me = this,
            retVal;
        
        me.each(function(itm) {
            if (
                itm.rec[key] !== undefined && itm.rec[key] === val || (
                    $.isNumeric(val) && parseFloat(val) == parseFloat(itm.rec[key])
                )
            ) {
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
            ret_val = ($.isPlainObject(me.value) && Wui.isset(me.value[me.valueItem])) ?
                me.value[me.valueItem] :
                    me.value;

        return ret_val;
    },
    
    
    /**
     * Performs an unbound search for the search term (srchVal) within the options list and adds a
     * span.wui-hilight class around all matches.
     *
     * @param   {string}    srchVal    A search term
     */
    hilightText: function(srchVal) {
        var me = this,
            hilightCls = me.highlightCls,
            searchRegex = new RegExp(srchVal, "ig");

        // Removing hilighting spans
        function clearHilight(obj) {
            return $(obj).find('.' + hilightCls).each(function() {
                var parent = this.parentNode;
                parent.replaceChild(this.firstChild, this);
                parent.normalize();
            }).end();
        }
        
        // Shortcut for inserting one node after another
        function insertAfter(referenceNode, newNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
            
            return newNode;
        }

        // Adds span's within text nodes being searched
        function addHilight(node) {
            var parent = node.parentNode,
                matches = [],
                match,
                searchString = node.nodeValue,
                lastIndex = 0,
                referenceNode = node;
            
            if (node.nodeType !== 3) {
                return;
            }
            
            // Generate a list of matches
            while ((match = searchRegex.exec(searchString))) {
                matches.push(match.index, searchRegex.lastIndex);
            }
            
            if (matches.length === 0) {
                return;
            }
            else {
                matches.forEach(function(indexVal, arrayIndex) {
                    if (arrayIndex % 2 === 0) {
                        // Add plain text nodes for the spaces between the matches
                        if(indexVal != lastIndex) {
                            referenceNode = insertAfter(
                                referenceNode, 
                                document.createTextNode(searchString.slice(lastIndex, indexVal))
                            );
                        }
                        
                        // Add spans to highlight matches
                        referenceNode = insertAfter(
                            referenceNode,
                            $('<span>', {'class': hilightCls}).text(
                                searchString.slice(indexVal, matches[arrayIndex + 1])
                            )[0]
                        );
                    }
                    else {
                        lastIndex = indexVal;
                    }
                });

                // Pick up the end of the string and remove the original node
                if(lastIndex != searchString.length) {
                    insertAfter(
                        referenceNode, 
                        document.createTextNode(searchString.slice(lastIndex))
                    );
                }
                
                // we wait until the end to remove this node so we have a reference for its place
                parent.removeChild(node);
            }
        }

        // Recursive function that acts on text nodes or drills down to them to perform highlighting
        function hilightText(obj) {
            var node = (obj instanceof jQuery) ? obj[0] : obj;
            
            // There may be previous hilighting
            clearHilight(obj);

            // Previous hilighting may have split text nodes apart that belong together. Restore them:
            node.normalize();
            
            Array.prototype.forEach.call(node.childNodes, function(childNode) {
                // Act on text nodes that are not blank, else recurse
                if (childNode.nodeType == 3 && childNode.nodeValue.replace(/^\s+|\s+jQuery/g, '').length > 0) {
                    addHilight(childNode);
                }
                else if (childNode.hasChildNodes()) {
                    hilightText(childNode);
                }
            });

            return $(obj);
        }

        // We have a search string, hilight and hide stuff
        if (Wui.isset(srchVal) && $.trim(srchVal).length !== 0) {
            // Un-hide all optgroups and remove 'no results' message
            me.dd.find('.wui-optgroup-label.' + me.hiddenCls).removeClass(me.hiddenCls);
            me.dd.find('.' + me.noResultsCls).remove();
            
            me.searchHTMLText(
                srchVal,
                function(itm) { hilightText(itm).removeClass(me.hiddenCls); },
                function(itm) { clearHilight(itm).addClass(me.hiddenCls); }
            );
            
            // Clear disabled items in a search
            me.dd.children('.' + me.disabledItemCls).addClass(me.hiddenCls);
            
            // Clear any optgroups that don't have visible items in them
            me.dd.children('.wui-optgroup-label').each(function() {
                var group = $(arguments[1]);
                
                if (group.children('ul').children(':visible').length === 0) {
                    group.addClass(me.hiddenCls);
                }
            });
            
            // If there are no visible items, add the no results message as a disabled item
            if (me.dd.children(':visible').length === 0) {
                me.dd.prepend('<li class="' + me.noResultsCls + ' ' + me.disabledItemCls + '">' + me.noResultsMessage + '</li>');
            }
        }
        else {
            me.resetListHilighting();
        }
        
        Wui.positionItem(me.el, me.dd);
    },


    /**
     * Init sets variables needed for the combo and its methods to function, as well as setting
     * the initial state of the field based on configs.
     *
     * @param   {Element}   target  A DOM node, jQuery object, or selectot string for a target select 
     *                              tag on the DOM.
     */
    init: function(target) {
        var me = this;
            
        // Build the field's DOM element
        me.el = $('<div>')
            .addClass('wui-form-field')
            .append(
                me._setListeners()
            );
        
        // Combo2 will consume a select tag, an input or hidden field or will create its own hidden 
        // element with a generated or specified name for form input.
        target = $(target);
        if  (target.length === 1 && (
                target[0] instanceof HTMLSelectElement || 
                target[0] instanceof HTMLInputElement && (
                    target[0].type == 'text' || target[0].type == 'hidden'
                )
            )
        ) {
            // Puts the WUI field in place of the target on the DOM.
            me.target = target
                .after(me.el)
                .addClass(me.hiddenCls)
                .prependTo(me.el);
        }
        else {
            // Create target and Attach the combo field to a config-based location om the DOM
            me.target = $('<input type="hidden">').prependTo(me.el);
            me.addToDOM();
        }
            
        $.extend(me, {
            disabledItemCls:'wui-combo-disabled',
            
                            // Create template engine and add applicable functions.
            engine:         new wuiSmarty($.extend({html: me.template}, me.templateFn)),
            
                            // The class used for highlighting list items
            highlightCls:   'wui-highlight',
            
                            // Used to tie the drop down and focus events back to the parent field.
            idCls:          Wui.id(me.target.attr('name')),
            
                            // Class added to items, besides disabled ones, placed in the option list
            itemCls:        'wui-list-item',
            
                            // Array will contain objects that bind the Combo's data and DOM nodes.
            items:          [],
            
                            // Class for displaying no-results items
            noResultsCls:   'no-results',
            
                            // If the user didn't specify multiselect, check the underlying select.
            multiSelect:    (me.multiSelect === true || (me.target && me.target.prop('multiple') === true)),
                            
                            // Set remote configs.
            searchLocal:    (me.url === null || me.autoLoad === true),
            
                            // Set initial value.
            value:          me.hasOwnProperty('value') ? me.value : null
        });

        // Create dropdown container.
        $('body').append(
            me.dd = $('<ul>')
                .addClass('wui-combo-dd ' + me.hiddenCls + ' ' + me.ddCls)
                // Prevent the field from losing focus if a user clicks on disabled items in the list
                .on('touchend click', '.' + me.disabledItemCls, function() {
                    me.field.focus();
                })
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
        
        // Build the combo box with the proper method based on the combo's target
        if (me.target[0] instanceof HTMLSelectElement) {
            me.buildComboFromSelect();
        }
        else {
            me.buildComboFromJS();
        }
        
        // Add two-way binding with the target
        me.addTargetBinding(me.target);
        
        // Add styling, a reference to the WUI field on the select tag, and set initial value
        me.cssByParam();
        me.target[0].wuiObj = me;
        me.val(me.target.val(), false);
        
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
     * Minor Override for wuiData.loadData that adds a class to display a spinner
     */
    loadData: function() {
        var me = this;
        
        me.el.addClass('wui-loading');
        
        return wuiData.prototype.loadData.apply(me, arguments);  
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
     * Creates the items in the options list making their DOM representations through a wuiSmarty
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
            
            // Bind data for all but disabled items, add a class to identify those
            if (rec.disabled !== true) {
                itm.el.data('itm', itm).addClass(me.itemCls);
            }
            else {
                itm.el.addClass('wui-combo-disabled');
            }
            
            // Put item into optgroups if necessary 
            if (Wui.isset(rec.optgroup) && String(rec.optgroup).length !== 0) {
                if (Wui.isset(optGroups[rec.optgroup])) {
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
            .off('touchstart mousedown')
            .on('touchstart mousedown', function() { 
                me.isBlurring = false; 
            });

        // Show some feedback even with no data, or select current if it exists.
        if (me.data.length === 0) {
            me.dd.html(me.noResultsMessage);
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
     * Adds the interaction listeners for the list items onto the list.
     *
     * @param   {Boolean}   activate    Required. Determines whether to turn these events on or off.
     */
    optionListEventsActive: function(activate) {
        var me = this,
            cls = '.' + me.itemCls;
        
        // Add this listener separately because it can be turned on and off by the list scrolling
        me.optionListMouseEnter(activate);
        
        if (activate) {
            me.dd
                .on('touchstart mousedown', cls, function(event) {
                    event.stopPropagation();
                    me.isBlurring = false;
                })
                .on('touchend click', cls, function(event) {
                    // Ensure that the clicked on item is selected given that we have a delay on the
                    // mousemove event that usually adds this selection.
                    me.selectListItem($(this));
                    event.stopPropagation();
                    me.set();
                    me.close();
                })
                // Moving the mouse within the bounds of the list generally should activate this listener.
                .one('mousemove', function() {
                    me.optionListMouseEnter(true);
                });
            
            
            me.dd.children(cls).each(function() {
                $(this).bind('touchstart', function(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    me.isBlurring = false;
                });
            }); 
        }
        else {
            me.dd.off('mousemove mousedown click touchstart touchend');
            
            me.dd.children(cls).each(function() {
                $(this).unbind('touchstart');
            }); 
        }
    },
    
    
    /**
     * Handles the mouse entering and leaving options in the list.
     *
     * @param   {Boolean}   activate    Required. Determines whether to turn these events on or off.
     */
    optionListMouseEnter: function(activate) {
        var me = this,
            boundCls = 'wui-mm-bound';
        
        if (activate) {
            // Add listener after a small delay so that the mouse being present over the option 
            // list doesn't make the selection flicker or move to the wrong item because of a 
            // false 'mouseenter' event.
            me.mouseEnterListener = setTimeout(function() {
                me.addMouseEnterListener();
            }, 300);
        }else {
            if (me.mouseEnterListener) {
                clearInterval(me.mouseEnterListener);
            }
            me.dd
                .off('mousemove.wui_list_elements')
                .removeClass(boundCls)
                // put this listener back on the list in case we want to use it again
                .one('mousemove', function() {
                    me.optionListMouseEnter(true);
                });
        }
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
            
            // Change the dropdown button to a close button
            me.el.find('.drop-down-switch').addClass('open');
            
            // Clear any previous searching
            me.resetListHilighting();
            
            // Set listeners when option list is open
            me.optionListEventsActive(true);
            
            // Close the drop down when field loses focus.
            $(document).one('click:' + me.idCls,'*:not(.' +me.idCls+ ' input)', function(event) { 
                if (event.target !== me.field[0]) {
                    me.setVal(me.value);
                    me.close();
                }
            });
            
            me.sizeAndPositionDD();
            me.field.focus().select();
            me.addMouseEnterListener();
        }
    },
    
    
    /**
     * Clears hilighting on the option list so when returning to the list without searching a
     * previous search's result set doesn't mess things up.
     */
    resetListHilighting: function() {
        var me = this;
        
        // Remove 'no results' messages added by this method
        me.dd.find('.' + me.noResultsCls).remove();
        me.dd.find('.' + me.hiddenCls).removeClass(me.hiddenCls);
        me.dd.find('.' + me.highlightCls).each(function() {
            $(this).replaceWith($(this).html());
        });
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
        
        // If we are doing scroll to current, we are not using the mouse to navigate the list,
        // and the 'mouseenter' listener can mess things up in the mouse is over the option list.
        me.optionListMouseEnter(false);
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
     * @returns  {Object}           An object containing the dataList, row, and record, or undefined
     *                              if there was no matching row.
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
    
        if (!Wui.isset(selectedItm) && $.isPlainObject(me.value)) {
            selectedItm = me.selectBy(me.valueItem, me.value[me.valueItem]);
        }
       
        if (Wui.isset(selectedItm)) {
            me.set();
        }
        else {
            me.notFound();
        }
    },
    
    
    /**
     * Selects list item based on whether the current item is already selected. This selection is
     * a selection within the list, but does not necessarily set the value of the 'selected' item
     * as the value or official selection on the field.
     *
     * @param   {jQuery}    item    The jQuery wrapped DOM node of the selected item.
     */
    selectListItem: function(item) {
        var me = this;
        
        if (!Wui.isset(me.selected[0])) {
            me.itemSelect(item.data('itm'));
        }
        
        if (me.selected[0].el[0] !== item[0]) {
            me.itemSelect(item.data('itm'));
        }
    },
    

    /**
     * Overrides object change parameters so that if a select box is changed programmatically
     * that change events will still fire.
     *
     * @param   {Element}       mySelect    A select box that will have its events communicated back
     *                                      and forth to and from the Combo2 control.
     *
     * @returns {Element}       The item that was passed in.
     */
    selectObserver: function(mySelect) {
        var me = this;
        
        // Modifying the getter and setter on the selected option, allows us to know when the
        // value of the select box has been programmatically changed.
        function modifyOptionSelect(option) {
            option._selected = option.selected;
            
            Object.defineProperty(option, 'selected', {
                get: function() {
                    return option._selected;
                },
                set: function(val) {
                    option._selected = (val && (option.disabled !== true));
                    option[(option._selected ? 'setAttribute' : 'removeAttribute')]('selected', true);
                    wui_select_observer(val);
                }
            });
        }
        
        // Different browsers (Safari) will fire events in differing order, so this makes sure the
        // observer events are fired for ALL option values in the select before firing a change
        // that will update the value on the WUI control. If a change fires prematurely, the wrong
        // value will be captured by the WUI field.
        function wui_select_observer(selected) {
            var elem = mySelect[0],
                options = elem.options,
                option_length = options.length,
                option,
                i = option_length;
            
            // Mutations have occurred on the select
            if (me.target && option_length != me.total) {
                // So reload the data
                me.setData(Wui.parseSelect(me.target));
                
                // Ensure the newly created options have the get/set listener
                while(i--) {
                    option = options[i];
                    if (!Wui.isset(option._selected)) {
                        modifyOptionSelect(option);
                    }
                }
            }
            
            // Observer count keeps track of how many times the option.select:set has been run
            if (Wui.isset(elem.observer_count)) {
                elem.observer_count++;
            }
            else {
                elem.observer_count = 1;
            }
            
            // Mark that a selected element exists
            if (selected === true) {
                elem.hasSelected = true;
            }
            
            if (elem.observer_count == option_length) {
                // Only fire the change event if at least one option is selected.
                if (elem.hasSelected === true) {
                    // setTimeout necessary for operating after mutations on the select have occured.
                    setTimeout(function() {
                        // Setting selectedIndex is VITAL to the value being set properly on the
                        // select tag. When only setting the attribute on the option tag, the value
                        // doesn't always follow.
                        i = option_length;
                        while(i--) {
                            option = options[i];
                            if (option._selected) {
                                elem.selectedIndex = i;
                            }
                        }

                        mySelect.trigger('change');
                    }, 0);
                }
                else {
                    // jQuery documentation says this helps browsers behave consistently when no
                    // options are selected.
                    elem.selectedIndex = -1;
                }
                
                elem.observer_count = 0;
                elem.hasSelected = false;
            }
        }
        
        // Hack to eliminate FF caching bug: http://stackoverflow.com/questions/1479233
        mySelect.attr('autocomplete', 'off');
        
        // For standard JS type setters who will set the value attribute on the field.
        Object.defineProperty(mySelect[0], 'value', {
            get: function() {
                return $.valHooks.select.get(this);
            },
            set: function(val) {
                $.valHooks.select.set(this, val);
            }
        });
        
        mySelect.find('option').each(function(index, option) {
            modifyOptionSelect(option);
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
                me.setFieldValue(selection.rec[me.titleItem]);
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
     * @param       {String}     oldVal      The old value of the Combo2
     *
     * @returns     {jQuery}    The field object of the Combo2
     */
    setFieldValue: function(text) {
        var me = this,
            titleText = $.trim(text);
            
        text = titleText;

        if (me.value && me.value.disabled !== true && titleText.length === 0 && $.trim(me.value[me.valueItem]).length === 0) {
            titleText = 'A blank value is selected.';
        }

        me.field.val(text)
            [((titleText.length > 0) ? 'attr' : 'removeAttr')]('title', titleText);
        
        return me.field;
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
                    else if (me.forceSelect) {
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
                                me.setVal(me.value);
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
                            
                            if (!Wui.isset(me.selectTypeBuffer)) {
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
                    if (me.target && me.isBlurring === undefined) {
                        me.target.triggerHandler('focus');
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
            .on('touchstart mousedown', function(e) {
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
     * Allows the value to be set via a simple or complex value by searching the
     * available values in the options list/data set and selecting the matching
     * item.
     *
     * NOTE: Because a blank string and null are both valid options in a
     * HTMLSelectElement, calling this method with 'undefined' for sv is the ONLY
     * way to programmatically reset the field to an "un-interacted-with" state, and
     * will only do so on a field that is not consuming a select element.
     * It is important this behavior is not changed without fully understanding
     * all implications.
     *
     * @param   {*|Object}  sv  A value of any type that is then searched for in
     *                          the combo's data set. Undefined here resets the field.
     * @returns {*|Object}
     */
    setVal: function(sv) {
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
     * Works similarly to jQuery's val() method. If arguments are omitted the value of the
     * FormField will be returned. If arguments are specified the field's setVal() method and 
     * _setChanged() method are called, and the values passed in are passed through.
     *
     * @param       {any}     newVal      The type of this parameter depends on the type of form field
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
            me.setVal.apply(me, arguments);
            
            // Call change listeners
            if(arguments[1] !== false)
                me._setChanged(oldVal);
            
            // Return the passed value(s)
            return arguments;
        }
    },
    
    
    /**
     * In cases where there is not a null option in the select, make setting the Combo2 to 'null' 
     * translate to a blank string. The value of the select may be null anyway if there is no blank
     * string option in the select.
     *
     * @param   {Object|String|null}    value   Any possible setting of the combo.value.
     *
     * @returns {String|null}           A string or null value, both acceptable values in HTMLInput/SelectElements.
     */
    valueToString: function(value) {
        var me = this,
            foundItem;

        if(value === null) {
            foundItem = me.getItemBy(me.valueItem, value);
            if (!Wui.isset(foundItem)) {
                return "";
            }
            else {
                return value;
            }
        }
        else if ($.isPlainObject(value)) {
            return value[me.valueItem];
        }
        else {
            return value;
        }
    }
});

export { wuiCombo2 };