/*
 *  Copyright (c) 2012 The mraid-web-tester project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

(function(window) {

    var mraid = window.mraid = {};

    // CONSTANTS ///////////////////////////////////////////////////////////////

  var VERSIONS = mraid.VERSIONS = {
    UNKNOWN : '0.0',

    V1  : '1.0',
    V2  : '2.0'
  };

  var PLACEMENTS = mraid.PLACEMENTS = {
    UNKNOWN      : 'unknown',

    INLINE       : 'inline',
    INTERSTITIAL : 'interstitial'
  };

  var ORIENTATIONS = mraid.ORIENTATIONS = {
    NONE      : 'none',
    PORTRAIT  : 'portrait',
    LANDSCAPE : 'landscape'
  };

  var CLOSEPOSITIONS = mraid.CLOSEPOSITIONS = {
    TOPLEFT     : 'top-left',
    TOPRIGHT    : 'top-right',
    TOPCENTER	: 'top-center',
    BOTTOMLEFT  : 'bottom-left',
    BOTTOMRIGHT : 'bottom-right',
    BOTTOMCENTER: 'bottom-center',
    CENTER      : 'center'
  };

    var STATES = mraid.STATES = {
        UNKNOWN     :'unknown',

    LOADING		:'loading',
        DEFAULT     :'default',
        RESIZED     :'resized',
        EXPANDED    :'expanded',
        HIDDEN      :'hidden'
    };

    var EVENTS = mraid.EVENTS = {
        INFO                :'info',
        ORIENTATIONCHANGE   :'orientationChange',

        READY				        :'ready',
        ERROR               :'error',
        STATECHANGE         :'stateChange',
        VIEWABLECHANGE		  :'viewableChange',
        SIZECHANGE          :'sizeChange',
    };

    var FEATURES = mraid.FEATURES = {
        SMS         :'sms',
        TEL         :'tel',
        CALENDAR    :'calendar',
        STOREPICTURE:'storePicture',
        INLINEVIDEO	:'inlineVideo',
        VPAID    	:'vpaid'
    };

    // PRIVATE PROPERTIES (sdk controlled) //////////////////////////////////////////////////////

    var state = STATES.UNKNOWN;

  var placementType = PLACEMENTS.UNKNOWN;

    var size = {
        width:0,
        height:0
    };

    var defaultPosition = {
        x:0,
        y:0,
        width:0,
        height:0
    };

  var currentPosition = {
    x:0,
    y:0,
    width:0,
    height:0
  };

    var maxSize = {
        width:0,
        height:0
    };

    var expandProperties = {
    width:0,
    height:0,
    useCustomClose:false,
    isModal:true
    };

  var resizeProperties = {
    initialized: false,
    validated: false,
    width: 0,
    height: 0,
    customClosePosition: CLOSEPOSITIONS.TOPRIGHT,
    offsetX: undefined,
    offsetY: undefined,
    allowOffscreen: true
  };

  var orientationProperties = {
    allowOrientationChange: true,
    forceOrientation: ORIENTATIONS.NONE
  };

    var supports = {
        'sms':true,
        'tel':true,
        'email':true,
        'calendar':true,
        'storePicture':true,
    'inlineVideo':true,
        'orientation':true
    };

    var orientation = -1;
    var mraidVersion = VERSIONS.UNKNOWN;
    var screenSize = null;
  var isViewable = false;

    // PRIVATE PROPERTIES (internal) //////////////////////////////////////////////////////

    var intervalID = null;

    var dimensionValidators = {
        x: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            }
            return ret;
        },
        y: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            }
            return ret;
        },
        width: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            } else if (!(value >= 0)) {
                ret.value = false;
                ret.msg = 'too small';
            }
            return ret;
        },
        height: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            } else if (!(value >= 0)) {
                ret.value = false;
                ret.msg = 'too small';
            }
            return ret;
        }
    };

    var sizeValidators = {
        width: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            } else if (!(value >= 0)) {
                ret.value = false;
                ret.msg = 'too small';
            }
            return ret;
        },
        height: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            } else if (!(value >= 0)) {
                ret.value = false;
                ret.msg = 'too small';
            }
            return ret;
        }
    };

    var expandPropertyValidators = {
        isModal: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (!(value === true || value === false)) {
                ret.value = false;
                ret.msg = 'not a valid type';
            }
            return ret;
        },
        useCustomClose: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (!(value === true || value === false)) {
                ret.value = false;
                ret.msg = 'not a valid type';
            }
            return ret;
        },
        width: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            } else if (!(value >= 0)) {
                ret.value = false;
                ret.msg = 'too small';
            }
            return ret;
        },
        height: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            } else if (!(value >= 0)) {
                ret.value = false;
                ret.msg = 'too small';
            }
            return ret;
        },
        allowOrientationChange: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (!(value === true || value === false)) {
                ret.value = false;
                ret.msg = 'not a valid type';
            }
            return ret;
        },
        forceOrientation: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (!(value in ORIENTATIONS)) {
                ret.value = false;
                ret.msg = 'not a valid option';
            }
            return ret;
        }
    };

    var resizePropertyValidators = {
        width: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            } else if (!(value >= 50)) {
                ret.value = false;
                ret.msg = 'too small';
            }
            return ret;
        },
        height: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (isNaN(value)) {
                ret.value = false;
                ret.msg = 'not a number';
            } else if (!(value >= 50)) {
                ret.value = false;
                ret.msg = 'too small';
            }
            return ret;
        },
        offsetX: function (value) {
            return {'value': (!isNaN(value)), 'msg': (!isNaN(value) ? '' : 'not a number')}; 
        },
        offsetY: function (value) {
            return {'value': (!isNaN(value)), 'msg': (!isNaN(value) ? '' : 'not a number')};
        },
        allowOffscreen: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (!(value === true || value === false)) {
                ret.value = false;
                ret.msg = 'not a valid type';
            }
            return ret;
        },
        customClosePosition: function (value) {
            var ret = { 'value': true, 'msg': ''};
            for (a in CLOSEPOSITIONS) {
                if (value === CLOSEPOSITIONS[a]) {
                    return ret;; 
                }
            }
            ret.value = false;
            ret.msg = 'not a valid option';
            return ret;
        },
        initialized: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (!(value === true || value === false)) {
                ret.value = false;
                ret.msg = 'not a valid type';
            }
            return ret;
        },
        validated: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (!(value === true || value === false)) {
                ret.value = false;
                ret.msg = 'not a valid type';
            }
            return ret;
        }
    };

    var orientationPropertyValidators = {
        allowOrientationChange: function (value) {
            var ret = { 'value': true, 'msg': ''};
            if (!(typeof value === 'boolean')) {
                ret.value = false;
                ret.msg = 'not a valid type';
            }
            return ret;
        },
        forceOrientation: function (value) {
            var ret = { 'value': true, 'msg': ''};
            for (a in ORIENTATIONS) {
                if (value === ORIENTATIONS[a]) {
                    return ret;
                }
            }
            ret.value = false;
            ret.msg = 'not a valid option';
            return ret;
        }
    };

    var changeHandlers = {
        version:function(val) {
          mraidVersion = val;
        },
        placement:function(val){
          placementType = val;
        },
        state:function(val) {
            console.log('state listener. state='+state+':new='+val);
            if (state == STATES.UNKNOWN && val != STATES.UNKNOWN) {
                broadcastEvent(EVENTS.INFO, 'controller initialized');
            }
            if (state == STATES.LOADING && val != STATES.LOADING) {
                mraid.signalReady();
            } else {
                broadcastEvent(EVENTS.INFO, 'setting state to ' + stringify(val));
                state = val;
                broadcastEvent(EVENTS.STATECHANGE, state);
            }
        },
        size:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting size to ' + stringify(val));
            size = val;
            broadcastEvent(EVENTS.SIZECHANGE, size.width, size.height);
        },
        defaultPosition:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting default position to ' + stringify(val));
            defaultPosition = val;
        },
        currentPosition:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting current position to ' + stringify(val));
            currentPosition = val;
        },
        maxSize:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting maxSize to ' + stringify(val));
            maxSize = val;
        },
        expandProperties:function(val) {
            broadcastEvent(EVENTS.INFO, 'merging expandProperties with ' + stringify(val));
            for (var i in val) {
                expandProperties[i] = val[i];
            }
        },
        resizeProperties:function(val) {
            broadcastEvent(EVENTS.INFO, 'merging resizeProperties with ' + stringify(val));
            for (var i in val) {
                resizeProperties[i] = val[i];
            }
        },
        supports:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting supports to ' + stringify(val));
            supports = {};
            for (var key in FEATURES) {
                supports[FEATURES[key]] = contains(FEATURES[key], val);
            }
        },
        orientation:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting orientation to ' + stringify(val));
            orientation = val;
            broadcastEvent(EVENTS.ORIENTATIONCHANGE, orientation);
        },
        screenSize:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting screenSize to ' + stringify(val));
            screenSize = val;
            broadcastEvent(EVENTS.SCREENCHANGE, screenSize.width, screenSize.height);
        },
        isViewable:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting isViewable to ' + stringify(val));
            isViewable = val;
            if (mraid.vpaid && mraid.vpaid.ready && !mraid.vpaid.adStarted && isViewable){
                mraid.vpaid.startAd();
            }
            broadcastEvent(EVENTS.VIEWABLECHANGE, isViewable);
        },
        orientationProperties:function(val) {
            broadcastEvent(EVENTS.INFO, 'setting orientationProperties to ' + stringify(val));
            for (var i in val) {
                orientationProperties[i] = val[i];
            }
        }
    };

    var listeners = {};

    var EventListeners = function(event) {
        this.event = event;
        this.count = 0;
        var listeners = {};

        this.add = function(func) {
            var id = String(func);
            if (!listeners[id]) {
                listeners[id] = func;
                this.count++;
                if (this.count == 1) {
                    broadcastEvent(EVENTS.INFO, 'activating ' + event);
                    mraidview.activate(event);
                }
            }
        };
        this.remove = function(func) {
            var id = String(func);
            if (listeners[id]) {
                listeners[id] = null;
                delete listeners[id];
                this.count--;
                if (this.count == 0) {
                    broadcastEvent(EVENTS.INFO, 'deactivating ' + event);
                    mraidview.deactivate(event);
                }
                return true;
            } else {
                return false;
            }
        };
        this.removeAll = function() { for (var id in listeners) this.remove(listeners[id]); };
        this.broadcast = function(args) { for (var id in listeners) listeners[id].apply({}, args); };
        this.toString = function() {
            var out = [event,':'];
            for (var id in listeners) out.push('|',id,'|');
            return out.join('');
        };
    };

    // PRIVATE METHODS ////////////////////////////////////////////////////////////

    console = window.console; /* This is necessary for 2-Part Ads; otherwise, console returns null. */

    mraidview.addEventListener('change', function(properties) {
        for (var property in properties) {
            var handler = changeHandlers[property];
            console.log('for property "' + property + '" typeof handler is: ' + typeof(handler));
            handler(properties[property]);
        }
    });

    mraidview.addEventListener('error', function(message, action) {
        broadcastEvent(EVENTS.ERROR, message, action);
    });

    var clone = function(obj) {
        var f = function() {};
        f.prototype = obj;
        return new f();
    };

    var stringify = function(obj) {
        if (typeof obj == 'object') {
            if (obj.push) {
                var out = [];
                for (var p = 0; p < obj.length; p++) {
                    out.push(obj[p]);
                }
                return '[' + out.join(',') + ']';
            } else {
                var out = [];
                for (var p in obj) {
                    out.push('\''+p+'\':'+obj[p]);
                }
                return '{' + out.join(',') + '}';
            }
        } else {
            return String(obj);
        }
    };

    var valid = function(obj, validators, action, full) {
        if (full) {
            if (obj === undefined) {
                broadcastEvent(EVENTS.ERROR, 'Required object missing.', action);
                return false;
            } else {
                for (var i in validators) {
                    if (obj[i] === undefined) {
                        broadcastEvent(EVENTS.ERROR, 'Object missing required property ' + i, action);
                        return false;
                    }
                }
            }
        }
        for (var i in obj) {
            if (!validators[i]) {
                broadcastEvent(EVENTS.ERROR, 'Invalid property specified - ' + i + '.', action);
                return false;
            } else {
                var result = validators[i](obj[i]);
                if (!result.value) {
                    broadcastEvent(EVENTS.ERROR, 'Value of property ' + i + ' is ' + result.msg + '.', action);
                    return false;
                }
            }
        }
        return true;
    };

    var contains = function(value, array) {
        for (var i in array) if (array[i] == value) return true;
        return false;
    };

    var broadcastEvent = function() {
        var args = new Array(arguments.length);
        for (var i = 0; i < arguments.length; i++) args[i] = arguments[i];
        var event = args.shift();
        if (listeners[event]) listeners[event].broadcast(args);
    }

    // PUBLIC METHODS ////////////////////////////////////////////////////////////////////

    mraid.signalReady = function() {
  /* introduced in MRAIDv1 */
    broadcastEvent(EVENTS.INFO, 'START READY SIGNAL, setting state to ' + stringify(STATES.DEFAULT));
    state = STATES.DEFAULT;
    broadcastEvent(EVENTS.STATECHANGE, state);
    broadcastEvent(EVENTS.INFO, 'ready event fired');
    broadcastEvent(EVENTS.READY, 'ready event fired');
        window.clearInterval(intervalID);
    };

  mraid.getVersion = function() {
  /* introduced in MRAIDv1 */
    return (mraidVersion);
  };

    mraid.info = function(message) {
  /* not in MRAID - unique to mraid-web-tester */
        broadcastEvent(EVENTS.INFO, message);
    };

    mraid.error = function(message) {
  /* introduced in MRAIDv1 */
        broadcastEvent(EVENTS.ERROR, message);
    };

    mraid.addEventListener = function(event, listener) {
  /* introduced in MRAIDv1 */
        if (!event || !listener) {
            broadcastEvent(EVENTS.ERROR, 'Both event and listener are required.', 'addEventListener');
        } else if (!contains(event, EVENTS)) {
      broadcastEvent(EVENTS.ERROR, 'Unknown event: ' + event, 'addEventListener');
        } else {
            if (!listeners[event]) listeners[event] = new EventListeners(event);
            listeners[event].add(listener);
        }
    };

    mraid.removeEventListener = function(event, listener) {
  /* introduced in MRAIDv1 */
        if (!event) {
            broadcastEvent(EVENTS.ERROR, 'Must specify an event.', 'removeEventListener');
        } else {
            if (listener) {
                if (typeof(listeners[event]) === 'undefined') {
                    broadcastEvent(EVENTS.ERROR, 'Listener not currently registered for event: ' + event, 'removeEventListener');
                    return;
                }

                listeners[event].remove(listener);
            } else {
                listeners[event].removeAll();
            }
            if (listeners[event].count == 0) {
                listeners[event] = null;
                delete listeners[event];
            }
        }
    };

    mraid.getState = function() {
  /* introduced in MRAIDv1 */
        return state;
    };

    mraid.getPlacementType = function() {
  /* introduced in MRAIDv1 */
        return placementType;
    };

  mraid.isViewable = function() {
  /* introduced in MRAIDv1 */
    return isViewable;
  };

    mraid.open = function(URL) {
  /* introduced in MRAIDv1 */
        if (!URL) {
            broadcastEvent(EVENTS.ERROR, 'URL is required.', 'open');
        } else {
            mraidview.open(URL);
        }
    };

    mraid.expand = function(URL) {
      if (placementType === PLACEMENTS.INLINE) {
          mraidview.expand(URL);
        }
    };

    /*mraid.expand = function(dimensions, URL) {
  /* introduced in MRAIDv1 */
    /*var bOverride = true;
    if (dimensions === undefined) {
      dimensions = {width:mraid.getMaxSize(bOverride).width, height:mraid.getMaxSize(bOverride).height, x:0, y:0};
    }
        broadcastEvent(EVENTS.INFO, 'expanding to ' + stringify(dimensions));
        if (valid(dimensions, dimensionValidators, 'expand', true)) {
            mraidview.expand(dimensions, URL);
        }
    };*/

    mraid.getExpandProperties = function() {
  /* introduced in MRAIDv1 */
    var props = clone(expandProperties);
    // if (parseFloat(mraidVersion, 10) < 2) {
      // delete props.allowOrientationChange;
      // delete props.forceOrientation;
      // }
        return props;
    };

    mraid.setExpandProperties = function(properties) {
  /* introduced in MRAIDv1 */
        if (valid(properties, expandPropertyValidators, 'setExpandProperties')) {
            mraidview.setExpandProperties(properties);
        }
    };

    mraid.close = function() {
  /* introduced in MRAIDv1 */
        mraidview.close();
    };

  mraid.useCustomClose = function(useCustomCloseIndicator) {
  /* introduced in MRAIDv1 */
    mraidview.useCustomClose(useCustomCloseIndicator);
  };

    mraid.resize = function() {
  /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (resize)', 'resize');
        } else {
            if (placementType === PLACEMENTS.INLINE) {
                /* Check if resizeProperties object has been initialized && validated */
                if (!resizeProperties.initialized) {
                    broadcastEvent(EVENTS.ERROR, 'Could not resize because props not init', 'resize');
                    return false;
                }
                if (!resizeProperties.validated) {
                    broadcastEvent(EVENTS.ERROR, 'Could not resize because props not valid', 'resize');
                    return false;
                }
                mraidview.resize();
            }
        }
    };

    mraid.getResizeProperties = function() {
        /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (getResizeProperties)', 'getResizeProperties');
        } else {
            return clone(resizeProperties);
        }
        return (null);
    };

    mraid.setResizeProperties = function(properties) {
  /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (setResizeProperties)', 'setResizeProperties');
        } else {
            /* Set flag so resize() will know an attempt has been made to reset the properties. */
            resizeProperties.initialized = false;

            /* Check for required properties. */
            if (!properties.width && !resizeProperties.width) { // Is width either missing or 0?
                broadcastEvent(EVENTS.ERROR, 'Could not resize because property width is missing', 'setResizeProperties');
                return false;
            }
            if (!properties.height && !resizeProperties.height) { // Is height either missing or 0?
                broadcastEvent(EVENTS.ERROR, 'Could not resize because property height is missing', 'setResizeProperties');
                return false;
            }
            if (!properties.hasOwnProperty('offsetX') && resizeProperties.offsetX === undefined) { // Is offsetX missing?
                broadcastEvent(EVENTS.ERROR, 'Could not resize because property offsetX is missing', 'setResizeProperties');
                return false;
            }
            if (!properties.hasOwnProperty('offsetY') && resizeProperties.offsetY === undefined) { // Is offsetY missing?
                broadcastEvent(EVENTS.ERROR, 'Could not resize because property offsetY is missing', 'setResizeProperties');
                return false;
            }
            if (valid(properties, resizePropertyValidators, 'setResizeProperties')) {
                mraidview.setResizeProperties(properties);
                //resizeProperties.validated = true;
                //resizeProperties.initialized = true;
            }
        }
    };

    mraid.getCurrentPosition = function() {
    /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (getCurrentPosition)', 'getCurrentPosition');
        } else {
            return clone(currentPosition);
        }
        return (null);
    };

    mraid.getSize = function() {
    /* introduced in MRAIDv1, deprecated in MRAIDv2 */
        var pos = clone(currentPosition);
        return ({width:pos.width, height:pos.height});
    };

    mraid.getMaxSize = function(bOverride) {
    /* introduced in MRAIDv2, bOverride is an mraid-web-tester extension */
        if (!bOverride && parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (getMaxSize)', 'getMaxSize');
        } else {
            return clone(maxSize);
        }
        return (null);
    };

    mraid.getDefaultPosition = function() {
    /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (getDefaultPosition)', 'getDefaultPosition');
        } else {
            return clone(defaultPosition);
        }
        return (null);
    };

    mraid.getScreenSize = function() {
    /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (getScreenSize)', 'getScreenSize');
        } else {
            return clone(screenSize);
        }
        return (null);
    };

    mraid.supports = function(feature) {
    /* introduced in MRAIDv2 */
        broadcastEvent(EVENTS.INFO, "Ad calling mraid.supports(" + feature + ")");
        var bSupports = false;
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (supports)', 'supports');
        } else {
            bSupports = supports[feature];
        }
        return (bSupports);
    };

    mraid.storePicture = function(url) {
    /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (storePicture)', 'storePicture');
        } else {
            if (!supports[FEATURES.STOREPICTURE]) {
                broadcastEvent(EVENTS.ERROR, 'Method not supported by this client. (storePicture)', 'storePicture');
            } else if (!url || typeof url !== 'string') {
                broadcastEvent(EVENTS.ERROR, 'Valid url required. (storePicture)', 'storePicture');
            } else {
                mraidview.storePicture(url);
            }
        }
    };

    mraid.createCalendarEvent = function(params) {
    /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (createCalendarEvent)', 'createCalendarEvent');
        } else {
            if (!supports[FEATURES.CALENDAR]) {
                broadcastEvent(EVENTS.ERROR, 'Method not supported by this client. (createCalendarEvent)', 'createCalendarEvent');
            } else if (!params || typeof params != 'object') {
                broadcastEvent(EVENTS.ERROR, 'Valid params required.', 'createCalendarEvent');
            } else {
                mraidview.createCalendarEvent(params);
            }
        }
    };

    mraid.initVpaid = function(vpaidObject){
        /* introduced in MRAIDv2 Video Addendum v1*/
        var script = document.createElement('script');
        script.src = 'mraid-vpaid.js';
        script.onload = function(e) {
            mraid.vpaid = mraidVpaid(vpaidObject, mraid.vpaidEventHandler);
            if (mraid.isViewable()) {
                mraid.vpaid.startAd();
            }
        };
        document.head.appendChild(script);
    };

    mraid.vpaidEventHandler = function(event){
        switch (event){
            case 'AdError' :
                // Handle VPAID AdError event here
                break
            // case : Add other event to be handled here
            default:
                broadcastEvent(EVENTS.INFO, "VPAID Event : " + event);
                break;
        }
    };

    mraid.playVideo = function(url) {
    /* introduced in MRAIDv2 */
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (playVideo)', 'playVideo');
        } else {
            if (supports[FEATURES.INLINEVIDEO]) {
                broadcastEvent(EVENTS.INFO, 'Inline video is available but playVideo uses native player.');
            }
            if (!url || typeof url != 'string') {
                broadcastEvent(EVENTS.ERROR, 'Valid url required.', 'playVideo');
            } else {
                mraidview.playVideo(url);
            }
        }
    };

    mraid.getOrientation = function() {
    /* not in MRAID - unique to mraid-web-tester */
        if (!supports[FEATURES.ORIENTATION]) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this client. (getOrientation)', 'getOrientation');
        }
        return orientation;
    };

    mraid.setOrientationProperties = function (properties) {
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (setOrientationProperties)', 'setOrientationProperties');
        } else {
            if (valid(properties, orientationPropertyValidators, 'setOrientationProperties')) {
                mraidview.setOrientationProperties(properties);
            }
        }
    };

    mraid.getOrientationProperties = function () {
        if (parseFloat(mraidVersion, 10) < 2) {
            broadcastEvent(EVENTS.ERROR, 'Method not supported by this version. (getOrientationProperties)', 'getOrientationProperties');
        } else {
            return clone(orientationProperties);
        }
        return (null);
    };
})(window);
