function $(element)
{
	element = document.getElementById(element);
	return element;
}
var head = document.getElementsByTagName("head")[0];
var scr = document.createElement("script");
scr.setAttribute('src', 'mraid.js');
scr.setAttribute('type', 'text/javascript');
head.appendChild(scr);
window._aron_init = 0;
window._aron_state='none';
// Viewport setup
var meta = document.querySelector("meta[name=viewport]");
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

function logmessage(message)
{ //Dual logging. It will show in the console and in the ad.
	console.log(message);
	var logdiv = $('logdiv');
	if(logdiv)
	{
		logdiv.insertBefore(document.createElement("br"),logdiv.firstChild);
		logdiv.insertBefore(document.createTextNode(new Date().getTime()+": "+message),logdiv.firstChild);
		
	}
}

function readycheck()
{
	logmessage('window.onload() triggered.');
	if(mraid.getState() == 'loading') 
	{
		mraid.addEventListener("ready", statechange);  
	}
	else
	{
		statechange();
	}
	if(!mraid.isViewable())
	{
	  logmessage('Adview is not visible'); //Don't die from this error, just a notice
	}
	mraid.addEventListener('error', mraiderror);
	mraid.addEventListener('stateChange', statechange);
	mraid.addEventListener('sizeChange', sizechange);
	mraid.removeEventListener('stateChange', statechange);
	mraid.addEventListener('stateChange', statechange); //Just to check that removing and adding the same event listener works.
}

function initad()
{
	//Inject a style
	logmessage('initad() triggered.');
	var gcp = mraid.getCurrentPosition();
	var head = document.getElementsByTagName("head")[0];
	var style = document.createElement('style');
	style.setAttribute('type', 'text/css')
	style.appendChild(document.createTextNode('div#aroniabtestad{text-align:center; width:100%; height:100%; background:#000; color:#f00; font-size:12px; line-height:14px; position:relative; font-family:arial;} div#aroniabtestad *{z-index:1;} span.btn{background:#000; font-size:24px; outline:2px outset #f00; line-height:50px;} span#expandbtn{background:#fff; line-height:40px;} div#posdiv{position:absolute; background:#fff; outline:2px solid #f00; font-size:20px; line-height:25px; z-index:0;} div#waterdiv{position:absolute; text-align:center; left:0; right:0; top:50%; color:#333; font-size:8px;} div#logdiv{position:absolute; text-align:center; left:25px; right:25px; bottom:110px; color:#222; height:50px; border:1px solid #f00; background:#fff; font-size:8px; overflow:scroll;} @media (min-height:400px){div#logdiv{height:100px;}}'));
	head.appendChild(style);
	var parentdiv = $('aroniabtestad');
	var maindiv = document.createElement("div"); //This is where buttons go
	maindiv.id = 'maindiv';
	parentdiv.appendChild(maindiv);
	var sizediv = document.createElement("div"); // This is pure information
	sizediv.id = 'sizediv';
	parentdiv.appendChild(sizediv);
	var posdiv = document.createElement("div"); //This is to show how sizing is working, visually
	posdiv.id = 'posdiv';
	parentdiv.appendChild(posdiv);
	posdiv.style.width = (gcp.width-30) + 'px';
	posdiv.style.height = (gcp.height-30) + 'px';
	posdiv.style.left = '15px';
	posdiv.style.top = '15px';
	var posdiv = $('posdiv');
	var waterdiv = document.createElement("div"); //This is to show how sizing is working, visually
	waterdiv.id = 'waterdiv';
	waterdiv.appendChild(document.createTextNode("IAB MRAID2 Expandable Compliance Ad."));
	parentdiv.appendChild(waterdiv);
	var logdiv = document.createElement("div"); //A generic div for showing logmessage inline...
	logdiv.id = 'logdiv';
	parentdiv.appendChild(logdiv);
	window._aron_init = 1;
}

function statechange()
{
	if (window._aron_init == 0)
	{
		initad();
	}
	updateprops("State Change");
	if(mraid.getState()!=window._aron_state)
	{
	  window._aron_state=mraid.getState();
	  stepchange();
	}
}

