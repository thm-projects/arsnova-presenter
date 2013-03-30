define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom-construct",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/ui/mathJax",
		"arsnova-presenter/ui/lecturerPaneAnswersTab"
	],
	function(on, when, domConstruct, ContentPane, mathJax, answersTab) {
		"use strict";
		
		var
			self = null,
			model = null,
			
			/* DOM */
			questionListNode = null,
			
			/* Dijit */
			tabContainer = null,
			questionsPane = null
		;
		
		self = {
			/* public "methods" */
			init: function(_tabContainer, lecturerQuestionModel) {
				tabContainer = _tabContainer;
				model = lecturerQuestionModel;

				questionsPane = new ContentPane({
					id: "piQuestionsPane",
					title: "Questions"
				});
				tabContainer.addChild(questionsPane);
			},
			
			startup: function() {
				questionListNode = domConstruct.create("div", {id: "piQuestionList"}, questionsPane.domNode);
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
							mathJax.parse(questionNode);
							on(questionNode, "click", function(event) {
								model.setId(question._id);
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
