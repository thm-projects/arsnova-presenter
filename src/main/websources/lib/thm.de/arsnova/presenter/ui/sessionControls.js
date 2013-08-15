/*
 * Copyright 2013 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
 *
 * This file is part of ARSnova Presenter.
 *
 * Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/_base/config",
		"dojo/string",
		"dojo/on",
		"dojo/when",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/request/script",
		"dojo/store/Memory",
		"dijit/registry",
		"dijit/form/FilteringSelect",
		"dijit/Dialog",
		"dijit/Tooltip"
	],
	function(config, string, on, when, domConstruct, domClass, domStyle, script, Memory, registry, FilteringSelect, Dialog, Tooltip) {
		"use strict";

		var
			self = null,
			model = null,
			memory = null,

			/* DOM */
			infoNode = null,
			titleNode = null,
			panelNode = null,
			keyNode = null,
			qrNode = null,
			activeUserCountNode = null,

			/* Dijit */
			select = null,
			mobileDialog = null
		;

		self = {
			/* public "methods" */
			init: function(sessionModel) {
				console.log("-- UI: sessionControls.init --");

				model = sessionModel;

				/* Session info */
				infoNode = domConstruct.create("div", {id: "sessionInfo"}, "headerPane");
				titleNode = domConstruct.create("header", {id: "sessionTitle", innerHTML: "ARSnova Presenter"}, infoNode);
				activeUserCountNode = domConstruct.create("span", {id: "activeUserCount", innerHTML: "-"}, infoNode);
				/* Session controls */
				panelNode = domConstruct.create("div", {id: "sessionPanel"}, "headerPane");
				(select = new FilteringSelect({
					id: "sessionSelect",
					placeHolder: "Session",
					store: memory = new Memory(),
					labelAttr: "label",
					labelType: "html",
					searchAttr: "shortName",
					maxHeight: 200,
					style: "width: 140px;",
					onChange: function(value) {
						if (value) {
							model.setKey(value);
						}
					}
				})).placeAt(panelNode).startup();
				keyNode = domConstruct.create("span", {id: "sessionKey", "class": "noSession", innerHTML: "00 00 00 00"}, panelNode);
				new Tooltip({
					connectId: [keyNode],
					position: ["below-centered"],
					label: "The session key you give to your audience"
				});

				if ("undefined" !== typeof config.arsnova.mobileStudentSessionUrl) {
					qrNode = domConstruct.create("div", {id: "sessionQr", "class": "iconQr"}, panelNode);
					new Tooltip({
						connectId: [qrNode],
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

				self.updateSelect(model.getOwned());
				model.watchKey(self.onKeyChange);
				model.watchActiveUserCount(function(name, oldValue, value) {
					activeUserCountNode.innerHTML = value;
				});
			},

			startup: function() {
				/* update mode menu item click events */
				var mobileLecturersViewMenuItem = registry.byId("mobileLecturersViewMenuItem");
				on(mobileLecturersViewMenuItem, "click", function() {
					self.openMobileSession(config.arsnova.mobileLecturerSessionUrl);
				});
				var mobileStudentsViewMenuItem = registry.byId("mobileStudentsViewMenuItem");
				on(mobileStudentsViewMenuItem, "click", function() {
					self.openMobileSession(config.arsnova.mobileStudentSessionUrl);
				});

				on(qrNode, "click", function() {
					var sessionKey = model.getKey();
					if (null === sessionKey) {
						return;
					}
					var url = string.substitute(config.arsnova.mobileStudentSessionUrl, {sessionKey: sessionKey});
					self.showQr(self.getAbsoluteUrl(url));
				});
			},

			updateSelect: function(sessions) {
				when(sessions, function(sessions) {
					sessions.forEach(function(session) {
						var keywordNode = document.createTextNode("(" + session.keyword + ")");
						var shortNameNode = document.createElement("strong");
						shortNameNode.appendChild(document.createTextNode(session.shortName));
						var nameNode = document.createTextNode(session.name);

						var labelNode = document.createElement("span");
						labelNode.appendChild(shortNameNode);
						labelNode.appendChild(document.createTextNode(" "));
						labelNode.appendChild(keywordNode);
						labelNode.appendChild(document.createElement("br"));
						labelNode.appendChild(nameNode);

						memory.put({
							id: session.keyword,
							shortName: session.shortName,
							name: session.name,
							label: labelNode.innerHTML
						});
					});
					console.log("UI: session list updated");

					var key = model.getKey();
					if (key) {
						select.set("value", key);
					}
				});
			},

			submitCreateSessionForm: function() {
				var
					shortName = registry.byId("sessionNameField").value,
					description = registry.byId("sessionDescField").value
				;

				if (model.createSession(shortName, description)) {
					registry.byId("newSessionDialog").close();
				};
			},

			onKeyChange: function(name, oldValue, value) {
				select.set("value", value);
				when(model.getCurrent(), function(session) {
					document.title = session.shortName + " - ARSnova Presenter";
					domConstruct.empty(titleNode);
					titleNode.appendChild(document.createTextNode(session.name));
					var keyword = session.keyword.substr(0, 2)
						+ " " + session.keyword.substr(2, 2)
						+ " " + session.keyword.substr(4, 2)
						+ " " + session.keyword.substr(6, 2)
					;
					keyNode.innerHTML = keyword;
					domClass.remove(keyNode, "noSession");
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
				url = string.substitute(url, {sessionKey: model.getKey()});

				if (document.body.clientWidth < 500 || document.body.clientHeight < 850) {
					window.open(url, "_blank");

					return;
				}

				var mobileFrameNode = domConstruct.create("iframe", {
					id: "mobileFrame",
					src: url,
					width: 480,
					height: 800
				});
				if (null === mobileDialog) {
					mobileDialog = new Dialog({
						id: "mobileDialog",
						title: "ARSnova",
						style: "width: 480px; height: 830px",
						onHide: function() {
							domConstruct.destroy("mobileFrame");
						}
					});
				}
				mobileDialog.set("content", mobileFrameNode);
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
					var urlNode = domConstruct.create("p", {innerHTML: data}, qrOverlayContentNode);
					domStyle.set(urlNode, "width", ((QR_CELL_COUNT + QR_BORDER_SIZE_FACTOR * 2) * cellSize) + "px");
				};
				if ("undefined" === typeof qrcode) {
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

		return self;
	}
);
