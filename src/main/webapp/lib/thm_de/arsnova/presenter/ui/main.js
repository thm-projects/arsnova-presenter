define(
	[
		"dojo/on",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dgerhardt/common/fullscreen"
	],
	function(on, dom, domConstruct, domStyle, fullscreen) {
		"use strict";
		
		return {
			init: function() {
				console.log("-- UI: main.init --");
				
				/* prevent window scrolling (needed for IE) */
				on(window, "scroll", function(event) {
					scrollTo(0, 0);
					console.debug("Prevented document scrolling");
				});
				
				fullscreen.onChange(function(event, isActive) {
					if (isActive) {
						console.log("Fullscreen mode enabled");
					} else {
						console.log("Fullscreen mode disabled");
					}
				});
				
				var lowResNode = dom.byId("lowResolution");
				var resizeLog = "";
				var resizeLogTimeout = null;
				domStyle.set(lowResNode, "visibility", "hidden");
				domConstruct.place(lowResNode, document.body);
				var windowOnResize = function(event) {
					if (screen.availWidth < 780 || screen.availHeight < 460) {
						resizeLog = "Small resolution detected: " + screen.availWidth + "x" + screen.availHeight;
						dom.byId("lowResolutionMessage").innerHTML = "This application cannot be run because the resolution requirements are not met. ARSnova Presenter is optimized for notebook, tablet and desktop devices.";
						domStyle.set(appContainer, "visibility", "hidden");
						domStyle.set(lowResNode, "visibility", "visible");
					} else if (document.body.clientWidth < 780 || document.body.clientHeight < 460) {
						resizeLog = "Small window detected: " + document.body.clientWidth + "x" + document.body.clientHeight;
						dom.byId("lowResolutionMessage").innerHTML = "This application cannot be run because the resolution requirements are not met. Please increase the size of your browser's window.";
						domStyle.set(appContainer, "visibility", "hidden");
						domStyle.set(lowResNode, "visibility", "visible");
					} else {
						resizeLog = "Acceptable client size detected: " + document.body.clientWidth + "x" + document.body.clientHeight;
						domStyle.set(lowResNode, "visibility", "hidden");
						domStyle.set(appContainer, "visibility", "visible");
					}
					if (resizeLogTimeout) {
						clearTimeout(resizeLogTimeout);
					}
					resizeLogTimeout = setTimeout(function() {
						console.log(resizeLog);
					}, 500);
				};
				on(window, "resize", windowOnResize);
				windowOnResize();
			}
		};
	}
);
