define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/MenuItem",
		"arsnova-api/feedback",
		"arsnova-presenter/ui/chart/audienceFeedback"
	],
	function(on, when, dom, domConstruct, domClass, registry, BorderContainer, TabContainer, ContentPane, MenuItem, feedbackModel, audienceFeedbackChart) {
		"use strict";
		
		var self = null;
		var audienceQuestionModel = null;
		
		return {
			init: function(audienceQuestion) {
				console.log("-- UI: audiencePanel.init --");
				
				self = this;
				audienceQuestionModel = audienceQuestion;
				
				var
					audienceContainer = new BorderContainer({
						id: "audienceContainer",
						region: "right",
						splitter: true
					}),
					audienceHeaderPane = new ContentPane({
						region: "top",
						content: domConstruct.create("header", {innerHTML: "Audience"}),
						"class": "headerPane sidePanel"
					}),
					audienceTabs = new TabContainer({
						id: "audienceTabs",
						region: "center"
					}),
					audienceFeedbackPane = new ContentPane({
						id: "audienceFeedbackPane",
						title: "Feedback"
					}),
					audienceQuestionsPane = new ContentPane({
						id: "audienceQuestionsPane",
						title: "Questions"
					})
				;
				
				registry.byId("mainContainer").addChild(audienceContainer);
				audienceContainer.addChild(audienceHeaderPane);
				audienceContainer.addChild(audienceTabs);
				audienceTabs.addChild(audienceFeedbackPane);
				audienceTabs.addChild(audienceQuestionsPane);
			},
			
			startup: function() {
				domConstruct.create("div", {id: "audienceFeedbackChart"}, "audienceFeedbackPane");
				domConstruct.create("div", {id: "audienceQuestionList"}, "audienceQuestionsPane");
				
				var fullScreenMenu = registry.byId("fullScreenMenu");
				fullScreenMenu.addChild(new MenuItem({
					label: "Audience feedback",
					disabled: true
				}));
				fullScreenMenu.addChild(new MenuItem({
					label: "Audience questions",
					disabled: true
				}));
				
				audienceFeedbackChart.init();
				
				feedbackModel.onReceive(function(feedback) {
					var feedback0 = feedback[0];
					feedback[0] = feedback[1];
					feedback[1] = feedback0;
					self.updateFeedbackPanel(feedback);
				});
			},
			
			updateQuestionsPanel: function(questions) {
				var questionListNode = dom.byId("audienceQuestionList");
				questionListNode.innerHTML = "";
				when(questions, function(questions) {
					questions.forEach(function(question) {
						var questionNode = domConstruct.toDom("<div class='question'><p class='subject'>" + question.subject + "</p></div>");
						if (!question.read) {
							domClass.add(questionNode, "unread");
						}
						on(questionNode, "click", function(event) {
							self.openQuestion(question._id, questionNode);
						});
						domConstruct.place(questionNode, questionListNode);
					});
				});
			},
			
			updateFeedbackPanel: function(feedback) {
				audienceFeedbackChart.update(feedback);
			},
			
			openQuestion: function(questionId, questionNode) {
				var question = audienceQuestionModel.get(questionId);
				if (domClass.contains(questionNode, "opened")) {
					domConstruct.destroy(questionNode.children[1]);
					domClass.remove(questionNode, "opened");
					return;
				}
				when(question, function(question) {
					domClass.remove(questionNode, "unread");
					domClass.add(questionNode, "opened");
					domConstruct.create("p", {innerHTML: question.text}, questionNode);
				});
			}
		};
	}
);
