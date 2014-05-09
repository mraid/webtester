## MRAID WebTester: A Certified MRAID v2 Container
MRAID WebTester is a community-driven tool to run MRAID ad units in a web environment. This provides a way to confirm that you are using the MRAID design specification correctly even if you don't have an SDK or app. It passes the compliance ad test provided by the IAB.

### Using the tool
The easiest way to use the tool is to navigate to http://webtester.mraid.org/. This site represents the master branch and you don't need to download any additional files.

===
PREPARE: One the first screen, provide the properties for your test environment

* Geometry: These are the measurements for your default ad size, maximum ad size, and screen size. You can update these values either by dragging and resizing the preview boxes, or by entering values into the form.
* API version: You may select between either version 1 of the API or version 2. Most SDKs are Version 2.
* Placement: You may choose between Inline or Interstitial placement as defined by the MRAID specification.
* Off-Screen: When you choose "Off-Screen", the tester provides pages and navigation to slide your ad into view
* Native features to emulate: Choose the features that best mirror the type of device you are developing for
* Click "Next" or the Flight tab when ready to continue

===
FLIGHT: On the second screen, provide the ad tag

* Tag Source: This is the text box for your HTML tag. This should be HTML and not a URL.
* Click "Render" to continue

===
TEST: The last screen allows you to see the MRAID interactions in your ad unit

* A pop-up attempts to display your ad unit in a web-based MRAID container
* Console: Output from the container is logged to this text area in reverse-chronological order...use Error, Info, and Clear to limit the output to the screen.
* Controls: A landscape control button allows you to simulate device orientation changes...click on the clock icon to toggle this control on a regular timing.

===
You can then use web developer tools to see additional console logging on the pop-up container.


### Integrating with the Online WebTester

The online web tester provides one integration point: the querystring variable "adtag". Use this as a key-value pair for injecting your HTML into the Flight tab. For example, to inject an HTML tag like this 
 ```<h1>hello world</h1>```
into the web tester when you start it, add an adtag query string with URL encoding like this:
 
 http://webtester.mraid.org/index.html?adtag=%3Ch1%3Ehello%20world%3C%2Fh1%3E


### MRAID compliance ads

The MRAID Version 2 API requires that any certified container must run the compliance ads developed by the IAB. These ad units are included in this project for your convenience.


### Reporting a bug

To report a bug simply create a new GitHub Issue and describe your problem or suggestion. However, you may want to join the MRAID WebTester forum to get some input from the coders supporting this project. https://groups.google.com/forum/#!forum/mraid-web-tester

### License

The MRAID WebTester is distributed under the BSD License.

### Thank you!

We really appreciate all kind of feedback and contributions. Thanks for using and supporting MRAID WebTester!
