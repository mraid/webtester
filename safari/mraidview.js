/*
 *  Copyright (c) 2012 The mraid-web-tester project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */


 /*
  * Code flow is
  * (0) prepareMraidView initializes version and "supports" properties
INFO MRAID version 2.0
INFO placement type inline
INFO [sms,tel,calendar,storePicture,inlineVideo]
  * (1) buttons on interface call renderAd()  - Flight tab>ad fragment or renderHtmlAd - Flight tab>ad url
INFO rendering
INFO creating adWindow
  *   (.) onload event of new browser window
INFO adWindow loaded
  * (2) render() calls initAdFrame()
INFO initializing ad frame
  * (3) initAdFrame() calls initAdBridge() and loadHtml()
INFO initializing bridge object [object Object]
  * (4) initAdBridge() calls
  *   (a) EventListeners.add for info reporting
INFO activating info
  *   (b) EventListeners.add for error reporting
INFO activating error
  *   (c) pushChange() for initialization of all other properties
INFO controller initialized
INFO setting state to loading
INFO setting screenSize to {'width':320,'height':480}
INFO setting orientation to 0
INFO setting size to {'width':320,'height':50}
INFO setting default position to {'width':320,'height':50,'y':0,'x':0}
INFO setting maxSize to {'width':320,'height':480}
INFO merging expandProperties with {'width':0,'height':0,'useCustomClose':false,'isModal':false}
INFO setting supports to [screen]

  * (5) pushChange() calls the addEventListener() method in mraid-main.js
  * (6) addEventListener() calls changeHandlers.[listener]
  * (7) changeHandlers.state() through signalReady, send ready event
INFO activating ready
  * (8) identification script loaded
INFO mraid.js identification script found
  */

