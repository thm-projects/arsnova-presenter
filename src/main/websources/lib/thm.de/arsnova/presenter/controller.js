define(
	[
		"dojo/ready",
		"dojo/when",
		"dojo/router",
		"arsnova-presenter/ui/main",
		"arsnova-presenter/ui/authControls",
		"arsnova-presenter/ui/sessionControls",
		"arsnova-presenter/ui/piPanel",
		"arsnova-presenter/ui/audiencePanel",
		"arsnova-api/socket",
		"arsnova-api/auth",
		"arsnova-api/session",
		"arsnova-api/lecturerQuestion",
		"arsnova-api/audienceQuestion",
		"arsnova-api/feedback"
	],
	function(ready, when, router, mainUi, authControls, sessionControls, piPane, audiencePane, socket, authService, sessionModel, lecturerQuestionModel, audienceQuestionModel, feedbackModel) {
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
				});
			});
			ready(function() {
				if (authService.isLoggedIn()) {
					socket.connect();
					
					sessionControls.init(sessionModel);
					piPane.init(sessionModel, lecturerQuestionModel);
					audiencePane.init(sessionModel, audienceQuestionModel, feedbackModel);

					mainUi.startup();
					sessionControls.startup();
					authControls.startup();
					piPane.startup();
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
						
						/* FIXME: This is not working yet. Full screen mode has to be activated by user interaction */
						if (params.present) {
							switch (params.present) {
							case "pi":
								console.log("Router: activating present mode for Peer Instruction");
								piPane.togglePresentMode();
								break;
							}
						}
						
						location.hash = "";
					});
					
					router.startup();
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
