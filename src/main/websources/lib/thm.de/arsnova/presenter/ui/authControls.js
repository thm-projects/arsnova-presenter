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
		"version",
		"dojo/i18n",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/auth"
	],
	function (domConstruct, domStyle, registry, Button, Dialog, version, i18n, commonMessages, messages) {
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
				(new Button({label: messages.logout}, "logoutButton")).startup();
				registry.byId("logoutButton").onClick = authService.logout;
			},

			showLoginDialog: function () {
				domConstruct.create("img", {id: "loginLogo", src: "images/arsnova.png"}, document.body);
				var versionString = version.version;
				if (version.commitId) {
					versionString += " [" + version.commitId + "]";
				}
				var footerNode = domConstruct.create("div", {id: "loginFooter"}, document.body);
				footerNode.appendChild(document.createTextNode(commonMessages.arsnova + " " + commonMessages.productNameValue + " " + versionString));

				var loginDialogContent = domConstruct.create("div");
				domConstruct.create("div", {innerHTML: messages.loginPromt}, loginDialogContent);
				var loginDialog = new Dialog({
					title: commonMessages.productNameValue + messages.loginTitle,
					content: loginDialogContent,
					closable: false,
					draggable: false
				});

				var serviceOnClickFunc = function (url) {
					/* a function has to be returned because of the closure */
					return function () {
						location.href = url; // + "&referer=" + encodeURIComponent(location.href);
					};
				};

				var services = authService.getServices();
				services.then(function (services) {
					services.forEach(function (service) {
						if ("guest" === service.id) {
							return;
						}
						(new Button({
							label: service.name,
							onClick: serviceOnClickFunc(service.dialogUrl)
						})).placeAt(loginDialogContent);
					});

					loginDialog.show();
				});
			}
		};

		return self;
	}
);