(function() {
    var mraidview = window.mraidview = {};

    // CONSTANTS ///////////////////////////////////////////////////////////////

    var VERSIONS = mraidview.VERSIONS = {
        V1  : '1.0',
        V2  : '2.0'
    };

    var PLACEMENTS = mraidview.PLACEMENTS = {
        UNKNOWN      : 'unknown',

        INLINE       : 'inline',
        INTERSTITIAL : 'interstitial'
    }

    var STATES = mraidview.STATES = {
        UNKNOWN     :'unknown',

        LOADING     :'loading',
        DEFAULT     :'default',
        RESIZED     :'resized',
        EXPANDED    :'expanded',
        HIDDEN      :'hidden'
    };

    var EVENTS = mraidview.EVENTS = {
        INFO                :'info',
        ORIENTATIONCHANGE   :'orientationChange',

        READY               :'ready',
        ERROR               :'error',
        STATECHANGE         :'stateChange',
        VIEWABLECHANGE      :'viewableChange',
        SIZECHANGE          :'sizeChange',
    };

    var FEATURES = mraidview.FEATURES = {
        SMS         :'sms',
        TEL         :'tel',
        CALENDAR    :'calendar',
        STOREPICTURE:'storePicture',
        INLINEVIDEO :'inlineVideo',
        VPAID       :'vpaid'
    };

    // EVENT HANDLING ///////////////////////////////////////////////////////////////

    var listeners = {};

    var broadcastEvent = function() {
        var args = new Array(arguments.length);
        for (var i = 0; i < arguments.length; i++) args[i] = arguments[i];

        var event = args.shift();

        for (var key in listeners[event]) {
            var handler = listeners[event][key];
            handler.func.apply(handler.func.scope, args);
        }
    }

    mraidview.broadcastEvent = broadcastEvent;

    mraidview.addEventListener = function(event, listener, scope) {
        var key = String(listener) + String(scope);
        var map = listeners[event]
        if (!map) {
            map = {};
            listeners[event] = map;
        }
        map[key] = {scope:(scope?scope:{}),func:listener};
    };

    mraidview.removeEventListener = function(event, listener, scope) {
        var key = String(listener) + String(scope);
        var map = listeners[event];
        if (map) {
            map[key] = null;
            delete map[key];
        }
    };

    // PRIVATE VARIABLES ///////////////////////////////////////////////////////////////

    var adURI = "";
    var adURIFragment = true;
    var adHtml = '';
    var useHtml = false;
    var adContent = '';
    var adWindow = null;
    var adWindowAdj = {
        x: 0,
        y: 0
    };
    var adFrame = null;
    var adFrameExpanded = null;
    var adContainer = null;
    var adResizeContainer = null;
    var adExpandedContainer = null;
    var closeEventRegion = null;
    var adBridge = null;
    var adController = null;
    var inactiveAdBridge = null;
    var inactiveAdController = null;
    var intervalID = null;
    var timeoutID = null;
    var active = {};
    var previousPosition = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    var previousState = null;
    var defaultWindowSize = null;
    var adContainerOrientation = -1;
    var counter = 10;

    // MRAID state variables - shared with frame
    var state = STATES.LOADING;
    var screenSize = {
        width: 0,
        height: 0
    };
    var size = {
        width: 0,
        height: 0
    };
    var defaultPosition = {
        width: 0,
        height: 0,
        y: 0,
        x: 0
    };
    var c = {
        width: 0,
        height: 0,
        y: 0,
        x: 0
    };
    var maxSize = {
        width: 0,
        height: 0,
        x: 0,
        y: 0
    };
    var expandProperties = {
        width: 0,
        height: 0,
        useCustomClose: false,
        isModal: false
    };
    var orientationProperties = {
        allowOrientationChange: true,
        forceOrientation: 'none'
    };
    var resizeProperties = {
        initialized: false,
        validated: false,
        width: 0,
        height: 0,
        customClosePosition: 'top-right',
        offsetX: undefined,
        offsetY: undefined,
        allowOffscreen: true
    };
    var supports = [];
    var version = VERSIONS.UNKNOWN;
    var placement = PLACEMENTS.UNKNOWN;
    var isViewable = false;
    var orientation = -1;

    // PUBLIC ACCESSOR METHODS ///////////////////////////////////////////////////////////////

    mraidview.getAdContent = function() {
        return adContent;
    };

    mraidview.setScreenSize = function(width, height) {
        screenSize.width = width;
        screenSize.height = height;
        orientation = (width >= height) ? 90 : 0;
        adContainerOrientation = orientation;
    };

    mraidview.setDefaultPosition = function(x, y, width, height) {
        defaultPosition.x = parseInt(x);
        defaultPosition.y = parseInt(y);
        defaultPosition.width = parseInt(width);
        defaultPosition.height = parseInt(height);
        currentPosition = defaultPosition;
    };

    mraidview.setMaxAdPosition= function(x, y, width, height) {
        maxSize.x = x;
        maxSize.y = y;
        if (orientation % 180 === 0) {
            maxSize.width = width;
            maxSize.height = height;
        } else {
            maxSize.width = height;
            maxSize.height = width;
        }
    };

    mraidview.setAdURI = function(uri, fragment) {
        adURI = uri;
        adURIFragment = (fragment) ? true : false;
    };

    mraidview.setUseHtml = function(useThisHtml, html) {
        useHtml = useThisHtml;
        if (useHtml) {
            adHtml = html;
        } else {
            adHtml = '';
        }
    };

    mraidview.resetSupports = function() {
        supports = [];
    };

    mraidview.setSupports = function(feature, doesSupport) {
        if (doesSupport) {
            supports.push(feature);
            broadcastEvent(EVENTS.INFO, stringify(supports));
        }
    };

    mraidview.setVersion = function(value) {
        mraidview.version = value;
        broadcastEvent(EVENTS.INFO, 'MRAID version ' + value);
    };

    mraidview.setPlacement = function(value) {
        placement = mraidview.placement = value;
        broadcastEvent(EVENTS.INFO, 'placement type ' + value);
    };

    mraidview.setOffScreen  = function(value) {
        offscreen = value;
    };

    mraidview.rotateOrientation = function() {
        mraidview.setOrientation(orientation = (orientation + 90) % 180);
    };

    mraidview.setOrientation = function (degree, forceOrientation) {
        if (degree % 90 !== 0) return;
        if (!adWindow || !adWindow.document) return;
        var body = adWindow.document.getElementsByTagName('body')[0];
        var maxDiv = adWindow.document.getElementById('maxArea');

        maxDiv.style['-webkit-transform'] = '';

        if (degree % 180 === 0) { // Portrait
            adWindow.resizeTo(defaultWindowSize.outerWidth, defaultWindowSize.outerHeight);

            body.style.width = Math.min(screenSize.width, screenSize.height) + 'px';
            body.style.height = Math.max(screenSize.width, screenSize.height) + 'px';

            if (orientationProperties.forceOrientation === 'landscape' &&
                (!orientationProperties.allowOrientationChange || forceOrientation)
                && (state === STATES.EXPANDED || placement === PLACEMENTS.INTERSTITIAL)) {

                maxDiv.style['-webkit-transform'] = 'rotate(90deg)';
                var dx = (maxSize.height - maxSize.width) / 2;
                updateAdSize({
                    width: maxSize.height,
                    height: maxSize.width,
                    x: maxSize.y - dx,
                    y:maxSize.x + dx
                });
                if (state === STATES.EXPANDED) {
                    setAdResizeContainerStyle((adExpandedContainer || adResizeContainer), {
                        width: maxSize.height,
                        height: maxSize.width,
                        x: 0,
                        y: 0
                    });
                } else if (placement === PLACEMENTS.INTERSTITIAL) {
                    adContainer.style.width = defaultPosition.height + 'px';
                    adContainer.style.height = defaultPosition.width + 'px';
                    adContainer.style.top = defaultPosition.y + 'px';
                    adContainer.style.left = defaultPosition.x + 'px';
                }
                setAdOrientation(90);
            } else {
                updateAdSize(maxSize);
                if (state === STATES.EXPANDED) {
                    setAdResizeContainerStyle((adExpandedContainer || adResizeContainer), {
                        width: maxSize.width,
                        height: maxSize.height,
                        x: 0,
                        y: 0
                    });
                } else if (placement === PLACEMENTS.INTERSTITIAL) {
                    setContainerDefaultPosition();
                }
                setAdOrientation(0);
            }
        } else { // Landscape
            var w = (defaultWindowSize.outerWidth - defaultWindowSize.innerWidth) + defaultWindowSize.innerHeight;
            var h = (defaultWindowSize.outerHeight - defaultWindowSize.innerHeight) + defaultWindowSize.innerWidth;
            adWindow.resizeTo(w, h);

            body.style.height = Math.min(screenSize.width, screenSize.height) + 'px';
            body.style.width = Math.max(screenSize.width, screenSize.height) + 'px';

            if (orientationProperties.forceOrientation === 'portrait' &&
                (!orientationProperties.allowOrientationChange || forceOrientation)
                && (state === STATES.EXPANDED || placement === PLACEMENTS.INTERSTITIAL)) {

                maxDiv.style['-webkit-transform'] = 'rotate(90deg)';
                var dx = (maxSize.height - maxSize.width) / 2;
                updateAdSize({
                    width: maxSize.width,
                    height: maxSize.height,
                    x: maxSize.y + dx,
                    y: maxSize.x - dx
                });
                if (state === STATES.EXPANDED) {
                    setAdResizeContainerStyle((adExpandedContainer || adResizeContainer), {
                        width: maxSize.width,
                        height: maxSize.height,
                        x: 0,
                        y: 0
                    });
                } else if (placement === PLACEMENTS.INTERSTITIAL) {
                    setContainerDefaultPosition();
                }
                setAdOrientation(0);
            } else {
                updateAdSize({
                    width: maxSize.height,
                    height: maxSize.width,
                    x: maxSize.x,
                    y: maxSize.y
                })
                if (state === STATES.EXPANDED) {
                    setAdResizeContainerStyle((adExpandedContainer || adResizeContainer), {
                        width: maxSize.height,
                        height: maxSize.width,
                        x: 0,
                        y: 0
                    });
                } else if (placement === PLACEMENTS.INTERSTITIAL) {
                    adContainer.style.width = defaultPosition.height + 'px';
                    adContainer.style.height = defaultPosition.width + 'px';
                    adContainer.style.top = defaultPosition.y + 'px';
                    adContainer.style.left = defaultPosition.x + 'px';
                }
                setAdOrientation(90);
            }
        }
        if (offscreen) {
            adWindow.setNavigation();
        }
    };

    mraidview.setDefaultWindowSize = function () {
        defaultWindowSize = {};
        if ((adWindow.outerHeight === 0 || adWindow.outerWidth === 0) && counter > 0) {
            counter--;
            setTimeout(mraidview.setDefaultWindowSize, 50);
        }
        if (orientation % 180 === 0) {
            defaultWindowSize.outerWidth = adWindow.outerWidth;
            defaultWindowSize.innerWidth = adWindow.innerWidth;
            defaultWindowSize.outerHeight = adWindow.outerHeight;
            defaultWindowSize.innerHeight = adWindow.innerHeight;
        } else {
            defaultWindowSize.innerWidth = adWindow.innerHeight;
            defaultWindowSize.innerHeight = adWindow.innerWidth;
            defaultWindowSize.outerWidth = defaultWindowSize.innerWidth + (adWindow.outerWidth - adWindow.innerWidth); // + (adWindow.outerHeight - adWindow.innerHeight);
            defaultWindowSize.outerHeight = defaultWindowSize.innerHeight + (adWindow.outerHeight - adWindow.innerHeight);
        }
    };

    // PUBLIC ACTION METHODS ///////////////////////////////////////////////////////////////

    mraidview.render = function () {
        broadcastEvent(EVENTS.INFO, 'rendering');
        counter = 10;
        if (!adFrame || !adWindow || !adWindow.document || !adFrame.contentWindow) {
            broadcastEvent(EVENTS.INFO, 'creating adWindow');
            adWindow = window.open((offscreen) ? 'safari/device-pages.html': 'safari/device.html', 'adWindow', 'left=1000,width='+screenSize.width+',height='+screenSize.height+',menubar=no,location=no,toolbar=no,status=no,personalbar=no,resizable=no,scrollbars=no,chrome=no,all=no');

            adWindow.onload = function() {
                broadcastEvent(EVENTS.INFO, 'adWindow loaded');

                adWindowAdj.x = window.outerWidth - screenSize.width;
                adWindowAdj.y = window.outerHeight - screenSize.height;
                adWindow.document.getElementsByTagName('body')[0].style.width = screenSize.width + 'px';
                adWindow.document.getElementsByTagName('body')[0].style.height = screenSize.height + 'px';
                adContainer = adWindow.document.getElementById('adContainer');
                adContainer.addEventListener('ViewableChange', function(e) {
                    changeViewable();
                });
                adResizeContainer = adWindow.document.getElementById('adResizeContainer');
                adFrame = adWindow.document.getElementById('adFrame');
                adFrame.contentWindow.orientation = 0; // Set initial orientation.
                closeEventRegion = adWindow.document.getElementById('closeEventRegion');
                closeEventRegion.addEventListener('click', closeAd);

                window.setTimeout(function () { //timeout needed to get the actual window size
                    mraidview.setDefaultWindowSize();
                    if (offscreen) {
                        adWindow.setNavigation();
                    }
                }, 250);
                loadAd();
            };
        } else {
            adWindow.close();
            adWindow = null;
            mraidview.render();
        }
    };

    // PRIVATE METHODS ///////////////////////////////////////////////////////////////

    var clone = function (obj) {
        var f = function () {};
        f.prototype = obj;
        return new f();
    };

    var stringify = function (obj) {
        if (typeof obj == 'object') {
            var out = [];

            if (obj.push) {
                for (var p = 0; p < obj.length; p++) {
                    out.push(obj[p]);
                }
                return '[' + out.join(',') + ']';
            } else {
                for (var p in obj) {
                    out.push('\''+p+'\':'+obj[p]);
                }
                return '{' + out.join(',') + '}';
            }
        } else {
            return String(obj);
        }
    };

    var reset = function () {
        adContent = '';
        adBridge = null;
        adController = null;
        adFrame.style.display = 'block';
        adContainer.style.display = 'block';
        adResizeContainer.style.display = 'block';
        intervalID = null;
        timeoutID = null;
        active = {};
        size.width = defaultPosition.width;
        size.height = defaultPosition.height;
        previousPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        previousState = null;
        state = STATES.DEFAULT;
        expandProperties = {
            width: maxSize.width,
            height: maxSize.height,
            useCustomClose: false,
            isModal: false
        };
        resizeProperties = {
            initialized: false,
            validated: false,
            width: 0,
            height: 0,
            customClosePosition: 'top-right',
            offsetX: undefined,
            offsetY: undefined,
            allowOffscreen: true
        };
        orientationProperties = {
            allowOrientationChange: true,
            forceOrientation: 'none'
        };
        orientation = (screenSize.width >= screenSize.height) ? 90 : 0;
        version = VERSIONS.UNKNOWN;
        currentPosition = {
            x: 0,
            y: 0,
            width: defaultPosition.width,
            height:defaultPosition.height
        };
        isViewable = false;
    };

    var showMraidCloseButton = function(toggle) {
        var closeDiv = closeEventRegion;
        var pos;

        closeDiv.style.position = 'absolute';
        if (toggle) {
            closeDiv.style.top = '';
            closeDiv.style.left = '';
            closeDiv.style.bottom = '';
            closeDiv.style.right = '';
            closeDiv.style.width = '50px';
            closeDiv.style.height = '50px';
            closeDiv.style.display = 'none';
            closeDiv.style.zIndex = getHighestZindex() + 2;
            closeDiv.style.cursor = 'pointer';
            closeDiv.style.background = (expandProperties.useCustomClose) ? '' : 'url("close.png") no-repeat 8px 8px';

            if (state === STATES.RESIZED) {
                closeDiv.style.background = '';

                pos = resizeProperties.customClosePosition;
                if (/top/i.test(pos)) {
                    closeDiv.style.top = '0px';
                } else if (/bottom/i.test(pos)) {
                    closeDiv.style.bottom = '0px';
                } else {
                    closeDiv.style.top = [(resizeProperties.height - 50 ) / 2, 'px'].join('');
                }

                if (/left/i.test(pos)) {
                    closeDiv.style.left = '0px';
                } else if (/right/i.test(pos)) {
                    closeDiv.style.right = '0px';
                } else {
                    closeDiv.style.left = [(resizeProperties.width - 50 ) / 2, 'px'].join('');
                }
            } else {
                closeDiv.style.top = '0';
                closeDiv.style.right = '0';
            }

            closeDiv.style.display = 'block';
            broadcastEvent (EVENTS.INFO, 'adding MRAID close button');
        } else {
            closeDiv.style.display = 'none';
            broadcastEvent (EVENTS.INFO, 'removing MRAID close button');
        }
    };

    var loadAd = function() {
        var doc;

        reset();

        if (adFrame.attachEvent) {
            adFrame.attachEvent("onload", initAdFrame);
        } else {
            adFrame.onload = initAdFrame;
        }

        setContainerDefaultPosition(defaultPosition);

        if (useHtml) {
            doc = adFrame.contentWindow.document;
            doc.body.innerHTML = '<body style="margin: 0px;"><div id="_mraidCloseDiv" onclick="mraid.close()"></div><div id="adHtml"></div></body>';
            doc.body.style.margin = '0px';
            initAdFrame.call(adFrame);
        } else {
            if (adURIFragment) {
                document.cookie = 'uri=' + encodeURIComponent(adURI);
                adFrame.contentWindow.location.replace('ad.html');
            } else {
                adFrame.contentWindow.location.replace(adURI);
            }
        }

        if (orientation % 180 === 0){
            setMaxAdArea(maxSize);
        } else {
            setMaxAdArea({
                width: maxSize.height,
                height: maxSize.width,
                x: maxSize.x,
                y: maxSize.y
            });
        }
    };

    var loadHtml = function (adHtml) {
        var doc = adFrame.contentWindow.document;
        var adDiv = doc.getElementById('adHtml');
        var scripts;
        var scriptsCount;
        var script;
        var i;

        if (!adHtml || !adDiv) {
            return;
        }
        broadcastEvent(EVENTS.INFO, 'loading ad html');
        adDiv.innerHTML = adHtml;
        scripts = doc.body.getElementsByTagName("script");
        scriptsCount = scripts.length;
        for (i = 0; i < scriptsCount; i++) {
            script = doc.createElement('script');
            script.type = "text/javascript";
            if (scripts[i].src !== '') {
                script.src = scripts[i].src;
            } else {
                script.text = scripts[i].text;
            }
            doc.body.appendChild(script);
        }
    };

    var insertAdURI = function (newAdFrame, uri) {
        var qs = 'htmlproxy.php?url=' + encodeURIComponent(uri);
        var success;
        var twoPartHtml = '';

        success = (function () {
            return function (data) {
                var scripts = '<script type="text/javascript" src="mraidview-bridge.js"></script><script type="text/javascript" src="mraid-main.js"></script>';
                var headStart;
                var headEnd;
                var headContent = ''; // Grab the contents of the head. We'll add these later so we have time to initialize mraid before any inline scripts run.

                twoPartHtml = data;
                headStart = data.indexOf('<head>') + 6;
                headEnd = data.indexOf('</head>');
                headContent = data.substr(headStart, headEnd - headStart);
                twoPartHtml = twoPartHtml.replace(headContent, scripts);
                newAdFrame.src = 'javascript: ' + twoPartHtml;

                if (newAdFrame.contentWindow.document.readyState === 'complete') {
                    init2PartAdFrame(headContent);
                } else {
                    if (newAdFrame.attachEvent) {
                        newAdFrame.attachEvent("onload", function () {
                            init2PartAdFrame(headContent);
                        });
                    } else {
                        newAdFrame.onload = function () {
                            init2PartAdFrame(headContent);
                        };
                    }
                }
                if (adURIFragment) {
                    document.cookie = 'uri='+encodeURIComponent(uri);
                }
            };
        })();

        try {
            if (window.jQuery !== undefined) {
                jQuery.get(qs, success);
            }
        } catch(e) {

        }
    };

    var setContainerDefaultPosition = function () {
        adContainer.style.left = defaultPosition.x + 'px';
        adContainer.style.top = defaultPosition.y + 'px';
        adContainer.style.width = defaultPosition.width + 'px';
        adContainer.style.height = defaultPosition.height + 'px';
    };

    var resizeAd = function () {
        var arcs = adResizeContainer.style;

        adContainer.style.overflow = 'visible';
        arcs.position = 'absolute';
        arcs.top = [resizeProperties.offsetY, 'px'].join('');
        arcs.left = [resizeProperties.offsetX, 'px'].join('');
        arcs.width = [resizeProperties.width, 'px'].join('');
        arcs.height = [resizeProperties.height, 'px'].join('');
        arcs['z-index'] = getHighestZindex() + 1;
        currentPosition.x = defaultPosition.x + resizeProperties.offsetX;
        currentPosition.y = defaultPosition.y + resizeProperties.offsetY;
        currentPosition.width = resizeProperties.width;
        currentPosition.height = resizeProperties.height;
        size.width = currentPosition.width =  resizeProperties.width;
        size.height = currentPosition.height =  resizeProperties.height;
        adBridge.pushChange({
            currentPosition: currentPosition,
            size: size
        });
    };

    var setMaxAdArea = function (size) {
        var maxDiv = adWindow.document.getElementById('maxArea');

        maxDiv.style.width = [size.width, 'px'].join('');
        maxDiv.style.height = [size.height, 'px'].join('');
        maxDiv.style.position = 'absolute';
        maxDiv.style.left = [size.x, 'px'].join('');
        maxDiv.style.top = [size.y, 'px'].join('');
        !adBridge || adBridge.pushChange({
            maxSize:
            size
        });
    };

    var setExpandProperties = function(size){
        !adBridge || adBridge.pushChange({
            expandProperties: size
        });
    };

    var setAdResizeContainerStyle = function (resizeContainer, _maxSize) {
        var acs = resizeContainer.style;
        var left;
        var top;

        if (mraidview.version == VERSIONS.V2) {
            if (adExpandedContainer) {
                acs.left = [0, 'px'].join('');
                acs.top = [0, 'px'].join('');
            } else {
                acs.left = ['-', defaultPosition.x, 'px'].join('');
                acs.top = ['-', defaultPosition.y, 'px'].join('');
            }

            acs.width = [_maxSize.width, 'px'].join('');
            acs.height = [_maxSize.height, 'px'].join('');
            currentPosition.width = size.width = _maxSize.width;
            currentPosition.height = size.height = _maxSize.height;
        } else if (mraidview.version === VERSIONS.V1) {
            left = _maxSize.x + (_maxSize.width - expandProperties.width) / 2;
            top = _maxSize.y + (_maxSize.height - expandProperties.height) / 2;

            acs.left = [0, 'px'].join('');
            acs.top = [0, 'px'].join('');
            acs.width = [expandProperties.width, 'px'].join('');
            acs.height = [expandProperties.height, 'px'].join('');
            currentPosition.height = size.height = expandProperties.height;
            currentPosition.width = size.width = expandProperties.width;
        }
    };

    var resetDefaultSize = function () {
        adResizeContainer.style.overflow = 'hidden';
        var arcs = adResizeContainer.style;
        arcs.position = 'static';
        arcs.top = '0';
        arcs.left = '0';
        arcs.width = '100%';
        arcs.height = '100%';
        adContainer['z-index'] = 0;
        size.width = currentPosition.width = defaultPosition.width;
        size.height = currentPosition.height = defaultPosition.height;
        adBridge.pushChange({
            size: size
        });
    };

    var getSupports = function(feature) {
        for (var i = 0; i < supports.length; i++) {
            if (supports[i] == feature) return true;
        }
        return false;
    };

    var getHighestZindex = function() {
        var zi = 0;
        var eles = document.getElementsByTagName('*');
        var ele;

        for (var i = 0; ele = eles[i]; i++) {
            if (ele.style['z-index'] && parseInt(ele.style['z-index']) > zi) {
                zi = parseInt(ele.style['z-index']);
            }
        }

        return zi;
    };

    var endExpanded = function() {
        if (adExpandedContainer) {
            adResizeContainer.appendChild(closeEventRegion);
            adExpandedContainer.parentNode.removeChild(adExpandedContainer);
            adExpandedContainer = null;
            adFrameExpanded = null;

        } else {
            resetDefaultSize();
        }
        mraidview.setOrientation(orientation);
    };

    var setResizeProperties = function(properties) {
        resizeProperties.validated = false;

        if (!properties || !properties.width || !properties.height) {
            adFrame.contentWindow.broadcastEvent(
                EVENTS.ERROR,
                'missing properties for setResizeProperties' ,
                'setResizeProperties'
            );
        }

        var regex = new RegExp('^(((top|bottom)-(left|right|center))|center)$', 'i');
        if (!regex.test(resizeProperties.customClosePosition)) {
            resizeProperties.customClosePosition = 'top-left';
        }

        var maxSizeWidth = orientation % 180 === 0 ? maxSize.width : maxSize.height;
        var maxSizeHeight = orientation % 180 === 0 ? maxSize.height : maxSize.width;
        var posX;
        var posY;
        var pos;
        var closeOffsetX = 0;
        var closeOffsetY = 0;
        var closeTotalPositionX = 0;
        var closeTotalPositionY = 0;

        if (!properties.allowOffscreen) {
            if (properties.width > maxSizeWidth || properties.height > maxSizeHeight) {
                adFrame.contentWindow.broadcastEvent(EVENTS.ERROR, 'invalid properties for setResizeProperties: width or height is too big' , 'setResizeProperties');
            } else {
                posX = Math.max(0, Math.min(maxSizeWidth - properties.width, defaultPosition.x + properties.offsetX));
                posY = Math.max(0, Math.min(maxSizeHeight - properties.height, defaultPosition.y + properties.offsetY));

                properties.offsetX = posX - defaultPosition.x;
                properties.offsetY = posY - defaultPosition.y;
                properties.validated = true;
                setResizePropertyValues(properties);
            }
        } else {
            pos = properties.customClosePosition;

            if (/top/i.test(pos)) {
                closeOffsetY = 0;
            } else if (/bottom/i.test(pos)) {
                closeOffsetY = properties.height - 50;
            } else {
                closeOffsetY = properties.height / 2 - 25;
            }

            if (/left/i.test(pos)) {
                closeOffsetX = 0;
            } else if (/right/i.test(pos)) {
                closeOffsetX = properties.width - 50;
            } else {
                closeOffsetX = properties.width / 2 - 25;
            }

            closeTotalPositionX = defaultPosition.x + properties.offsetX + closeOffsetX;
            closeTotalPositionY = defaultPosition.y + properties.offsetY + closeOffsetY;

            if (closeTotalPositionX < 0 ||
                closeTotalPositionX > maxSizeWidth - 50 ||
                closeTotalPositionY < 0 ||
                closeTotalPositionY > maxSizeHeight - 50) {

                //broadcastEvent(EVENTS.ERROR, 'invalid properties for setResizeProperties' , 'setResizeProperties');
                adFrame.contentWindow.broadcastEvent(EVENTS.ERROR, 'invalid properties for setResizeProperties', 'setResizeProperties');
            } else {
                properties.validated = true;
                setResizePropertyValues(properties);
            }
        }
        adBridge.pushChange({
            resizeProperties: resizeProperties
        });
    };

    var setOrientationProperties = function (properties) {
        if (!properties) return;
        if (properties.forceOrientation) {
            orientationProperties.forceOrientation = properties.forceOrientation;
            if (defaultWindowSize === null) {
                mraidview.setDefaultWindowSize();
            }
            mraidview.setOrientation(orientation, true);
        }

        if (typeof(properties.allowOrientationChange) === 'boolean') {
            orientationProperties.allowOrientationChange = properties.allowOrientationChange;
        }
    };

    var setResizePropertyValues = function (properties) {
        for (var property in resizeProperties) {
            if (properties &&
                typeof (properties[property]) !== 'undefined' &&
                properties[property] !== '') {

                resizeProperties[property] = properties[property];
            }
        }
        if (resizeProperties.initialized === false) {
            resizeProperties.initialized = true;
        }
    };

    var closeAd = function () {
        showMraidCloseButton(false);
        if (state === STATES.DEFAULT) {
            adBridge.broadcastEvent('hide');
        } else if (state === STATES.EXPANDED) {
            state = STATES.DEFAULT;
            if (inactiveAdBridge) {
                adBridge = inactiveAdBridge;
                adController = inactiveAdController;
                inactiveAdBridge = null;
                adController = null;
            }
            /* If forceOrientation is enabled, we need to disable it and update our size and position properties. */
            if (orientationProperties.forceOrientation === 'portrait' || orientationProperties.forceOrientation === 'landscape') {
                orientationProperties = {
                    allowOrientationChange: true,
                    forceOrientation: 'none'
                };
                adBridge.pushChange({
                    orientationProperties: orientationProperties
                });
            }
            adBridge.pushChange({
                state: state
            });
            endExpanded();
        } else if (state === STATES.RESIZED) {
            state = STATES.DEFAULT;
            adBridge.pushChange({
                state: state
            });
            resetDefaultSize();
        } else {
            return;
        }

        adBridge.pushChange({
            currentPosition: currentPosition
        });
        repaintAdWindow();
    };

    var repaintAdWindow = function () {
        if (!adWindow) return;
        adWindow.resizeBy(-1, 0);
        adWindow.resizeBy(1, 0);
    };

    var initAdBridge = function (bridge, controller) {
        broadcastEvent(EVENTS.INFO, 'initializing bridge object ' + bridge + controller);

        inactiveAdBridge = adBridge;
        inactiveAdController = adController;

        adBridge = bridge;
        adController = controller;

        if (placement === PLACEMENTS.INTERSTITIAL) {
            showMraidCloseButton(true);
        }

        bridge.addEventListener('activate', function (service) {
            active[service] = true;
        }, this);

        bridge.addEventListener('deactivate', function (service) {
            if (active[service]) {
                active[service] = false;
            }
        }, this);

        bridge.addEventListener('expand', function (uri) {
            if (state === STATES.HIDDEN ||
                state === STATES.EXPANDED ||
                state === STATES.UNKNOWN ||
                state === STATES.LOADING) {

                return;
            }
            state = STATES.EXPANDED;
            showMraidCloseButton(true);

            var ac = adResizeContainer;
            var acs = adResizeContainer.style;
            var topAdContainer = adContainer;

            if (uri && uri !== '') {
                state = STATES.LOADING;

                adExpandedContainer = document.createElement('div');
                adFrameExpanded = document.createElement('iframe');
                adFrameExpanded.setAttribute('scrolling', 'no');
                adFrameExpanded.setAttribute('frameborder', '0');
                adFrameExpanded.setAttribute('id', 'adFrameExpanded');
                adFrameExpanded.style.height = '100%';
                adFrameExpanded.style.width = '100%';
                adFrameExpanded.style.position = 'absolute';
                adFrameExpanded.style.overflow = 'hidden';
                adFrameExpanded.style.padding = '0px';
                adFrameExpanded.style.margin = '0px';
                adFrameExpanded.style.border = 'none';
                adFrameExpanded.style['z-index'] = getHighestZindex() + 1;
                ac = adExpandedContainer;
                acs = ac.style;

                insertAdURI(adFrameExpanded, uri);

                adExpandedContainer.appendChild(adFrameExpanded);
                adExpandedContainer.appendChild(closeEventRegion);
                adContainer.parentNode.appendChild(adExpandedContainer);

                adExpandedContainer.style['z-index'] = getHighestZindex()+1;
                topAdContainer = adFrameExpanded;
            }

            acs.position = 'absolute';
            setAdResizeContainerStyle(ac, maxSize);

//            topAdContainer['z-index'] = getHighestZindex()+1;

            if (!uri || uri == '') {
                adBridge.pushChange({
                    state: state,
                    currentPosition: currentPosition,
                    size: size
                });
                broadcastEvent(EVENTS.INFO, 'expanding one-part ad');
                repaintAdWindow();

            } else {

                broadcastEvent(EVENTS.INFO, 'expanding two-part ad: ' + uri);
            }
            mraidview.setOrientation(orientation, true);

        }, this);

        bridge.addEventListener('close', closeAd , this);

        bridge.addEventListener('hide', function() {
            adFrame.style.display = 'none';
            adResizeContainer.disabled = 'none';
            adContainer.style.display = 'none';
            previousState = state;
            state = STATES.HIDDEN;
            adBridge.pushChange({
                state: state,
                isViewable: false
            });
        }, this);

        bridge.addEventListener('show', function () {
            adFrame.style.display = 'block';
            adResizeContainer.style.display = 'block';
            adContainer.style.display = 'block';
            state = previousState;
            adBridge.pushChange({
                state: state
            });
        }, this);

        bridge.addEventListener('open', function(URL) {
            broadcastEvent(EVENTS.INFO, 'opening ' + URL);
            window.open(URL, '_blank', [
                'left=1000',
                'width=' + screenSize.width,
                'height=' + screenSize.height,
                'menubar=no',
                'location=no',
                'toolbar=no',
                'status=no',
                'personalbar=no',
                'resizable=no',
                'scrollbars=no',
                'chrome=no',
                'all=no'
            ].join(','));
        }, this);

        bridge.addEventListener('playVideo', function (URL) {
            broadcastEvent(EVENTS.INFO, 'playing ' + URL);
            window.open(URL, '_blank');
        }, this);

        bridge.addEventListener('storePicture', function(URL) {
            var allow = confirm('CONFIRM: Store this image to gallery?\nURL:' + URL);

            if (allow) {
                window.open('../imageDownload.php?imageUrl=' + URL);
                broadcastEvent(EVENTS.INFO, 'storing the image ' + URL);
            } else {
                adFrame.contentWindow.broadcastEvent(EVENTS.ERROR, 'Permission denied by user', 'storePicture');
            }
        }, this);

        bridge.addEventListener('resize', function(uri) {

            if (state === STATES.EXPANDED) {
                adFrame.contentWindow.broadcastEvent(EVENTS.ERROR, 'Can not expand a resized ad', 'resize');
                return;
            } else if (state === STATES.HIDDEN ||
                state === STATES.UNKNOWN ||
                state === STATES.LOADING) {

                return;
            }
            state = STATES.RESIZED;
            showMraidCloseButton(true);
            resizeAd();

            adBridge.pushChange({
                state: state,
                currentPosition: currentPosition,
                size: size
            });
        }, this);

        bridge.addEventListener('setExpandProperties', function (properties) {
            broadcastEvent(EVENTS.INFO, 'setting expand properties to ' + stringify(properties));
            !properties.width || (expandProperties.width = properties.width);
            !properties.height || (expandProperties.height = properties.height);
            !properties.useCustomClose || (expandProperties.useCustomClose = properties.useCustomClose);

            adBridge.pushChange({
                expandProperties: expandProperties
            });
        }, this);

        bridge.addEventListener('setResizeProperties', function (properties) {
            broadcastEvent(EVENTS.INFO, 'setting resize properties to ' + stringify(properties));
            setResizeProperties(properties);
            adBridge.pushChange({
                resizeProperties: resizeProperties
            });
        }, this);

        bridge.addEventListener('createCalendarEvent', function (params) {
            var allow = confirm('CONFIRM: Create this calendar event?\n' + stringify(params));

            if (allow) {
                broadcastEvent(EVENTS.INFO, 'creating event ' + stringify(params));
            } else {
                adFrame.contentWindow.broadcastEvent(EVENTS.ERROR, 'Permission denied by user', 'createCalendarEvent');
            }
        }, this);

        bridge.addEventListener('setOrientationProperties', function (properties) {
            broadcastEvent(EVENTS.INFO, 'setting orientation properties to ' + stringify(properties));
            setOrientationProperties(properties);
            adBridge.pushChange({
                orientationProperties: orientationProperties
            });
        }, this);

        bridge.addEventListener('useCustomClose', function (useCustomCloseIndicator) {
            broadcastEvent(EVENTS.INFO, 'setting useCustomClose properties to ' + stringify(useCustomCloseIndicator));
            expandProperties.useCustomClose = !!useCustomCloseIndicator;
        }, this);

        controller.addEventListener('info', function (message) {
            broadcastEvent(EVENTS.INFO, message);
        }, this);

        controller.addEventListener('error', function (message) {
            broadcastEvent(EVENTS.ERROR, message);
        }, this);

        var initProps = {
            state: STATES.LOADING,
            screenSize: screenSize,
            orientation: orientation,
            size: size,
            defaultPosition: defaultPosition,
            maxSize: maxSize,
            expandProperties: expandProperties,
            resizeProperties: resizeProperties,
            orientationProperties: orientationProperties,
            supports: supports,
            version: mraidview.version,
            placement: mraidview.placement,
            currentPosition: defaultPosition,
            isViewable: isAdViewAble()
        };

        bridge.pushChange({
            version: mraidview.version
        });
        bridge.pushChange(initProps);

        if (!!inactiveAdBridge) {
            state = STATES.EXPANDED;

            mraidview.setOrientation(orientation, true);
            bridge.pushChange({
                state: state,
                currentPosition: currentPosition
            });
            repaintAdWindow();
        }

        bridge.pushChange({
            state: state
        });
    };

    var initAdFrame = function() {
        if (this.detachEvent) {
            this.detachEvent("onload", initAdFrame);
        } else {
            this.onload = '';
        }
        broadcastEvent(EVENTS.INFO, 'initializing ad frame');

        var win = this.contentWindow;
        var doc = win.document;
        var adScreen = {};
        var bridgeJS = doc.createElement('script');

        for (var prop in win.screen) {
            if (prop !== 'width' && prop !== 'height') {
                adScreen[prop] = win.screen[prop];
            }
        }

        adScreen.width = screenSize.width;
        adScreen.height = screenSize.height;

        win.screen = adScreen;

        bridgeJS.setAttribute('type', 'text/javascript');
        bridgeJS.setAttribute('src', 'mraidview-bridge.js');
        doc.getElementsByTagName('head')[0].appendChild(bridgeJS);

        intervalID = win.setInterval(function () {
            if (win.mraidview) {
                win.clearInterval(intervalID);

                var mraidJS = doc.createElement('script');
                mraidJS.setAttribute('type', 'text/javascript');
                mraidJS.setAttribute('src', 'mraid-main.js');
                doc.getElementsByTagName('head')[0].appendChild(mraidJS);

                intervalID = win.setInterval(function () {
                    if (win.mraid) {
                        win.clearInterval(intervalID);
                        window.clearTimeout(timeoutID);
                        initAdBridge(win.mraidview, win.mraid);
                        loadHtml(adHtml);
                    }
                }, 30);
            }
        }, 30);
    };

    /**
     * init2PartAdFrame initializes the second ad frame used by two-part ads.
     */
    var init2PartAdFrame = function (headContent) {
        if (this.detachEvent) {
            this.detachEvent("onload", init2PartAdFrame);
        } else {
            this.onload = '';
        }
        broadcastEvent(EVENTS.INFO, 'initializing ad frame for part 2');
        var win = adFrameExpanded.contentWindow;
        var doc = win.document;
        var adScreen = {};

        function loadPartTwo() {
            var headDump = doc.createElement('div');
            var script;
            var scripts;
            var scriptsCount;
            var i;
            var text;

            headDump.id = 'headDump';
            doc.querySelector('body').appendChild(headDump);
            headDump.innerHTML = headContent;
            scripts = headDump.getElementsByTagName("script");
            scriptsCount = scripts.length;
            for (i = 0; i < scriptsCount; i++) {
                script = doc.createElement('script');
                script.type = "text/javascript";
                if (scripts[i].src !== '') {
                    script.src = scripts[i].src;
                } else {
                    text = scripts[i].text.replace(/\\'/g, "'");
                    script.text = text;
                }
                doc.body.appendChild(script);
            }
        }

        for (var prop in win.screen) {
            if (prop !== 'width' && prop !== 'height') {
                adScreen[prop] = win.screen[prop];
            }
        }

        adScreen.width = screenSize.width;
        adScreen.height = screenSize.height;

        win.screen = adScreen;
        intervalID = win.setInterval(function () {
            if (win.mraidview) {
                win.clearInterval(intervalID);
                intervalID = win.setInterval(function () {
                    if (win.mraid) {
                        win.clearInterval(intervalID);
                        window.clearTimeout(timeoutID);
                        initAdBridge(win.mraidview, win.mraid);
                        loadPartTwo();
                    }
                }, 30);
            }
        }, 30);
    };

    var changeViewable = function (toggle) {
        if (!isViewable && isAdViewAble()) {
            isViewable = true;
            adBridge.pushChange({
                isViewable: isViewable
            });
            if (inactiveAdBridge) {
                inactiveAdBridge.pushChange({
                    isViewable: isViewable
                });
            }
        } else if (isViewable && !isAdViewAble()) {
            isViewable = false;
            adBridge.pushChange({
                isViewable: isViewable
            });
            if (inactiveAdBridge) {
                inactiveAdBridge.pushChange({
                    isViewable: isViewable
                });
            }
        }
    };

    var isAdViewAble = function () {
        var viewableAttr = adContainer.getAttribute('data-isViewable');
        return ((typeof(viewableAttr) === 'string' && viewableAttr === 'true') ||
            (typeof(viewableAttr) === 'boolean' && viewableAttr));
    };

    var setAdOrientation = function (degree) {
        var orientationChangeEvent;

        if (adContainerOrientation !== degree) {
            adContainerOrientation = degree;
            /*
            * The code below has been commented for two reasons:
            * 1. The device should always report the correct orientation, so we don't want to override the
            * window.orientation property.
            * 2. There is no MRAID orientation api, so we don't need to trigger an orientationchange event. This code is here
            * as legacy from when MRAID orientation was under consideration.
            * ---
            * UPDATE: 7/1/2014
            * Because we state that it is the creative's responsibility to ensure that the close button is not off-screen, we need to provide
            * an orientationchange event so that any listeners they might be using to meet this responsibility after an orientation change can respond as intended.
            */
            adFrame.contentWindow.orientation = degree;
            orientationChangeEvent = adFrame.contentWindow.document.createEvent('HTMLEvents');
            orientationChangeEvent.initEvent('orientationchange', false, false);
            adFrame.contentWindow.dispatchEvent(orientationChangeEvent);
            screenSize = {
                width: screenSize.height,
                height: screenSize.width
            };
            adBridge.pushChange({
                size: size,
                orientation: adContainerOrientation,
                currentPosition: currentPosition,
                screenSize: screenSize
            });
        }
    };

    var updateAdSize = function (val){
        setMaxAdArea(val);
        setExpandProperties(val);
    };
})();