function stepchange()
{
  	var gcp = mraid.getCurrentPosition();
	var posdiv = $('posdiv');
	var maindiv = $('maindiv');
	while (maindiv.firstChild)
	{
		maindiv.removeChild(maindiv.firstChild);
	}
	window._aron_step = 0;
	switch (mraid.getState())
	{
	case 'default':
		while (posdiv.firstChild)
		{
			posdiv.removeChild(posdiv.firstChild);
		}
		var expandbtn = document.createElement("span");
		expandbtn.setAttribute('onclick', 'expand()');
		expandbtn.setAttribute('type', 'submit');
		expandbtn.id = 'expandbtn';
		expandbtn.className = 'btn';
		expandbtn.appendChild(document.createTextNode('Expand!'));
		expandbtn.style.position = 'absolute';
		expandbtn.style.width = '120px';
		expandbtn.style.height = '40px';
		expandbtn.style.left = ((gcp.width / 2) - 60) + 'px';
		expandbtn.style.top = ((gcp.height / 2) - 20) + 'px';
		expandbtn.style.lineHeight = '40px';
		maindiv.appendChild(expandbtn);
		$('waterdiv').style.display='none';
		$('logdiv').style.display='none';
		posdiv.style.display='none';
		break;
	case 'expanded':
		var forceland = document.createElement("span");
		forceland.setAttribute('onclick', 'forceland()');
		forceland.id = 'forceland';
		forceland.className='btn';
		forceland.style.position = 'absolute';
		forceland.style.width = '240px';
		forceland.style.height = '50px';
		forceland.style.left = ((gcp.width / 2) - 120) + 'px';
		forceland.style.top = ((gcp.height) - 75)+ 'px';
		if(gcp.width>gcp.height)
		{
		  forceland.appendChild(document.createTextNode('Rotate to Portrait'));
		  forceland.setAttribute('onclick', 'false');
			forceland.style.background='#fff';
		}
		else
		{
		  forceland.appendChild(document.createTextNode('Lock to Landscape'));
		  forceland.setAttribute('onclick', 'forceland()');
			forceland.style.background='#000';
		}
		maindiv.appendChild(forceland);
		var closediv = document.createElement("div");
		closediv.setAttribute('style', 'position:absolute; top:0; right:0; width:50px; height:50px; background:#fff; font-size:50px; line-height:50px; text-align:center;');
		closediv.setAttribute('id', 'closediv');
		closediv.appendChild(document.createTextNode('X'));
		maindiv.appendChild(closediv);
		var posdivtxt = document.createElement("div");
		posdivtxt.style.paddingTop='30px';
		posdivtxt.appendChild(document.createTextNode('IAB MRAID2 Expandable Compliance Ad.'));
		posdivtxt.appendChild(document.createElement('br'));
		posdivtxt.appendChild(document.createTextNode('Top and bottom must be equal margin.'));
		posdivtxt.appendChild(document.createElement('br'));
		posdivtxt.appendChild(document.createTextNode('Left and right must be equal margin.'));
		posdiv.appendChild(posdivtxt);
		posdiv.style.display='block';
		$('waterdiv').style.display='block';
		$('logdiv').style.display='block';
		break;
	}
}

function orientationchange()
{
	updateprops("Orientation Change");
}

function mraiderror(message,action)
{
	updateprops("MRAID Error: '"+message+"' From: "+action);
}

function updateprops(event)
{
	var gcp = mraid.getCurrentPosition();
	var gss = mraid.getScreenSize();
	var expp = mraid.getExpandProperties();
	var orient = 'Undefined!';
	switch (window.orientation)
	{
	case 0:
	case 180:
		orient = 'Portrait';
		break;
	case 90:
	case -90:
		orient = 'Landscape';
		break;
	}
	logmessage("[Cur: x: " + gcp.x + ", y: " + gcp.y + ", width: " + gcp.width + ", height: " + gcp.height+"] ["+
	  "Window: x: " + window.innerWidth + ", y: " + window.innerHeight+"] ["+
	  "Scr: width: " + gss.width + ", height: " + gss.height+"] ["+
	  "expProps: width: " + expp.width + ", height: " + expp.height +"] ["+
	  "Current orientation: " + orient+"] ["+
	  "Last Event: " + event+"]"
	);
}

