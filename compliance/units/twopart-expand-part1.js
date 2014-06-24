function $(element)
{
	element = document.getElementById(element);
	return element;
}
window._aron_init = 0;
window._aron_state='none';
// Viewport setup
var meta = document.querySelector("meta[name=viewport]");
var head = document.getElementsByTagName("head")[0];
if (!meta)
{
  meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width,user-scalable=no,initial-scale=1,maximum-scale=1";
  head.appendChild(meta);
}
else
{
  meta.content = "width=device-width,user-scalable=no,initial-scale=1,maximum-scale=1";
}

function initad()
{
	//Inject a style
	console.log('initad() triggered.');
	var head = document.getElementsByTagName("head")[0];
	var style = document.createElement('style');
	style.setAttribute('type', 'text/css')
	style.appendChild(document.createTextNode(' body{display:table; height:100%; width:100%;} div#arontwopartwrap{text-align:center; width:100%; background:#000; color:#f00; font-size:12px; font-family:arial;display:block; vertical-align:middle;} a{ line-height:40px; font-size:30px; padding:3px; background:#fff; color:#f00; border:1px solid #f00; display:block; height:40px; width:260px; margin:auto; text-align:center; text-decoration:none;}'));
	head.appendChild(style);
	window._aron_init = 1;

}



function readycheck()
{
	console.log('window.onload() triggered.');
	if(mraid.getState() == 'loading') 
	{
		mraid.addEventListener("ready", initad);  
	}
	else
	{
		initad();
	}
	if(!mraid.isViewable())
	{
	  console.log('Adview is not visible'); //Don't die from this error, just a notice
	}
	mraid.addEventListener('error', mraiderror);
	mraid.addEventListener('stateChange', statechange);
}

function statechange()
{
	console.log("MRAID State Change. State=".mraid.getState());
}

function mraiderror(message,action)
{
	console.log("MRAID Error: '"+message+"' From: "+action);
}

function twopart()
{
  mraid.useCustomClose(true); //No SDK close button.
	var expp=mraid.getExpandProperties();//Check that useCustomClose is true.
	if(expp.useCustomClose==false)
	{
		console.log('ERROR: mraid.getExpandProperties() was not updated from mraid.useCustomClose()!');
	}
		mraid.setOrientationProperties(
	{
		"forceOrientation": "none",
		"allowOrientationChange": true
	});
	mraid.setExpandProperties({"width":200,"height":200,"isModal":false});//Setting this should have no effect. useCustomClose should still be true.
	mraid.expand("http://mraid.iab.net/compliance/units/twopart-expand-part2.html"); //Change URL to test other pages
}

if(document.readyState=="complete")
{
	readycheck();
}
else
{
	window.addEventListener('load', readycheck, false); //DOM and MRAID check
}