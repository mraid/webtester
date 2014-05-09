/*
 *  Copyright (c) 2012 The mraid-web-tester project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

function mraidJsId() {
	if (typeof (mraid) === 'undefined') {
		console.log('mraid not found yet');
	} else {
		clearInterval(idInterval);
		mraid.info('mraid.js identification script included');
		mraidview.scriptFound = true;
	}
}

var idInterval = setInterval(mraidJsId, 500);