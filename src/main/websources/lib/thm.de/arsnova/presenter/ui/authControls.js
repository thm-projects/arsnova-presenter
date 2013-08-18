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
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/form/Button",
		"dijit/Dialog",
		"version"
	],
	function (domConstruct, domStyle, registry, Button, Dialog, version) {
		"use strict";

		var
			self = null,
			authService = null
		;

		self = {
			/* public "methods" */
			init: function (_authService) {
				console.log("-- UI: authControls.init --");

				authService = _authService;
			},

			startup: function () {
				domConstruct.create("button", {id: "logoutButton", type: "button"}, "exitPanel");
				(new Button({label: "Logout"}, "logoutButton")).startup();
				registry.byId("logoutButton").onClick = authService.logout;
			},

			showLoginDialog: function () {
				domConstruct.create("img", {id: "loginLogo", src: "images/arsnova.png"}, document.body);
				var versionString = version.version;
				if (version.commitId) {
					versionString += " [" + version.commitId + "]";
				}
				var footerNode = domConstruct.create("div", {id: "loginFooter"}, document.body);
				footerNode.appendChild(document.createTextNode("ARSnova Presenter " + versionString));

				var loginDialogContent = domConstruct.create("div");
				domConstruct.create("div", {innerHTML: "Please choose a service to login with:"}, loginDialogContent);
				var loginDialog = new Dialog({
					title: "Presenter Login",
					content: loginDialogContent,
					draggable: false,
					onCancel: function () {
						console.debug("Cancel action is disabled");
					}
				});

				var serviceOnClickFunc = function (url) {
					/* a function has to be returned because of the closure */
					return function () {
						location.href = url + "&referer=" + encodeURIComponent(location.href);
					};
				};

				var services = authService.getServices();
				for (var service in services) {
					if (services.hasOwnProperty(service)) {
						(new Button({
							label: services[service].title,
							onClick: serviceOnClickFunc(services[service].url)
						})).placeAt(loginDialogContent);
					}
				}
				domStyle.set(loginDialog.closeButtonNode, "display", "none");
				loginDialog.show();
			}
		};

		return self;
	}
);
