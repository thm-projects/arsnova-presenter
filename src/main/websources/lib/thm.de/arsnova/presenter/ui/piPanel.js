define(
	[
		"dojo/when",
		"dojo/dom-construct",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Select",
		"arsnova-presenter/ui/lecturerPaneQuestionsTab",
		"arsnova-presenter/ui/lecturerPaneAnswersTab"
	],
	function(when, domConstruct, registry, BorderContainer, TabContainer, ContentPane, Select, questionsTab, answersTab) {
		"use strict";
		
		var
			self = null,
			sessionModel = null,
			lecturerQuestionModel = null,
			
			/* Dijit */
			piContainer = null,
			piHeaderPane = null,
			piTabs = null
		;
		
		self = {
			/* public "methods" */
			init: function(_sessionModel, _lecturerQuestionModel) {
				console.log("-- UI: lecturerPane.init --");
				
				sessionModel = _sessionModel;
				lecturerQuestionModel = _lecturerQuestionModel;
				
				piContainer = new BorderContainer({
					id: "piContainer",
					region: "center"
				});
				piHeaderPane = new ContentPane({
					region: "top",
					content: domConstruct.create("header", {innerHTML: "Lecturer: "}),
					"class": "headerPane sidePanel"
				});
				piTabs = new TabContainer({
					id: "piTabs",
					region: "center"
				});
				
				registry.byId("mainContainer").addChild(piContainer);
				piContainer.addChild(piHeaderPane);
				piContainer.addChild(piTabs);
				
				piHeaderPane.addChild(new Select({
					id: "lecturerPaneModeSelect",
					options: [
						{label: "Clicker Questions", value: "1", disabled: true},
						{label: "Peer Instruction (PI)", value: "2", selected: true},
						{label: "Pre-Class Assignments (JiTT)", value: "3", disabled: true},
					]
				}));
				
				questionsTab.init(piTabs, lecturerQuestionModel);
				answersTab.init(piTabs, lecturerQuestionModel);
			},
			
			startup: function() {
				questionsTab.startup();
				answersTab.startup();
				
				sessionModel.watchKey(onSessionKeyChange);
			}
		};

		/* private "methods" */
		var onSessionKeyChange = function(name, oldValue, value) {
			var questions = lecturerQuestionModel.getAll();
			when(questions, function(questions) {
				questionsTab.update(questions);
			});
		};
		
		return self;
	}
);
