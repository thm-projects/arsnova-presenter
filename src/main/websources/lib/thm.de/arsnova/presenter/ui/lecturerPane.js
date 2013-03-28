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
			container = null,
			headerPane = null,
			tabs = null
		;
		
		self = {
			/* public "methods" */
			init: function(_sessionModel, _lecturerQuestionModel) {
				console.log("-- UI: lecturerPane.init --");
				
				sessionModel = _sessionModel;
				lecturerQuestionModel = _lecturerQuestionModel;
				
				container = new BorderContainer({
					id: "lecturerContainer",
					region: "center"
				});
				headerPane = new ContentPane({
					region: "top",
					content: domConstruct.create("header", {innerHTML: "Lecturer: "}),
					"class": "headerPane sidePanel"
				});
				tabs = new TabContainer({
					id: "lecturerTabs",
					region: "center"
				});
				
				registry.byId("mainContainer").addChild(container);
				container.addChild(headerPane);
				container.addChild(tabs);
				
				headerPane.addChild(new Select({
					id: "lecturerPaneModeSelect",
					options: [
						{label: "Clicker Questions", value: "1", disabled: true},
						{label: "Peer Instruction (PI)", value: "2", selected: true},
						{label: "Pre-Class Assignments (JiTT)", value: "3", disabled: true},
					]
				}));
				
				questionsTab.init(tabs, lecturerQuestionModel);
				answersTab.init(tabs, lecturerQuestionModel);
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
