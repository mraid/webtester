/*
 *  Copyright (c) 2012 The mraid-web-tester project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */


devicesizeWidget = {
	init : function() { 

		jQuery(function($){
		   $('.drag')
/*		      .click(function(){
		         $( this ).toggleClass("selected");
		      })
*/
		      .drag("init",function(){
		         if ( $( this ).is('.selected') )
		            return $('.selected');                 
		      })
		      .drag("start",function( ev, dd ){
		         dd.attr = $( ev.target ).prop("className");
		         dd.width = $( this ).width();
		         dd.height = $( this ).height();
		      })
		      .drag("end", function(ev, dd){
				 devicesizeWidget.updateForm();
		      })
		      .drag(function( ev, dd ){
		         var props = {};
		         if ( dd.attr.indexOf("E") > -1 ){
		            props.width = Math.max( 32, dd.width + dd.deltaX );
		         }
		         if ( dd.attr.indexOf("S") > -1 ){
		            props.height = Math.max( 32, dd.height + dd.deltaY );
		         }
		         if ( dd.attr.indexOf("W") > -1 ){
		            props.width = Math.max( 32, dd.width - dd.deltaX );
		            props.left = dd.originalX + dd.width - props.width;
		         }
		         if ( dd.attr.indexOf("N") > -1 ){
		            props.height = Math.max( 32, dd.height - dd.deltaY );
		            props.top = dd.originalY + dd.height - props.height;
		         }
		         if ( dd.attr.indexOf("drag") > -1 ){
		            props.top = dd.offsetY;
		            props.left = dd.offsetX;
		         }
		         $( this ).css( props );
		      });
		});

		devicesizeWidget.updatePreview();		
	},
	
	updateScreenFromDrag : function (evt, ui) {
		var width = parseInt($("#resizable-screensize").css("width")),
			height = parseInt($("#resizable-screensize").css("height"));
		$("#screenWidth").val(width);
		$("#screenHeight").val(height);
	},
	
	updateMaxFromDrag : function (evt, ui) {
		var width = parseInt($("#resizable-maxAdSize").css("width")) + 2,
			height = parseInt($("#resizable-maxAdSize").css("height")) + 2;
		$("#adMaxWidth").val(width);
		$("#adMaxHeight").val(height);
	},
	
	updatePositionFromMaxDrag : function (evt, ui) {
		devicesizeWidget.updatePositionFromMinDrag(evt,ui);
		
		var top = parseInt($("#resizable-maxAdSize").css("top")),
			left = parseInt($("#resizable-maxAdSize").css("left"));
		$("#adMaxTop").val(top);
		$("#adMaxLeft").val(left);
	},
	
	updateMinFromDrag : function (evt, ui) {
		var width = parseInt($("#resizable-initialAdSize").css("width")) + 4,
			height = parseInt($("#resizable-initialAdSize").css("height")) + 4;
		$("#adWidth").val(width);
		$("#adHeight").val(height);
	},
	
	updatePositionFromMinDrag : function (evt, ui) {
		var top = parseInt($("#resizable-initialAdSize").css("top")), // + parseInt($("#resizable-maxAdSize").css("top")),
			left = parseInt($("#resizable-initialAdSize").css("left")); // + parseInt($("#resizable-maxAdSize").css("left"));
		$("#adTop").val(top);
		$("#adLeft").val(left);
	},
	
	updateForm : function () {
		var screenWidth = parseInt($("#resizable-screensize").css("width")),
			screenHeight = parseInt($("#resizable-screensize").css("height")),
			adMaxWidth = parseInt($("#resizable-maxAdSize").css("width")),
			adMaxHeight = parseInt($("#resizable-maxAdSize").css("height")),
			adMaxTop = parseInt($("#resizable-maxAdSize").css("top")),
			adMaxLeft = parseInt($("#resizable-maxAdSize").css("left")),
			adWidth = parseInt($("#resizable-initialAdSize").css("width")),
			adHeight = parseInt($("#resizable-initialAdSize").css("height")),
			adTop = parseInt($("#resizable-initialAdSize").css("top")),
			adLeft = parseInt($("#resizable-initialAdSize").css("left")),
			offsetTop = 100,
			offsetLeft = 500;

		$("#screenWidth").val(screenWidth);
		$("#screenHeight").val(screenHeight);
		$("#adMaxWidth").val(adMaxWidth);
		$("#adMaxHeight").val(adMaxHeight);
		$("#adMaxTop").val(adMaxTop - offsetTop);
		$("#adMaxLeft").val(adMaxLeft - offsetLeft);
		$("#adWidth").val(adWidth);
		$("#adHeight").val(adHeight);
		$("#adTop").val(adTop - offsetTop);
		$("#adLeft").val(adLeft - offsetLeft);
	},

	updatePreview : function () {
		var screenWidth = parseInt($("#screenWidth").val()),
			screenHeight = parseInt($("#screenHeight").val()),
			adMaxWidth = parseInt($("#adMaxWidth").val()),
			adMaxHeight = parseInt($("#adMaxHeight").val()),
			adWidth = parseInt($("#adWidth").val()),
			adHeight = parseInt($("#adHeight").val()),
			adTop = parseInt($("#adTop").val()),
			adLeft = parseInt($("#adLeft").val()),
			adMaxTop = parseInt($("#adMaxTop").val()),
			adMaxLeft = parseInt($("#adMaxLeft").val()),
			offsetTop = 100,
			offsetLeft = 500;
			
		$("#resizable-screensize").css("width", screenWidth);
		$("#resizable-screensize").css("height", screenHeight);
		$("#resizable-maxAdSize").css("width", adMaxWidth);
		$("#resizable-maxAdSize").css("height", adMaxHeight);
		$("#resizable-initialAdSize").css("width", adWidth);
		$("#resizable-initialAdSize").css("height", adHeight);

		$("#resizable-initialAdSize").css("top", adTop + offsetTop);
		$("#resizable-initialAdSize").css("left", adLeft + offsetLeft);
		$("#resizable-maxAdSize").css("top", adMaxTop + offsetTop);
		$("#resizable-maxAdSize").css("left", adMaxLeft + offsetLeft);
	}

};