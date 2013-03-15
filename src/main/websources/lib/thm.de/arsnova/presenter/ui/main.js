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

				/* Add dom nodes needed for full screen mode */
				var fullScreenContainer = new BorderContainer({
					id: "fullScreenContainer"
				});
				fullScreenContainer.addChild(new ContentPane({
					id: "fullScreenControl",
					region: "top"
				}));
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
				var appContainer = registry.byId("appContainer");
				appContainer.startup();
				
				/* Add header content */
				var exitPanelNode = domConstruct.create("div", {id: "exitPanel"}, "headerPane");
				
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
				domConstruct.create("span", {id: "productLogo", title: "ARSnova"}, "footerPane");
				domConstruct.create("span", {id: "productName", "class": "groupPanel", innerHTML: "Presenter"}, "footerPane");
				domConstruct.create("span", {id: "productVersionDetails", "class": "groupPanel", innerHTML: "Version: " + versionString}, "footerPane");
				var timeNode = domConstruct.create("div", {id: "footerTime"}, "footerPane");
				setInterval(function() {
					timeNode.innerHTML = dateLocale.format(new Date(), {selector: "time", formatLength: "short"});
					new Tooltip({
						connectId: ["footerTime"],
						label: dateLocale.format(new Date(), {selector: "date", formatLength: "short"}),
						position: ["above-centered"]
					});
				}, 500);
				
				/* prevent window scrolling (needed for IE) */
				on(window, "scroll", function(event) {
					scrollTo(0, 0);
					console.debug("Prevented document scrolling");
				});

				/* Full screen mode */
				registry.byId("fullScreenContainer").startup();
				var fullScreenLogo = domConstruct.create("img", {id: "fullScreenLogo", src: "images/arsnova.png"}, "fullScreenContainer");
				fullScreen.onChange(function(event, isActive) {
					var fullScreenNode = dom.byId("fullScreenContainer");
					if (isActive) {
						console.log("Full screen mode enabled");
						domStyle.set(fullScreenNode, "display", "block");
						
						/* calculate logo size */
						var docGeometry = domGeometry.getContentBox(document.body);
						var vRatio = docGeometry.h / 30.0;
						var ratio = fullScreenLogo.offsetWidth / fullScreenLogo.offsetHeight;
						domStyle.set(fullScreenLogo, "height", vRatio);
						domStyle.set(fullScreenLogo, "width", (vRatio * ratio) + "px");
						domStyle.set(fullScreenLogo, "display", "block");
					} else {
						console.log("Full screen mode disabled");
						domStyle.set(fullScreenNode, "display", "none");
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
					if (screen.availWidth < 780 || screen.availHeight < 460) {
						resizeLog = "Small resolution detected: " + screen.availWidth + "x" + screen.availHeight;
						lowResMessage.innerHTML = "This application cannot be run because the resolution requirements are not met. ARSnova Presenter is optimized for notebook, tablet and desktop devices.";
						domStyle.set(appContainer, "visibility", "hidden");
						domStyle.set(lowResNode, "visibility", "visible");
					} else if (document.body.clientWidth < 780 || document.body.clientHeight < 460) {
						resizeLog = "Small window detected: " + document.body.clientWidth + "x" + document.body.clientHeight;
						lowResMessage.innerHTML = "This application cannot be run because the resolution requirements are not met. Please increase the size of your browser's window.";
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
	}
);
