define(
	[
		"dojo/on",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-geometry",
		"dojo/dom-style",
		"dojo/date/locale",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Button",
		"dijit/form/ComboButton",
		"dijit/form/DropDownButton",
		"dijit/Menu",
		"dijit/MenuItem",
		"dijit/form/Select",
		"dijit/Tooltip",
		"dgerhardt/common/fullscreen",
		"version"
	],
	function(on, dom, domConstruct, domGeometry, domStyle, dateLocale, registry, BorderContainer, ContentPane, Button, ComboButton, DropDownButton, Menu, MenuItem, Select, Tooltip, fullScreen, version) {
		"use strict";
		
		var
			self = null,
			
			/* Dijit */
			appContainer = null,
			mainContainer = null,
			headerPane = null,
			footerPane = null,
			fullScreenContainer = null
		;
		
		self = {
			/* public "methods" */
			init: function() {
				console.log("-- UI: main.init --");
				
				var appContainerNode = domConstruct.create("div", {id: "appContainer", style: "visibility: hidden"}, document.body);
				
				appContainer = new BorderContainer({
					id: "appContainer",
					design: "headline"
				}, appContainerNode);
				mainContainer = new BorderContainer({
					id: "mainContainer",
					region: "center"
				});
				headerPane = new ContentPane({
					id: "headerPane",
					region: "top",
					"class": "sidePanel"
				});
				footerPane = new ContentPane({
					id: "footerPane",
					region: "bottom",
					"class": "sidePanel"
				});
				
				appContainer.addChild(mainContainer);
				appContainer.addChild(headerPane);
				appContainer.addChild(footerPane);

				/* Add dom nodes needed for full screen mode */
				fullScreenContainer = new BorderContainer({
					id: "fullScreenContainer"
				});
				fullScreenContainer.addChild(new ContentPane({
					id: "fullScreenHeader",
					region: "top"
				}));
				fullScreenContainer.addChild(new ContentPane({
					id: "fullScreenContent",
					region: "center"
				}));
				fullScreenContainer.placeAt(document.body);
			},
			
			startup: function() {
				appContainer.startup();
				domStyle.set(appContainer.domNode, "visibility", "visible");
				fullScreen.setPageNode(appContainer.domNode);
				
				/* Add header content */
				var exitPanelNode = domConstruct.create("div", {id: "exitPanel"}, headerPane.domNode);
				
				var fullScreenMenu = new Menu({id: "fullScreenMenu", style: "display: none"});
				/* Menu items are added in the specific UI modules */
				new ComboButton({
					label: "Full screen",
					onClick: this.toggleFullScreenMode,
					dropDown: fullScreenMenu
				}, domConstruct.create("button", {id: "fullScreenButton", type: "button"}, exitPanelNode)).startup();
				
				var modeMenu = new Menu({
					id: "modeMenu",
					style: "display: none"
				});
				modeMenu.addChild(new MenuItem({
					label: "Presentation"
				}));
				modeMenu.addChild(new MenuItem({
					label: "Editing",
					disabled: true
				}));
				modeMenu.addChild(new MenuItem({
					id: "mobileLecturersViewMenuItem",
					label: "Mobile (lecturer's view)",
					disabled: true
				}));
				modeMenu.addChild(new MenuItem({
					id: "mobileStudentsViewMenuItem",
					label: "Mobile (student's view)",
					disabled: true
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
				domConstruct.create("span", {id: "productLogo", title: "ARSnova"}, footerPane.domNode);
				domConstruct.create("span", {id: "productName", "class": "groupPanel", innerHTML: "Presenter"}, footerPane.domNode);
				var versionDetailsNode = domConstruct.create("span", {id: "productVersionDetails", "class": "groupPanel"}, footerPane.domNode);
				versionDetailsNode.appendChild(document.createTextNode("Version: " + versionString));
				var timeNode = domConstruct.create("div", {id: "footerTime"}, footerPane.domNode);
				var timeTooltip = new Tooltip({
					connectId: [timeNode],
					position: ["above-centered"]
				});
				setInterval(function() {
					var date = new Date();
					timeNode.innerHTML = dateLocale.format(date, {selector: "time", formatLength: "short"});
					timeTooltip.set("label", dateLocale.format(date, {selector: "date", formatLength: "short"}));
				}, 500);
				
				/* prevent window scrolling (needed for IE) */
				on(window, "scroll", function(event) {
					scrollTo(0, 0);
					console.debug("Prevented document scrolling");
				});

				/* Full screen mode */
				fullScreenContainer.startup();
				var fullScreenLogo = domConstruct.create("img", {id: "fullScreenLogo", src: "images/arsnova.png"}, fullScreenContainer.domNode);
				fullScreen.onChange(function(event, isActive) {
					if (isActive) {
						console.log("Full screen mode enabled");
						domStyle.set(fullScreenContainer.domNode, "display", "block");
						
						/* calculate logo size */
						var docGeometry = domGeometry.getContentBox(document.body);
						var vRatio = docGeometry.h / 30.0;
						var ratio = fullScreenLogo.offsetWidth / fullScreenLogo.offsetHeight;
						domStyle.set(fullScreenLogo, "height", vRatio);
						domStyle.set(fullScreenLogo, "width", (vRatio * ratio) + "px");
						domStyle.set(fullScreenLogo, "display", "block");
						
						fullScreenContainer.resize()
					} else {
						console.log("Full screen mode disabled");
						domStyle.set(fullScreenContainer.domNode, "display", "none");
					}
				});
				
				var lowResNode = domConstruct.create("div", {id: "lowResolution"}, document.body);
				domStyle.set(lowResNode, "visibility", "hidden");
				var lowResContentWrapperNode = domConstruct.create("div", null, lowResNode);
				domConstruct.create("img", {src: "images/arsnova.png", alt: "ARSnova"},
					domConstruct.create("h1", null,
						domConstruct.create("header", null, lowResContentWrapperNode)
					)
				);
				var lowResMessage = domConstruct.create("p", {id: "lowResolutionMessage"}, lowResContentWrapperNode);
				new Button({
					label: "ARSnova mobile",
					onClick: function() {
						location.href = config.arsnova.mobileUrl;
					}
				}).placeAt(
					domConstruct.create("p", null, lowResContentWrapperNode)
				).startup();
				var resizeLog = "";
				var resizeLogTimeout = null;
				var windowOnResize = function(event) {
					if (document.body.clientWidth < 950 || document.body.clientHeight < 600) {
						/* iPad does not swap screen.availWidth with screen.availHeight in landscape orientation */
						if ((screen.availWidth < 950 && screen.availHeight < 950) || screen.availHeight < 600) {
							resizeLog = "Small resolution detected: " + screen.availWidth + "x" + screen.availHeight;
							lowResMessage.innerHTML = "This application cannot be run because the resolution requirements are not met. ARSnova Presenter is optimized for notebook, tablet and desktop devices. If you are using a tablet and see this message, please try landscape orientation.";
						} else {
							resizeLog = "Small window detected: " + document.body.clientWidth + "x" + document.body.clientHeight;
							lowResMessage.innerHTML = "This application cannot be run because the resolution requirements are not met. Please increase the size of your browser's window or reduce the zoom factor (if zooming is active).";
						}
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
			},
			
			toggleFullScreenMode: function() {
				fullScreen.toggle();
			}
		};
		
		return self;
	}
);