function expand()
{
	mraid.setOrientationProperties(
	{
		"allowOrientationChange": true
	});
	mraid.expand();
}

function forceland()
{
	window._aron_step = 1;
	mraid.setOrientationProperties(
	{
		"allowOrientationChange": false,
		"forceOrientation": "landscape"
	});
}

function forceport()
{
	window._aron_step = 2;
	mraid.setOrientationProperties(
	{
		"forceOrientation": "portrait"
	}); //Allow should still be false
}

function unlock()
{
	window._aron_step = 3;
	mraid.setOrientationProperties(
	{
		"forceOrientation": "none",
		"allowOrientationChange": true
	});
	$('unlock').parentNode.removeChild($('unlock'));
	var maindiv = $('maindiv');
	var span = document.createElement("span");
	span.id = 'informspan';
	span.appendChild(document.createTextNode("Close ad by hitting the top right."));
	span.setAttribute('style', 'position:absolute; top:20px; width:100%; left:0; right:0;');
	maindiv.appendChild(span);
}

function sizechange(width, height)
{
	updateprops("Size Change");
	if(mraid.getState()!=window._aron_state)
	{
	  window._aron_state=mraid.getState();
	  stepchange();
	}
	var gcp = mraid.getCurrentPosition();
	var posdiv = $('posdiv');
	posdiv.style.width = (gcp.width-30) + 'px';
	posdiv.style.height = (gcp.height-30) + 'px';
	posdiv.style.left = '15px';
	posdiv.style.top = '15px';
	switch (window._aron_step)
	{
	  case 0:
	    if(mraid.getState()=='expanded')
	    {
	      	    var forceland=$('forceland');
	      forceland.style.left = ((gcp.width / 2) - 120) + 'px';
	      forceland.style.top = ((gcp.height) - 75)+ 'px';
	      forceland.removeChild(forceland.firstChild);
	      if(gcp.width>gcp.height)
	      {
		forceland.appendChild(document.createTextNode('Rotate To Portrait'));
		forceland.setAttribute('onclick', 'false');
		forceland.style.background='#fff';
	      }
	      else
	      {
		forceland.appendChild(document.createTextNode('Lock to Landscape'));
		forceland.setAttribute('onclick', 'forceland()');
		forceland.style.background='#000';
	      }
	    }
	    break;
	case 1:
		//Add button to landscape
		$('forceland').parentNode.removeChild($('forceland'));
		var forceport = document.createElement("span");
		forceport.setAttribute('onclick', 'forceport()');
		forceport.id = 'forceport';
		forceport.appendChild(document.createTextNode('Lock to Portrait'));
		forceport.style.position = 'absolute';
		forceport.style.width = '240px';
		forceport.style.height = '50px';
		forceport.style.left = ((gcp.width / 2) - 120) + 'px';
		forceport.style.top = ((gcp.height) - 75)+ 'px';
		forceport.className='btn';
		maindiv.appendChild(forceport);
		break;
	case 2:
		//Add button to portrait
		$('forceport').parentNode.removeChild($('forceport'));
		var unlock = document.createElement("span");
		unlock.setAttribute('onclick', 'unlock()');
		unlock.id = 'unlock';
		unlock.appendChild(document.createTextNode('Release Lock'));
		unlock.style.position = 'absolute';
		unlock.style.width = '240px';
		unlock.style.height = '50px';
		unlock.style.left = ((gcp.width / 2) - 120) + 'px';
		unlock.style.top = ((gcp.height) - 75)+ 'px';
		unlock.className='btn';
		maindiv.appendChild(unlock);
		break;
	}
	if(mraid.getState()=='default')
	{
	  var forceland=$('expandbtn');
	    expandbtn.style.left = ((gcp.width / 2) - 60) + 'px';
	    expandbtn.style.top = ((gcp.height / 2) - 20) + 'px';
	}
}
window.addEventListener('orientationchange', orientationchange, false);
if(document.readyState=="complete")
{
	readycheck();
}
else
{
	window.addEventListener('load', readycheck, false); //DOM and MRAID check
}