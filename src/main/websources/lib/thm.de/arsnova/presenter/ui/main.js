define(
	[
		"dojo/on",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-geometry",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Button",
		"dijit/form/ComboButton",
		"dijit/form/DropDownButton",
		"dijit/Menu",
		"dijit/MenuItem",
		"dijit/form/Select",
		"dgerhardt/common/fullscreen",
		"version"
	],
	function(on, dom, domConstruct, domGeometry, domStyle, registry, BorderContainer, ContentPane, Button, ComboButton, DropDownButton, Menu, MenuItem, Select, fullscreen, version) {
		"use strict";
		
		return {
			init: function() {
				console.log("-- UI: main.init --");
				
				var
					appContainerNode = domConstruct.create("div", {id: "appContainer"}, document.body),
					
					appContainer = new BorderContainer({
						id: "appContainer",
						design: "headline"
					}, appContainerNode),
					mainContainer = new BorderContainer({
						id: "mainContainer",
						region: "center"
					}),
					headerPane = new ContentPane({
						id: "headerPane",
						region: "top",
						"class": "sidePanel"
					}),
					footerPane = new ContentPane({
						id: "footerPane",
						region: "bottom",
						"class": "sidePanel"
					})
				;
				
				appContainer.addChild(mainContainer);
				appContainer.addChild(headerPane);
				appContainer.addChild(footerPane);
			},
			
			startup: function() {
				var appContainer = registry.byId("appContainer");
				appContainer.startup();
				
				/* Add header content */
				var exitPanelNode = domConstruct.create("div", {id: "exitPanel"}, "headerPane");
				/* Miscellaneous buttons */
				var fullScreenMenu = new Menu({style: "display: none"});
				fullScreenMenu.addChild(new MenuItem({
					label: "Answers to Lecturer's questions"
				}));
				fullScreenMenu.addChild(new MenuItem({
					label: "Audience feedback"
				}));
				fullScreenMenu.addChild(new MenuItem({
					label: "Audience questions"
				}));
				new ComboButton({
					label: "Full screen",
					dropDown: fullScreenMenu
				}, domConstruct.create("button", {id: "answersPanelFullscreenButton", type: "button"}, exitPanelNode)).startup();
				var modeMenu = new Menu({style: "display: none"});
				modeMenu.addChild(new MenuItem({
					label: "Presentation"
				}));
				modeMenu.addChild(new MenuItem({
					label: "Editing"
				}));
				modeMenu.addChild(new MenuItem({
					label: "Mobile (lecturer's view)"
				}));
				modeMenu.addChild(new MenuItem({
					label: "Mobile (student's view)"
				}));
				new DropDownButton({
					label: "Mode",
					dropDown: modeMenu
				}, domConstruct.create("button", {id: "mobileButton", type: "button"}, exitPanelNode)).startup();

				/* Add footer content */
				var versionString = version.version;
				if (version.commitId) {
					versionString += " [" + version.commitId + "]";
				}
				domConstruct.create("img", {id: "productLogo", src: "images/logo-16x16.png"}, "footerPane");
				domConstruct.create("span", {id: "productName", "class": "groupPanel", innerHTML: "ARSnova Presenter"}, "footerPane");
				domConstruct.create("span", {id: "productVersionDetails", "class": "groupPanel", innerHTML: "Version: " + versionString}, "footerPane");
				
				/* prevent window scrolling (needed for IE) */
				on(window, "scroll", function(event) {
					scrollTo(0, 0);
					console.debug("Prevented document scrolling");
				});
				
				fullscreen.onChange(function(event, isActive) {
					var fullscreenNode = dom.byId("fullscreenContainer");
					var logo = dom.byId("fullscreenLogo");
					if (isActive) {
						console.log("Fullscreen mode enabled");
						domStyle.set(fullscreenNode, "display", "block");
						
						/* calculate logo size */
						var docGeometry = domGeometry.getContentBox(document.body);
						var vRatio = docGeometry.h / 30.0;
						var ratio = logo.offsetWidth / logo.offsetHeight;
						domStyle.set(logo, "height", vRatio);
						domStyle.set(logo, "width", (vRatio * ratio) + "px");
						domStyle.set(logo, "display", "block");
					} else {
						console.log("Fullscreen mode disabled");
						domStyle.set(fullscreenNode, "display", "none");
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
				
				appContainer.resize();
			}
		};
	}
);
