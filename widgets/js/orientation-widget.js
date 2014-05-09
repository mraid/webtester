/*
 *  Copyright (c) 2012 The mraid-web-tester project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

orientationWidget = {
	timer: null,
	interval: null,

	init : function () {
		$("#orientationToggle").bind("click", orientationWidget.toggleOrientation);
		$("#orientationState").bind("change", orientationWidget.setOrientation);
		$("#orientationState").val("portrait");
	},

	toggleOrientation : function () {
		$("#orientationToggle").toggleClass("portrait");
		if ($("#orientationToggle").hasClass("portrait")) {
			$("#orientationState").val("portrait");
		} else {
			$("#orientationState").val("landscape");
		}
		mraidview.rotateOrientation();
	},

	setOrientation : function () {
		if ($("#orientationState").val() === "landscape") {
			$("#orientationToggle").removeClass("portrait");
		} else {
			$("#orientationToggle").addClass("portrait");
		}
		mraidview.rotateOrientation();
	},

	toggleOrientationTiming : function () {
		var state = $("#orientationTiming").attr("class");
		if (state === 't-off') {
			orientationWidget.timer = prompt("Enter number of milliseconds to update orientation state", 1000);
			orientationWidget.interval = setInterval(orientationWidget.toggleOrientation, orientationWidget.timer);
			$("#orientationTiming").attr("class", "t-on");
		} else {
			clearInterval(orientationWidget.interval);
			$("#orientationTiming").attr("class", "t-off");
		}
	}
};