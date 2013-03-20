define(
	[
		"dojo/_base/config",
		"dojo/string",
		"dojo/on",
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/request/script",
		"dijit/registry",
		"dijit/form/DropDownButton",
		"dijit/form/Select",
		"dijit/Dialog",
		"dijit/Tooltip"
	],
	function(config, string, on, when, dom, domConstruct, domClass, domStyle, script, registry, DropDownButton, Select, Dialog, Tooltip) {
		"use strict";
		
		var
			self = null,
			sessionModel = null,
			sessionSelect = null
		;
		
		return {
			init: function(session) {
				console.log("-- UI: sessionControls.init --");
				
				self = this;
				sessionModel = session;

				/* Session info */
				var sessionInfoNode = domConstruct.create("div", {id: "sessionInfo"}, "headerPane");
				domConstruct.create("header", {id: "sessionTitle", innerHTML: "ARSnova Presenter"}, sessionInfoNode);
				domConstruct.create("span", {id: "activeUserCount", innerHTML: "-"}, sessionInfoNode);
				/* Session controls */
				var sessionPanelNode = domConstruct.create("div", {id: "sessionPanel"}, "headerPane");
				domConstruct.create("select", {id: "sessionSelect"}, sessionPanelNode);
				var sessionKeyNode = domConstruct.create("span", {id: "sessionKey", "class": "noSession", innerHTML: "00 00 00 00"}, sessionPanelNode);
				new Tooltip({
					connectId: [sessionKeyNode],
					position: ["below-centered"],
					label: "The session key you give to your audience"
				});
				
				(sessionSelect = new Select({
					options: [{label: "Select a session", value: "", selected: true, disabled: true}],
					maxHeight: 200,
					onChange: function(value) {
						sessionModel.setKey(value);
					}
				}, "sessionSelect")).startup();
				
				if ("undefined" !== typeof config.arsnova.mobileStudentSessionUrl) {
					var sessionQrNode = domConstruct.create("div", {id: "sessionQr", "class": "iconQr"}, sessionPanelNode);
					new Tooltip({
						connectId: [sessionQrNode],
						label: "Show QR Code for mobile ARSnova session",
						position: ["below-centered"]
					}).startup();
				}
				
				/* button is destroyed on creation since it is not needed
				 * until editing features are available */
//				new DropDownButton({
//					label: "New",
//					dropDown: registry.byId("newSessionDialog")
//				}, "newSessionButton");
//				registry.byId("createSessionButton").onClick = this.submitCreateSessionForm;

				this.updateSessionSelect(sessionModel.getOwned());
				sessionModel.watchKey(this.onKeyChange);
				sessionModel.watchActiveUserCount(function(name, oldValue, value) {
					dom.byId("activeUserCount").innerHTML = value;
				});
			},
			
			startup: function() {
				/* update mode menu item click events */
				var mobileLecturersViewMenuItem = registry.byId("mobileLecturersViewMenuItem");
				on(mobileLecturersViewMenuItem, "click", function() {
					self.openMobileSession(config.arsnova.mobileLecturerSessionUrl, value);
				});
				var mobileStudentsViewMenuItem = registry.byId("mobileStudentsViewMenuItem");
				on(mobileStudentsViewMenuItem, "click", function() {
					self.openMobileSession(config.arsnova.mobileStudentSessionUrl);
				});
				
				on(dom.byId("sessionQr"), "click", function() {
					var sessionKey = sessionModel.getKey();
					if (null == sessionKey) {
						return;
					}
					var url = string.substitute(config.arsnova.mobileStudentSessionUrl, {sessionKey: sessionKey});
					self.showQr(self.getAbsoluteUrl(url));
				});
			},
			
			updateSessionSelect: function(sessions) {
				when(sessions, function(sessions) {
					sessions.forEach(function(session) {
						sessionSelect.addOption({
							label: session.shortName,
							value: session.keyword
						});
					});
					console.log("UI: session list updated");
					
					var key = sessionModel.getKey();
					if (key) {
						sessionSelect.set("value", key);
					}
				});
			},
			
			submitCreateSessionForm: function() {
				var
					shortName = registry.byId("sessionNameField").value,
					description = registry.byId("sessionDescField").value
				;
				
				if (sessionModel.createSession(shortName, description)) {
					registry.byId("newSessionDialog").close();
				};
			},
			
			onKeyChange: function(name, oldValue, value) {
				sessionSelect.set("value", value);
				when(sessionModel.getCurrent(), function(session) {
					document.title = session.shortName + " - ARSnova Presenter";
					dom.byId("sessionTitle").innerHTML = session.name;
					var keyword = session.keyword.substr(0, 2)
						+ " " + session.keyword.substr(2, 2)
						+ " " + session.keyword.substr(4, 2)
						+ " " + session.keyword.substr(6, 2)
					;
					var sessionKeyNode = dom.byId("sessionKey");
					sessionKeyNode.innerHTML = keyword;
					domClass.remove(sessionKeyNode, "noSession");
				});
				
				/* enable mode menu items */
				var mobileLecturersViewMenuItem = registry.byId("mobileLecturersViewMenuItem");
				if ("undefined" !== typeof config.arsnova.mobileLecturerSessionUrl) {
					mobileLecturersViewMenuItem.set("disabled", false);
				}
				var mobileStudentsViewMenuItem = registry.byId("mobileStudentsViewMenuItem");
				if ("undefined" !== typeof config.arsnova.mobileStudentSessionUrl) {
					mobileStudentsViewMenuItem.set("disabled", false);
				}
			},
			
			openMobileSession: function(url) {
				url = string.substitute(url, {sessionKey: sessionModel.getKey()});
				
				if (document.body.clientWidth < 500 || document.body.clientHeight < 850) {
					window.open(url, "_blank");
					
					return;
				}
				
				var mobileFrame = domConstruct.create("iframe", {
					id: "mobileFrame",
					src: url,
					width: 480,
					height: 800
				});
				var mobileDialog = registry.byId("mobileDialog");
				if (null == mobileDialog) {
					mobileDialog = new Dialog({
						id: "mobileDialog",
						title: "ARSnova",
						style: "width: 480px; height: 830px",
						onHide: function() {
							domConstruct.destroy("mobileFrame");
						}
					});
				}
				mobileDialog.set("content", mobileFrame);
				mobileDialog.show();
			},
			
			showQr: function(data) {
				var QR_TYPE_NUMBER = 4;
				var QR_ERROR_CORRECT_LEVEL = "M";
				var QR_CELL_COUNT = 33;
				var QR_BORDER_SIZE_FACTOR = 2;
				var showQrOverlay = function() {
					var qrOverlayNode = domConstruct.create("div", {id: "qrOverlay"}, document.body);
					var qrOverlayContentNode = domConstruct.create("div", null, qrOverlayNode);
					on(qrOverlayNode, "click", function() {
						domConstruct.destroy(qrOverlayNode);
					});
					var maxSize = -50 + (document.body.clientWidth < document.body.clientHeight ? document.body.clientWidth : document.body.clientHeight);
					var cellSize = Math.floor(maxSize / (QR_CELL_COUNT + QR_BORDER_SIZE_FACTOR * 2));
					var qr = qrcode(QR_TYPE_NUMBER, QR_ERROR_CORRECT_LEVEL);
					qr.addData(data);
					qr.make();
					qrOverlayContentNode.innerHTML = qr.createTableTag(cellSize);
					domStyle.set(qrOverlayContentNode.firstChild, "border", (cellSize * QR_BORDER_SIZE_FACTOR) + "px solid white");
					domConstruct.create("p", {innerHTML: data}, qrOverlayContentNode);
				};
				if ("undefined" == typeof qrcode) {
					script.get("lib/d-project.com/qrcode-generator/qrcode.js").then(function() {
						console.log("QR Code generation library loaded");
						showQrOverlay();
					}, function(error) {
						console.error("QR Code generation library could not be loaded");
					});
				} else {
					showQrOverlay();
				}
			},
			
			getAbsoluteUrl: function(url) {
				var tag = domConstruct.create("a", {href: url}, document.body);
				return tag.href;
			}
		};
	}
);
