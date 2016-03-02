/*
 *  Copyright (c) 2012 The mraid-web-tester project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */
(function(window) {
      this.mraidVpaid = function( vpaidObject, eventHandler ) {
          var eventRelay = !!eventHandler?eventHandler:function(){};
          var adStarted = false,
              vpaidEvents = {
                AdStarted: function () {
                    eventRelay("AdStarted");
                    adStarted = true;
                },
                AdImpression: function () {
                    eventRelay("AdImpression");
                },
                AdVideoStart: function () {
                    eventRelay("AdVideoStart")
                },
                AdVideoFirstQuartile: function () {
                    eventRelay("AdVideoFirstQuartile")
                },
                AdVideoMidpoint: function () {
                    eventRelay("AdVideoMidpoint")
                },
                AdVideoThirdQuartile: function () {
                    eventRelay("AdVideoThirdQuartile")
                },
                AdVideoComplete: function () {
                    eventRelay("AdVideoComplete")
                },
                AdClickThru: function () {
                    eventRelay("AdClickThru")
                },
                AdInteraction: function () {
                    eventRelay("AdInteraction")
                },
                AdDurationChanged: function () {
                    eventRelay("AdDurationChanged")
                },
                AdUserAcceptInvitation: function () {
                    eventRelay("AdUserAcceptInvitation")
                },
                AdUserMinimize: function () {
                    eventRelay("AdUserMinimize")
                },
                AdUserClose: function () {
                    eventRelay("AdUserClose")
                },
                AdPaused: function () {
                    eventRelay("AdPaused")
                },
                AdPlaying: function () {
                    eventRelay("AdPlaying")
                },
                AdLog: function () {
                    eventRelay("AdLog")
                },
                AdError: function () {
                    eventRelay("AdError")
                }
            },
        subscribe = function (callback, event) {
            broadcastEvent('info', "VPAID : Container subscribing to event : " + event);
            vpaidObject.subscribe(callback, event);
        },
        unsubscribe = function () {
            broadcastEvent('info', "VPAID : Container unsubscribing from event : " + event);
            vpaidObject.unsubscribe();
        },
        startAd = function () {
            broadcastEvent('info', "VPAID : Container calling startAd() on Ad's VPAID Object");
            vpaidObject.startAd();
            this.adStarted = true;
        },
        getAdDuration = function () {
            broadcastEvent('info', "VPAID : Container calling getAdDuration() on Ad's VPAID Object");
            return vpaidObject.getAdDuration();
        },
        getAdRemainingTime = function () {
            broadcastEvent('info', "VPAID : Container calling getAdRemainingTime() on Ad's VPAID Object");
            vpaidObject.getAdRemainingTime();
        };
        for (event in vpaidEvents) {
            subscribe(vpaidEvents[event], event);
        }
        return {
            subscribe:subscribe,
            unsubscribe:unsubscribe,
            startAd:startAd,
            getAdDuration:getAdDuration,
            getAdRemainingTime:getAdRemainingTime
        }
      };
})(window);
