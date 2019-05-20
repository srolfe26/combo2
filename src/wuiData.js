import "./import-jquery";
import { Wui } from './core-methods';

/**
 * WUI Data
 * =================================================================================================
 * The WUI Data Object is for handling data whether remote or local. It will fire namespaced events
 * that can be used by an application, and provides a uniform framework for working with data.
 * 
 * If data is remote, wuiData is an additional wrapper around the jQuery AJAX method and provides
 * for pre-processing data. Data can be pushed and spliced into/out of the object and events will be
 * fired accordingly.
 *
 * @class wuiData
 *
 * @author  Stephen Nielsen (rolfe.nielsen@gmail.com)
 *
 * @fires   wuiData#datachanged
 *
 * @param   {Object}    configs             An object for setting up how wuiData will behave
 * @param   {Array}     [configs.data]      Array of data that will be stored in the object. Can be
 *                                          specified for the object or loaded remotely.
 * @param   {string}    [configs.name]      Name of the data object. Allows the object to be
 *                                          identified in the listeners, and namespaces events.
 * @param   {object}    [configs.params]    Object containing keys that will be passed remotely each time.
 * @param   {string}    [configs.url]       URL of the remote resource from which to obtain data.
 *                                          A null URL will assume a local data definition.
 * @param   {object}    [configs.ajaxConfig] Special configuration of the ajax method. Defaults are:
 *
 *                                          {
 *                                              data:       me.params,
 *                                              dataType:   'json',
 *                                              success:    function(r){ me.success.call(me,r); },
 *                                              error:      function(e){ me.failure.call(me,e); }
 *                                          }
 *
 * @param   {number}    [configs.total=0]   The total number of records contained in the data object.
 *                                          This will be calculated if not provided.
 */
const wuiData = function(configs) {
    $.extend(this, {
        ajaxConfig: {},
        data: [],
        name:  null,
        params: {},
        total: 0,
        url:  null
    }, configs);
};

