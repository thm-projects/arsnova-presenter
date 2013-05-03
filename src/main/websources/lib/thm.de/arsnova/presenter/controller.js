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
		"dojo/ready",
		"dojo/when",
		"dojo/router",
		"dojo/dom-style",
		"arsnova-presenter/ui/main",
		"arsnova-presenter/ui/authControls",
		"arsnova-presenter/ui/sessionControls",
		"arsnova-presenter/ui/lecturerPane",
		"arsnova-presenter/ui/audiencePane",
		"arsnova-api/socket",
		"arsnova-api/auth",
		"arsnova-api/session",
		"arsnova-api/lecturerQuestion",
		"arsnova-api/audienceQuestion",
		"arsnova-api/feedback"
	],
	function(ready, when, router, domStyle, mainUi, authControls, sessionControls, lecturerPane, audiencePane, socket, authService, sessionModel, lecturerQuestionModel, audienceQuestionModel, feedbackModel) {
		"use strict";
		
		var init = function() {
			ready(function() {
				mainUi.init();
				authControls.init(authService);
			});
			authService.init(function() {
				/* user is not logged in an can not be logged in automatically */
				ready(function() {
					authControls.showLoginDialog();
					mainUi.hideSplash(true);
				});
			});
			ready(function() {
				if (authService.isLoggedIn()) {
					socket.connect();
					
					sessionControls.init(sessionModel);
					lecturerPane.init(sessionModel, lecturerQuestionModel);
					audiencePane.init(sessionModel, audienceQuestionModel, feedbackModel);

					mainUi.startup();
					sessionControls.startup();
					authControls.startup();
					lecturerPane.startup();
					audiencePane.startup();
					
					/* register routes in form #!/12345678;paramName=paramValue */
					router.register(/!\/([0-9]{8})((?:;[a-z0-9_-]+=[a-z0-9_-]*)*)/i, function(event) {
						/* parse parameters */
						var paramArray = event.params[1].split(";");
						var params = {};
						for (var i = 1; i < paramArray.length; i++) {
							var param = paramArray[i].split("=");
							params[param[0]] = param[1];
						}
						params.sessionKey = event.params[0];
						
						console.log("Router: loading session " + params.sessionKey);
						sessionModel.setKey(params.sessionKey);
						
						location.hash = "";
					});
					
					router.startup();
					mainUi.hideSplash();
				}
			});
		};
	
		return {
			startup: function() {
				console.log("-- Controller: startup --");
				
				init();
			}
		};
	}
);
