define(
	[
		"dojo/ready",
		"dojo/when",
		"arsnova-presenter/ui/main",
		"arsnova-presenter/ui/authControls",
		"arsnova-presenter/ui/sessionControls",
		"arsnova-presenter/ui/piPanel",
		"arsnova-presenter/ui/audiencePanel",
		"arsnova-api/auth",
		"arsnova-api/session",
		"arsnova-api/lecturerQuestion",
		"arsnova-api/audienceQuestion"
	],
	function(ready, when, mainUi, authControls, sessionControls, piPanel, audiencePanel, authService, sessionModel, lecturerQuestionModel, audienceQuestionModel) {
		"use strict";
		
		var
			init = function() {
				authService.init(function() {
					/* user is not logged in an can not be logged in automatically */
					ready(function() {
						authControls.init(authService);
						authControls.showLoginDialog();
					});
				});
				ready(function() {
					mainUi.init();
					authControls.init(authService);
					
					if (authService.isLoggedIn()) {
						sessionControls.init(sessionModel);
						piPanel.init(lecturerQuestionModel);
						audiencePanel.init(audienceQuestionModel);
						
						sessionModel.watchKey(onSessionKeyChange);
					}
				});
			},
			
			onSessionKeyChange = function(name, oldValue, value) {
				lecturerQuestionModel.setSessionKey(value);
				audienceQuestionModel.setSessionKey(value);
				var lQuestions = lecturerQuestionModel.getAll();
				var aQuestions = audienceQuestionModel.getAll();
				piPanel.updateQuestionsPanel(lQuestions);
				audiencePanel.updateQuestionsPanel(aQuestions);
				when(lQuestions, function(questions) {
					lecturerQuestionModel.setId(questions[0]._id);
				});
			}
		;
	
		return {
			startup: function() {
				console.log("-- Controller: startup --");
				
				init();
			}
		};
	}
);