wuiData.prototype = {
    /**
     * Fires after data is set. Meant to be overridden. See loadData().
     *
     * @param   {Array}     data    The value of the data config of the current object
     */
    afterSet: function() {},


    /**
     * Event hook that will allow for the setting of the params config before loadData
     * performs a remote call. Meant to be overridden. See loadData(). If this function returns
     * false, load data will not make a remote call.
     */
    beforeLoad: function() {},


    /**
     * Fires after the remote call but before data is set on the object. Meant to be
     * overridden. See loadData().
     * @param   {Array}     data    Data to be set on the object
     */
    beforeSet: function() {},


    /**
     * Used for when data is changed. Meant to be overridden. See loadData(). Functional equivalent
     * to the custom jQuery event that is fired with the same name ('datachanged').
     *
     * @param   {Array}     newData    Array of the new data
     */
    dataChanged: function() {},


    /**
     * An object in the remote response actually containing the data.
     * Best set modifying the prototype eg. wuiData.prototype.dataContainer = 'payload';
     */
    dataContainer:  null,


    /**
     * The passed in function gets called with two parameters the item, and the item's index.
     * 
     * @param   {Function}  fn      A function that gets called for each item in the object's data array
     * 
     * @returns {Boolean}   Returns true.
     */
    dataEach: function(fn) {
        for(var i = 0; i < this.data.length; i++) {
            if(fn(this.data[i],i) === false) {
                break;
            }
        }
        
        return true;
    },


    /**
     * Runs when loadData() fails.
     */
    failure: function(e) {
        this.onFailure(e);
    },


    /**
     * First calls the dataChanged event hook function, then fires the 'datachanged' custom event,
     * then calls the afterSet() event hook.
     */
    fireDataChanged: function() {
        var me = this, dn = (me.name || 'w121-data');

        me.dataChanged(me.data);

        /**
         * Data Changed Event
         *
         * @event   wuiData#datachanged
         *
         * @type        {object}
         *
         * @property    {object}    event   The jQuery event wrapper and details.
         * @property    {string}    dn      The name property from the object config uniquely
         *                                  identifying this object.
         * @property    {wuiData}  obj     This data object that will contain all updated properties.
         */
        $(document)
            .trigger($.Event('datachanged.' + dn),[dn, me])
            .trigger($.Event('datachanged'),[dn, me]);

        me.afterSet(me.data);
    },


    /**
     * Performs a remote call and aborts previous requests from this data object.
     * Between loadData(), success() and setData() fires several event hooks in this order:
     * 
     * 1. setParams()
     * 2. beforeLoad()
     * 3. onSuccess()
     * 4. beforeSet()
     * 5. processData()
     * 6. dataChanged()
     * -  'datachanged' event is fired
     * 7. afterSet()
     * 
     * Upon failure will fire onFailure()
     */
    loadData: function() {
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
     * Allows for the setting of the params config before loadData performs a remote
     * call. Meant to be overridden. See loadData().
     */
    onFailure: function() {},


    /**
     * Allows for the setting of the params config before loadData performs a remote
     * call. Meant to be overridden. See loadData().
     *
     * @param    {Object|Array}  response    Response from the server in JSON format
     */
    onSuccess: function() {},


    /**
     * Allows for pre-processing of the data before it is taken into the data object. Meant to be
     * overridden, otherwise will act as a pass-through. See loadData().
     *
     * @param   {Array}     response    Data to be processed.
     *
     * @returns {Array}     Unless overridden in an instance to modify the data, the default just
     *                      returns whatever is passed in.
     */
    processData: function(response) {
        return response;
    },


    /**
     * Same as Array.push() but acting on the data array of the object.
     *
     * @param   {Object}    [obj__]     One or more objects to be added to the end of the parent
     *                                  object's items array
     *
     * @returns {Number}    The new length of the array
     */
    push: function() {
        var retVal = Array.prototype.push.apply(this.data || (this.data = []), arguments);

        this.total = this.data.length;
        this.fireDataChanged();

        return retVal;
    },


    /**
     * Can be used as is to set parameters before an AJAX load, or it can also be used as an event 
     * hook and overridden. This method is called from loadData with its arguments passed on, so 
     * arguments passed to load data will be sent here. See loadData(). If this function returns 
     * false, load data will not make a remote call.
     * 
     * @param   {Object}    params      Params to be set
     */
    setParams: function(params) {
        if(params && typeof params === 'object') {
            $.extend(this.params, params);
        }
    },


    /**
     * Can be called to set data locally or called by loadData(). Fires a number of events and 
     * event hooks. See loadData().
     *
     * @param   {Array}     d   Data to be set on the ojbect
     * @param   {Number}    [t] Total number of records in the data set. If not specified setData 
     *                          will count the data set.
     */
    setData: function(d, t) {
        var me = this;
        
        // Event hook for before the data is set
        me.beforeSet(d);
        
        // Set the data
        me.data = me.processData(d);
        me.total = ($.isNumeric(t)) ? t : (me.data) ? me.data.length : 0;
        
        me.fireDataChanged();
    },


    /**
     * Same as Array.splice() but acting on the data array of the object.
     *
     * @param   {Number}    idx         Position to start making changes in the items array.
     * @param   {Number}    howMany     Number of elements to remove.
     * @param   {Object}    [obj__]     One or more objects to be added to the array at position idx
     *
     * @returns {Array}     An array of the removed objects, or an empty array.
     */
    splice: function() {
        var retVal = Array.prototype.splice.apply(this.data || (this.data = []), arguments);

        this.total = this.data.length;
        this.fireDataChanged();

        return retVal;
    },


    /**
    * Runs when loadData() successfully completes a remote call.
    * Gets data straight or gets it out of the dataContainer and totalContainer.
    *
    * Calls setData() passing the response and total.
    *
    * @param    {Object|Array}  response    Response from the server in JSON format
    */
    success: function(response) {
        var me = this,
            unwrapped = Wui.unwrapData.call(me, response);
        
        me.onSuccess(response);
        me.setData(unwrapped.data, unwrapped.total);
    },


    /**
     * An object in the remote response specifying the total number of records. Setting this
     * feature will override the Data object's counting the data. Best set modifying the
     * prototype eg. wuiData.prototype.totalContainer = 'total';
     */
    totalContainer: null
};

export { wuiData };