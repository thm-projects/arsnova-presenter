define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-class",
		"arsnova-presenter/ui/chart/audienceFeedback"
	],
	function(on, when, dom, domConstruct, domClass, audienceFeedbackChart) {
		"use strict";
		
		var audienceQuestionModel = null;
		
		return {
			init: function(audienceQuestion) {
				console.log("-- UI: audiencePanel.init --");
				
				audienceQuestionModel = audienceQuestion;
				
				audienceFeedbackChart.init();
				/* TODO: remove test data */
				this.updateFeedbackPanel([5, 2, 1, 2]);
			},
			
			updateQuestionsPanel: function(questions) {
				/* self is needed because of scope change */
				var self = this;
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
					domConstruct.place("<p>" + question.text + "</p>", questionNode);
				});
			}
		};
	}
);
