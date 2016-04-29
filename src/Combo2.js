/**
 * Combo2 - A WUI-based control
 * =================================================================================================
 * (a combination of a select and an autocomplete)
 *
 * 
 * Functionality
 * -------------
 *
 * - Combo requires valueItem and titleItem attributes. 
 *     - If consuming a `<select>` off the DOM (see below), these values will be set automatically
 *       to 'value' for valueItem, and 'title' for titleItem.
 *     - By default, these will automatically create a template of '<li>{titleItem}</li>'
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
 *         - If the options list is closed, enter has no effect.
 *     - Escape
 *         - Sets the value of the field back to its previous value, and closes the options list 
 *           if it's open.
 *     - Any other typing will cause a search of the options list.
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
        attr:   {},

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
        }).addClass('wui-datalist-search'),
        
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
        search_threshold: 0,
        
        // An array of the currently selected records
        selected: [],
        
        // Determines whether to show the arrow button (that toggles the option list). A false 
        // value and makes the Combo appear more like an autocomplete field.
        showOpenButton: true,
        
        // The HTML template that the data will fit into. Null value will cause an error to be 
        // thrown. Specification required.
        template:   null,
        
        // Object containing functions that will be utilized by a specified template. These functions
        // become members of Combo2.engine.
        templateFn: {},

        // The name of the part of the data containing the value that will be shown to the user.
        // For example: if the data is US states: [{state_id: 1, state_name:"Alabama"}, ...]
        // the titleItem will be 'state_name'. titleItem is REQUIRED.
        titleItem:  null,

        // The value part of the data that will be used/stored by the program.
        // For example: if the data is US states: [{state_id: 1, state_name:"Alabama"}, ...]
        // the valueItem will be 'state_id'. valueItem is REQUIRED.
        valueItem:  null
    }, args, {
        // Determies whether multiple selections can be made. At this time, on this control, 
        // multiselect is not available.
        // TODO: (sn) When adding the ability to consume <select> fields, if the select is a multiple,
        // bring in the Wui.Multiple
        multiSelect:false
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
    argsByParam:function() { //(altAttr, altTarget) {
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
                    me.hidden_field.attr(html_attr, attributeVal);
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
        me.selectTag = me.selectObserver($(select));
        
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
     * Closes the drop-down menu and restores the body to whatever scroll state it was in previously.
     */
    close: function() { 
        var me = this,
            body,
            scrollTop;
            
        if (me._open === true) {
            body = $('body');
            scrollTop = parseInt(body.css('top'));
            
            body.removeClass('wui-combo-no-scroll').css('top','');
            $(window).scrollTop(-scrollTop);
            
            me._open = false;
            me.dd.addClass(me.hiddenCls);
            
            // Only reselect the field in the instance that the close options list button was pressed.
            if (me.isBlurring !== undefined) {
                me.isBlurring = true;
                me.field.select();
                
            }
        }
    },
    
    
    /**
     * Clears the selection on the data list
     */
    clearSelect: function() {
        var me = this;

        me.dd.find('.wui-selected').removeClass('wui-selected');
        me.selected = [];
        me.el.trigger($.Event('wuichange'), [me, me.el, {}, me.selected]);
    },
    
    
    /**
     * Creates the button for toggling the options list based on the value of the Combo's `showDD` property
     */
    createOptionListToggle: function() {
        var me = this,
            retBtn;

        if (me.showOpenButton) {
            retBtn = $('<button>', {
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
     * @param   {boolean}   ascending   Whether the loop happens in ascending or descending order. Defaults to true.
     *
     * @returns {boolean}   True if the items array exists
     */
    each: function(fn, ascending) {
        var me = this,
            i = 0;

        if (!$.isArray(me.items)) {
            return false;
        }

        // ascending
        if ((ascending !== false)) {
            for (i; i < me.items.length; i++) {
                if(fn(me.items[i],i) === false) {
                    break;
                }
            }
        }

        // descending
        else {
            for (i = me.items.length; i >= 0; i--) {
                if(fn(me.items[i], i) === false) {
                    break;
                }
            }
        }

        return true;
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
     * Performs an unbound search for the search term (srchVal) within the options list and adds a span.wui-hilight
     * class around all matches.
     *
     * @param   {string}    srchVal    A search term
     */
    hilightText: function(srchVal) {
        var me = this;

        function clearHilight(obj) {
            return obj.find('.wui-highlight').each(function() {
                $(this).replaceWith($(this).html());
            }).end();
        }

        function hilightText(obj){
            clearHilight(obj);

            // Recurse so we're only acting on leaf nodes and don't mess up the template
            if (obj.children().length) {
                obj.children(':not(.wui-datalist-disabled):visible').each(function() {
                    hilightText($(this));
                });
            }
            else {
                obj.html(
                    obj.text().replace( new RegExp(srchVal, "ig"), function(m){
                        return '<span class="wui-highlight">' +m+ '</span>';
                    })
                );
            }

            return obj;
        }

        if (srchVal.length !== 0) {
            me.dd.children(':not(.wui-datalist-disabled)').each(function() {
                var itm = $(arguments[1]);

                // Search only visible text here (rather than regex'ing on the html) so we only get visible items
                if(itm.text().toUpperCase().indexOf(srchVal.toUpperCase()) >= 0) {
                    hilightText(itm).removeClass(me.hiddenCls);
                }
                else {
                    clearHilight(itm).addClass(me.hiddenCls);
                }
            });
            me.dd.children('.wui-datalist-disabled').addClass(me.hiddenCls);
        }
        else {
            me.dd.children().each(function() {
                var itm = $(arguments[1]);
                
                clearHilight(itm).removeClass(me.hiddenCls);
            });
        }
        
        Wui.positionItem(me.el, me.dd);
    },


    /**
     * Init will setup the control and fires the methods that will get data and create the options list
     *
     * @param   {Node}  target  A DOM node, jQuery object, or selectot string for a target item on the DOM
     */
    init: function(target) {
        var me = this;
            
        // Create template engine and add applicable functions
        me.engine = new Wui.Smarty($.extend({html: me.template}, me.templateFn));
        
        // Set remote configs
        me.searchLocal = (me.url === null || me.autoLoad === true);

        // Set initial value
        me.value = me.hasOwnProperty('value') ? me.value : null;
            
        // Build the field
        me.el = $('<div>').addClass('wui-form-field').append(
            me._setListeners()
        );
        me.setPlaceholder(me.placeholder);
        
        // Add drop down button
        me.el.append(
            me.createOptionListToggle()    
        );
        
        // Create dropdown container.
        $('body').append(
            me.dd = $('<ul>').addClass('wui-combo-dd ' + me.hiddenCls + ' ' + me.ddCls)
        );
        
        // Attach the combo to a specified target
        if (typeof target != 'undefined') {
            target = $(target);

            me.idCls = Wui.id(target.attr('name'));

            // Hide select box and replace it with the Combo2. Apply styles.
            me.hidden_field = target.after(me.el).addClass(me.hiddenCls).prependTo(me.el);
            me.attachToElement(target);
            me.cssByParam();
            
            // Default data model returned from Wui.parseOptions();
            me.valueItem =  'value';
            me.titleItem =  'label';
            
            // If the user hasn't defined a template, provide a default
            if (!me.template) {
                me.engine.html = me.template = '<li>{label}</li>';
            }
            
            me.setData(Wui.parseSelect(target));
            
            // Set value of Wui field to selected value
            me.val(target.val(), false);
        }
    
        // Attach the target to a config based location
        else {
            // Create template if one hasn't been defined
            if (!(me.hasOwnProperty('template') && me.template !== null && me.template !== undefined) &&
                me.hasOwnProperty('valueItem') &&
                me.hasOwnProperty('titleItem') &&
                me.valueItem &&
                me.titleItem
            ) {
                me.engine.html = me.template = '<li>{' +me.titleItem+ '}</li>';
            }

            // Ensure that all required items are present
            if (!me.template) {
                throw new Error('Wui.js - valueItem and titleItem, or template, are required configs for a Combo.');
            }

            me.idCls = Wui.id();
            me.addToDOM();

            // Loads data per the method appropriate for the config object
            this.getSrcData();
        }

        me.el.addClass('wui-combo ' + me.idCls);
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
     * Creates the items in the options list making their DOM representations through a Wui.Smarty template, and
     * associating the data with those nodes.
     *
     * @returns     {Number}    The number of items that were created
     */
    make: function() {
        var me = this,
            holder = $('<div>'),
            selectedItm;

        // Clear out items list
        me.items = [];

        // Show data in list, Add items to me.items
        me.data.forEach(function(rec) {
            var disabled = (rec.disabled === true),
                itm = {
                    el: $(me.engine.make(rec)),
                    rec: rec
                };

            me.items.push(itm);

            holder.append(
                itm.el
                    .data('itm', itm)
                    .bind('touchstart', function() {
                        if (!disabled) {
                            me.itemSelect($(this).data('itm'));
                            me.isBlurring = false;
                        }
                    })
                    .on({
                        mouseenter: (!disabled) ? function(){ 
                                        me.itemSelect($(this).data('itm')); 
                                    } : function(){},
                                    
                        mousedown:  (!disabled) ? function(){ 
                                        me.isBlurring = false; 
                                    } : function(){},
                        click:      (!disabled) ? function(){ 
                                        me.set(); 
                                        me.field.select();
                                        me.close();
                                    } : function(){}
                    })
                    .addClass((disabled) ? 'wui-datalist-disabled' : '')
            );
        });

        // Clear out items on the DOM and add new
        me.dd.empty().removeClass('wui-spinner').append(holder.children().unwrap());

        // Show some feedback even with no data
        if (me.data.length === 0) {
            me.dd.html(me.emptyMsg);
        }

        // Make sure clicking on the drop down doesn't close it
        me.dd.off('mousedown').on('mousedown', function() { 
            me.isBlurring = false; 
        });


        // Select a pre-applied value if it exists
        if (me.value && me.field.val().length === 0) {
            selectedItm = me.selectBy(me.valueItem, me.value);
        }
    
        if (!selectedItm && $.isPlainObject(me.value)) {
            selectedItm = me.selectBy(me.valueItem, me.value[me.valueItem]);
        }
       
        if (selectedItm) {
            me.set();
        }


        // Necessary here because remote queries will remake the list with every keystroke and
        // will change the size/position of the options list.
        me.adjustDropDownSize();
        
        // Perform local hilighting
        if(me.previous && me.previous.length) {
            me.hilightText(me.previous);
        }

        return me.items.length;
    },

    
    /**
     * Opens the drop down and resizes the dropdown accordingly based on whether there are existing CSS rules.
     */
    open: function(){
        var me = this;    

        if (!me._open) {
            me._open = true;
            
            // Use $(window).scrollTop because $(body) scrolltop doesn't work in IE8
            $('body').css('top', $(window).scrollTop() * -1).addClass('wui-combo-no-scroll');

            // Clear the drop down when it loses focus
            $(document).one('click:' + me.idCls,'*:not(.' +me.idCls+ ' input)', function(event) { 
                if (event.target !== me.field[0]) {
                    me.setVal(me.value);
                    me.close();
                }
            });
            
            // Hide drop down while we resize and position it
            me.dd.css({visibility: 'hidden'}).removeClass(me.hiddenCls);
            
            me.adjustDropDownSize();

            Wui.positionItem(me.el, me.dd);
            me.dd.css('visibility', '');
            
            if ($.isPlainObject(me.value)) {
                me.getItemBy(me.valueItem, me.value[me.valueItem]);
            }
            
            me.field.select();
            me.scrollToCurrent();   
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
            }
            else {
                me.field.attr('placeholder', selection.rec[me.titleItem]);
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

        /**
         * Selects the list item immediately before or after the currently selected item, works on the filtered
         * visibility if the drop down is open.
         *
         * @param       {Number}    dir     Direction to go to select an ajacent value [1, -1]
         *
         * @returns     {Object}    The selected item
         */
        function selectAjacent(dir) {
            var selector = ':visible:not(.wui-datalist-disabled)',
                theEnd = (dir === 1) ? ':first' : ':last',
                fn = (dir === 1) ? 'nextAll' : 'prevAll',
                el = me.selected.length ? me.selected[0].el[fn](selector + ':first') : me.dd.children(selector+theEnd),
                itm = me.selected[0];

            itm = me.selectByEl(el);
            
            // If itm is not a Wui object, we're likely on an edge. Go to the other end of the list.
            if (!$.isPlainObject(itm)) {
                itm = me.selectByEl(me.dd.children(selector + theEnd));
            }
        }
        
        /**
         * Searches locally within the drop-down's data for the srchVal, otherwise if searchLocal is false,
         * the data is searched remotely.
         */
        function searchData() {
            var srchVal = me.field[0].value,
                oldSearch = me.previous || undefined,
                srchParams = {};

            me.previous = srchVal;
            if (me.searchLocal && me.total >= me.search_threshold) {
                me.hilightText(srchVal);
            }
            else {
                me.clearSelect();
                
                if ((srchVal.length >= me.minKeys || srchVal.length === 0) && me.previous != oldSearch) {
                    if (srchVal.length === 0) {
                        me.val(null);
                    }

                    me.dd.addClass('wui-spinner');
                    srchParams[me.searchArgName] = srchVal;
                    me.loadData(srchParams);
                }
            }
        }
                    
        return me.field
            .on('keydown', function(event) {
                event.stopPropagation();
                
                // So shift-tabbing out of a field and going back to it doesn't result in the 
                // field being needlessly filtered
                if (event.keyCode == keys.SHIFT) {
                    return false;
                }
                
                // So tabbing off of the field will select the last selected option and not get
                // confused by the mouse hovering over an item
                if (event.keyCode == keys.TAB) {
                    if (!me._open) {
                        me.set();
                    }
                }
                else {
                    // Open drop down on any keypress that isn't tab
                    if (event.keyCode != keys.SHIFT) {
                        me.open();
                    }
                    
                    if ($.inArray(event.keyCode,[keys.DOWN, keys.UP, keys.ENTER, keys.ESC]) != -1) {
                        event.preventDefault();
                        me.can_search = false;
                        
                        switch (event.keyCode) {
                            case keys.DOWN:
                                selectAjacent(1);
                                break;
                            case keys.UP:
                                selectAjacent(-1);
                                break;
                            case keys.ENTER:
                                me.set();
                                break;
                            case keys.ESC:
                                me.close();
                                break;
                        }
                    }
                    else {
                        // for ie8's lack of 'input' support
                        me.can_search = true;
                    }
                }
            })
            .on('keyup', function(event) {
                event.stopPropagation();
                
                if (event.keyCode == keys.ENTER) {  // enter
                    event.preventDefault(); 
                    me.set();
                }
                
                if (me.can_search && $.inArray(event.keyCode,[keys.TAB, keys.SHIFT]) == -1) {
                    searchData();
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
     * Returns only the simple value of an item.
     */
    getVal: function(){
        var me = this,
            ret_val = ($.isPlainObject(me.value) && typeof me.value[me.valueItem] != 'undefined') ?
                me.value[me.valueItem] :
                    me.value;

        return ret_val;
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
    },
    

    getSrcData: function(){
        var me = this;
        
        if(me.initLoaded !== true && (me.data instanceof Array) && me.data.length > 0) {
            me.setParams(me.params);
            me.initLoaded = true;

            return me.setData(me.data);
        }else{
            if(me.autoLoad){
                if (this.url !== null) {
                    return me.loadData();
                }
                else {
                    return me.setData(me.data);
                }
            }
        }
    }
});