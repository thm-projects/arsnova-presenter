define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom-construct",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/ui/lecturerPaneAnswersTab"
	],
	function(on, when, domConstruct, ContentPane, answersTab) {
		"use strict";
		
		var
			self = null,
			lecturerQuestionModel = null,
			
			/* DOM */
			questionListNode = null,
			
			/* Dijit */
			tabContainer = null,
			piQuestionsPane = null
		;
		
		self = {
			/* public "methods" */
			init: function(_tabContainer, _lecturerQuestionModel) {
				tabContainer = _tabContainer;
				lecturerQuestionModel = _lecturerQuestionModel;

				piQuestionsPane = new ContentPane({
					id: "piQuestionsPane",
					title: "Questions"
				});
				tabContainer.addChild(piQuestionsPane);
			},
			
			startup: function() {
				questionListNode = domConstruct.create("div", {id: "piQuestionList"}, piQuestionsPane.domNode);
			},
			
			update: function(questions) {
				domConstruct.empty(questionListNode);
				
				if (null == questions) {
					return;
				}
				
				when(questions, function(questions) {
					/* group questions by category */
					var categories = {};
					questions.forEach(function(question) {
						if (!categories[question.subject]) {
							categories[question.subject] = [];
						}
						categories[question.subject].push(question);
					});
					
					for (var category in categories) {
						var categoryNode = domConstruct.create("div", {"class": "questionCategory"}, questionListNode);
						var categoryHeaderNode = domConstruct.create("header", null, categoryNode);
						categoryHeaderNode.appendChild(document.createTextNode(category));
						categories[category].forEach(function(question) {
							var questionNode = domConstruct.create("p", {"class": "question"}, categoryNode);
							questionNode.appendChild(document.createTextNode(question.text));
							on(questionNode, "click", function(event) {
								lecturerQuestionModel.setId(question._id);
								answersTab.selectTab();
							});
						});
					}
				});
			}
		};
		
		return self;
	}
);
