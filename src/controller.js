/*
 * This file is part of ARSnova Presenter.
 * Copyright 2013-2015 Daniel Gerhardt <code@dgerhardt.net>
 *
 * ARSnova Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Presenter is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/ready",
		"dojo/when",
		"dojo/router",
		"dgerhardt/common/confirmDialog",
		"arsnova-presenter/appState",
		"arsnova-presenter/ui/main",
		"arsnova-presenter/ui/authControls",
		"arsnova-presenter/ui/sessionControls",
		"arsnova-presenter/ui/tabController",
		"libarsnova/socket",
		"libarsnova/auth",
		"libarsnova/session",
		"dojo/i18n",
		"dojo/i18n!./ui/nls/common",
		"dojo/i18n!./ui/nls/session"
	],
	function (ready, when, router, confirmDialog, appState, mainUi, authControls, sessionControls, tabController, socket, authService, sessionModel, i18n, commonMessages, sessionMessages) {
		"use strict";

		var init = function () {
			ready(function () {
				mainUi.init();
				authControls.init(authService);
			});
			authService.init(function () {
				/* user is not logged in an can not be logged in automatically */
				ready(function () {
					authControls.showLoginDialog();
					mainUi.hideSplash(true);
				});
			});
			ready(function () {
				if (authService.isLoggedIn()) {
					socket.connect();

					sessionControls.init(sessionModel);
					tabController.init();

					mainUi.startup();
					sessionControls.startup();
					authControls.startup();
					tabController.startup();
					when(sessionModel.getOwned(), function (data) {
						if (!data || 0 === data.length) {
							var buttons = {};
							buttons[sessionMessages.createSession] = function () {
								/* TODO: use constant, see tabController, PI = 1 */
								tabController.selectMode(1);
								sessionControls.showNewSessionDialog();
							};
							buttons[commonMessages.cancel] = null;
							confirmDialog.confirm(
								sessionMessages.noSessions,
								sessionMessages.startWithNewSession,
								buttons,
								buttons[commonMessages.cancel]
							);
						}
					});

					/* register routes in form #!/12345678;paramName=paramValue */
					router.register(/!\/([0-9]{8})((?:;[a-z0-9_-]+=[a-z0-9_-]*)*)/i, function (event) {
						/* parse parameters */
						var paramArray = event.params[1].split(";");
						var params = {};
						for (var i = 1; i < paramArray.length; i++) {
							var param = paramArray[i].split("=");
							params[param[0]] = param[1];
						}
						params.sessionKey = event.params[0];

						console.log("Router: loading session " + params.sessionKey);
						/* TODO: remove model.setKey when completely replaced */
						sessionModel.setKey(params.sessionKey);
						appState.set("sessionId", params.sessionKey);

						location.hash = "";
					});

					router.startup();
					mainUi.hideSplash();
				}
			});
		};

		return {
			startup: function () {
				console.log("-- Controller: startup --");

				init();
			}
		};
	}
);
