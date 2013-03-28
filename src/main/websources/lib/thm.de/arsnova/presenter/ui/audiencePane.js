define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/ui/audiencePaneFeedbackTab",
		"arsnova-presenter/ui/audiencePaneQuestionsTab"
	],
	function(on, when, domConstruct, domStyle, registry, BorderContainer, TabContainer, ContentPane, feedbackTab, questionsTab) {
		"use strict";
		
		var
			MIN_WIDTH = 470,
			self = null,
			sessionModel = null,
			audienceQuestionModel = null,
			feedbackModel = null,
			
			/* Dijit */
			audienceContainer = null,
			audienceHeaderPane = null,
			audienceTabs = null
		;
		
		self = {
			/* public "methods" */
			init: function(_sessionModel, _audienceQuestionModel, _feedbackModel) {
				console.log("-- UI: audiencePane.init --");
				
				sessionModel = _sessionModel;
				audienceQuestionModel = _audienceQuestionModel;
				feedbackModel = _feedbackModel;
				
				audienceContainer = new BorderContainer({
					id: "audienceContainer",
					region: "right",
					splitter: true,
					minSize: MIN_WIDTH
				});
				audienceHeaderPane = new ContentPane({
					region: "top",
					content: domConstruct.create("header", {innerHTML: "Audience"}),
					"class": "headerPane sidePanel"
				});
				audienceTabs = new TabContainer({
					id: "audienceTabs",
					region: "center"
				});
				
				registry.byId("mainContainer").addChild(audienceContainer);
				audienceContainer.addChild(audienceHeaderPane);
				audienceContainer.addChild(audienceTabs);
				
				feedbackTab.init(audienceTabs, feedbackModel);
				questionsTab.init(audienceTabs, audienceQuestionModel);
				
				var onWindowResize = function() {
					var maxSize = document.body.clientWidth - MIN_WIDTH;
					audienceContainer.set("maxSize", maxSize);
					var width = domStyle.get(audienceContainer.domNode, "width");
					if (width > maxSize) {
						domStyle.set(audienceContainer.domNode, "width", "49.5%");
						registry.byId("mainContainer").resize();
					}
				};
				on(window, "resize", onWindowResize);
				onWindowResize();
			},
			
			startup: function() {
				feedbackTab.startup();
				questionsTab.startup();
				
				sessionModel.watchKey(onSessionKeyChange);
			}
		};

		/* private "methods" */
		var onSessionKeyChange = function(name, oldValue, value) {
			var questions = audienceQuestionModel.getAll();
			when(questions, function(questions) {
				questionsTab.update(questions);
			});
		};
		
		return self;
	}
);
