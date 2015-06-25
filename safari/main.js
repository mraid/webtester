/*
 *  Copyright (c) 2012 The mraid-web-tester project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

//
// Function: load()
// Called by HTML body element's onload event when the web application is ready to start
//
function load() {
    mraidview.addEventListener('info', function (message) {
        if (document.getElementById('logInfo').checked) {
            var console = document.getElementById('console'),
                now = new Date();

            console.innerHTML = [
                formatInfoTime(now), 
                ' INFO ', 
                message, 
                '<br />', 
                console.innerHTML
            ].join('');
        }
    });

    mraidview.addEventListener('error', function (message) {
        if (document.getElementById('logError').checked) {
            var console = document.getElementById('console'),
                now = new Date();

            console.innerHTML = [
                formatInfoTime(now), 
                ' <span style="color:red;">ERROR ', 
                message, '</span><br />', 
                console.innerHTML
            ].join('');
        }
    });
}

// UTILITY //////////////////////////////////////////////////////////////////
function formatInfoTime(d) {
    var h = d.getHours(),
        m = d.getMinutes(),
        s = d.getSeconds(),
        ms = d.getMilliseconds(),
        str = '';

    h = h <= 9 ? '0' + h : h;
    m = m <= 9 ? '0' + m : m;
    s = s <= 9 ? '0' + s : s;
    ms = ms <= 9 ? '00' + ms : (ms <= 99 ? '0' + ms : ms);
    str += [h, ':', m, ':', s, ':', ms].join('');

    return str;
}

// SETUP FORM ///////////////////////////////////////////////////////////////
var features = {
    sms: { name: 'sms' },
    tel: { name: 'tel' },
    calendar: { name: 'calendar' },
    storePicture: { name: 'storePicture' },
    inlineVideo: {name: 'inlineVideo' }
};

function contains(array, item) {
    var i;

    for (i in array) {
        if (array[i] === item) {
            return true;
        }
    }
    
    return false;
}

function renderAd() {
    var form = document.forms.setup;

    prepareMraidView(form);
    mraidview.setAdURI(form.adURI.value, form.fragment.checked);
    mraidview.setUseHtml(false);
    mraidview.render();
    $('[href=#tabs-3]').click(); // switch to third tab
}

function nextStep() {
    $('[href=#tabs-2]').click();
}

function renderHtmlAd() {
    var form = document.forms.setup;
    prepareMraidView(form);
    mraidview.setUseHtml(true, form.adFragment.value);
    mraidview.render();
    $('[href=#tabs-3]').click(); // switch to third tab
}

function prepareMraidView(form) {
/* 
Note: This must be served from a webserver when using Chrome, otherwise you'll
      run into cross-domain limitations. For more information see:
      http://74.125.153.99/support/forum/p/Chrome/thread?tid=0ba628caf22b4a31&hl=en
*/
    var feature;

    mraidview.setScreenSize(parseInt(form.screenWidth.value, 10), parseInt(form.screenHeight.value, 10));
    mraidview.setDefaultPosition(parseInt(form.adLeft.value, 10), parseInt(form.adTop.value, 10), parseInt(form.adWidth.value, 10), parseInt(form.adHeight.value, 10));
    /*mraidview.setMaxAdSize((form.adMaxWidth.value) ? parseInt(form.adMaxWidth.value, 10) : parseInt(form.screenWidth.value, 10), (form.adMaxHeight.value) ? parseInt(form.adMaxHeight.value, 10) : parseInt(form.screenHeight.value, 10));*/
    console.warn('prepareMraidView');
    mraidview.setMaxAdPosition(parseInt(form.adMaxLeft.value, 10), parseInt(form.adMaxTop.value, 10), parseInt(form.adMaxWidth.value, 10), parseInt(form.adMaxHeight.value, 10));
    mraidview.setVersion(form.version.value);
    mraidview.setPlacement(form.placement.value);
    mraidview.setOffScreen(form.offscreen.checked);
    mraidview.resetSupports();
    for (feature in features) {
        if ((typeof feature) === 'string') {
            mraidview.setSupports(feature, form[feature].checked);
        }
    }
}

// AD VIEW ///////////////////////////////////////////////////////////////

function reorient(form) {
    var tmp = form.screenWidth.value;

    form.screenWidth.value = form.screenHeight.value;
    form.screenHeight.value = tmp;

    mraidview.reorient();
}

/* get the query value based on the key */
function getQueryStringValue (searchKey) {
    var qs = location.search.substr(1, location.search.length),
        vQsParts = qs.split('&'),
        i,
        vKeyValue,
        sKey;

    for (i = 0; i < vQsParts.length; i = i + 1) {
        vKeyValue = vQsParts[i].split('=');
        sKey = vKeyValue[0];
        if (searchKey === sKey) {
            return (vKeyValue[1]);
        }
    }

    return null;
}
