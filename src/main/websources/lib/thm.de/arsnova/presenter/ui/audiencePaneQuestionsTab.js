define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/date/locale",
		"dijit/registry",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/MenuItem",
		"dgerhardt/common/confirmDialog",
		"dgerhardt/common/fullscreen",
	],
	function(on, when, dom, domConstruct, domClass, dateLocale, registry, ContentPane, MenuItem, confirmDialog, fullScreen) {
		"use strict";
		
		var
			self = null,
			audienceQuestionModel = null,
			
			/* DOM */
			questionListNode = null,
			
			/* Dijit */
			audienceQuestionsPane = null
		;
		
		self = {
			/* public "methods" */
			init: function(tabContainer, _audienceQuestionModel) {
				audienceQuestionModel = _audienceQuestionModel;
				
				audienceQuestionsPane = new ContentPane({
					id: "audienceQuestionsPane",
					title: "Questions"
				});
				tabContainer.addChild(audienceQuestionsPane);
			},
			
			startup: function() {
				questionListNode = domConstruct.create("div", {id: "audienceQuestionList"}, audienceQuestionsPane.domNode);
				
				audienceQuestionModel.onQuestionAvailable(function(questionId) {
					var question = audienceQuestionModel.get(questionId);
					question.then(function(question) {
						self.prependQuestionToList(question);
					});
				});
				
				/* add full screen menu items */
				var fullScreenMenu = registry.byId("fullScreenMenu");
				fullScreenMenu.addChild(new MenuItem({
					label: "Audience questions",
					onClick: this.togglePresentMode
				}));
				
				/* handle events fired when full screen mode is canceled */
				fullScreen.onChange(function(event, isActive) {
					if (!isActive) {
						self.exitFullScreenMode();
						
						audienceQuestionsPane.resize();
					}
				});
			},
			
			update: function(questions) {
				domConstruct.empty(questionListNode);
				when(questions, function(questions) {
					questions.forEach(function(question) {
						self.prependQuestionToList(question);
					});
				});
			},
			
			prependQuestionToList: function(question) {
				var questionNode = domConstruct.create("div", {"class": "question"}, questionListNode, "first");
				var subjectNode = domConstruct.create("p", {"class": "subject"}, questionNode);
				subjectNode.appendChild(document.createTextNode(question.subject));
				var deleteNode = domConstruct.create("span", {"class": "delete", innerHTML: "x"}, questionNode);
				domConstruct.create("div", {"class": "clearFix"}, questionNode);
				var messageNode = domConstruct.create("p", {"class": "message"}, questionNode);
				if (!question.read) {
					domClass.add(questionNode, "unread");
				}
				if (null != question.text) {
					domClass.add(questionNode, "loaded");
					messageNode.appendChild(document.createTextNode(question.text));
				}
				var date = new Date(question.timestamp);
				var dateTime = dateLocale.format(date, {selector: "date", formatLength: "long"})
					+ " " + dateLocale.format(date, {selector: "time", formatLength: "short"})
				;
				domConstruct.create("footer", {"class": "creationTime", innerHTML: dateTime}, questionNode);
				on(questionNode, "click", function(event) {
					self.openQuestion(question._id, questionNode, messageNode);
				});
				on(deleteNode, "click", function() {
					confirmDialog.confirm("Delete question", "Do you really want to delete this question?", {
						"Delete": function() {
							audienceQuestionModel.remove(question._id);
							domConstruct.destroy(questionNode);
						},
						"Cancel": null
					});
				});
			},
			
			openQuestion: function(questionId, questionNode, messageNode) {
				if (domClass.contains(questionNode, "opened")) {
					domClass.remove(questionNode, "opened");
					
					return;
				}
				if (domClass.contains(questionNode, "loaded")) {
					domClass.add(questionNode, "opened");
					
					return;
				}
				var question = audienceQuestionModel.get(questionId);
				when(question, function(question) {
					domClass.remove(questionNode, "unread");
					domClass.add(questionNode, "opened");
					domClass.add(questionNode, "loaded");
					messageNode.appendChild(document.createTextNode(question.text));
				});
			},
			
			togglePresentMode: function() {
				if (fullScreen.isActive()) {
					/* dom node rearrangement takes place in fullscreenchange event handler */
					fullScreen.exit();
				} else {
					fullScreen.request(dom.byId("fullScreenContainer"));
					domConstruct.create("header", {id: "audienceQuestionsTitle", innerHTML: "Audience questions"}, "fullScreenHeader");
					domConstruct.place(questionListNode, "fullScreenContent");
					
					registry.byId("fullScreenContainer").resize();
				}
			},
			
			exitFullScreenMode: function() {
				domConstruct.place(dom.byId("audienceQuestionList"), audienceQuestionsPane.domNode);
				domConstruct.destroy("audienceQuestionsTitle");
			}
		};
		
		return self;
	}
);
