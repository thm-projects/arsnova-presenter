define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/date/locale",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/MenuItem",
		"dgerhardt/common/confirmDialog",
		"dgerhardt/common/fullscreen",
		"arsnova-api/feedback",
		"arsnova-presenter/ui/chart/audienceFeedback"
	],
	function(on, when, dom, domConstruct, domClass, domStyle, dateLocale, registry, BorderContainer, TabContainer, ContentPane, MenuItem, confirmDialog, fullScreen, feedbackModel, audienceFeedbackChart) {
		"use strict";
		
		var
			MIN_WIDTH = 470,
			self = null,
			audienceQuestionModel = null,
			
			/* DOM */
			questionListNode = null,
			
			/* Dijit */
			audienceContainer = null,
			audienceHeaderPane = null,
			audienceTabs = null,
			audienceFeedbackPane = null,
			audienceQuestionsPane = null
		;
		
		return {
			init: function(audienceQuestion) {
				console.log("-- UI: audiencePanel.init --");
				
				self = this;
				audienceQuestionModel = audienceQuestion;
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
				audienceFeedbackPane = new ContentPane({
					id: "audienceFeedbackPane",
					title: "Live Feedback"
				});
				audienceQuestionsPane = new ContentPane({
					id: "audienceQuestionsPane",
					title: "Questions"
				});
				
				registry.byId("mainContainer").addChild(audienceContainer);
				audienceContainer.addChild(audienceHeaderPane);
				audienceContainer.addChild(audienceTabs);
				audienceTabs.addChild(audienceFeedbackPane);
				audienceTabs.addChild(audienceQuestionsPane);
				
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
				var feedbackPaneContentNode = domConstruct.create("div", {id: "audienceFeedbackPaneContent"}, audienceFeedbackPane.domNode);
				questionListNode = domConstruct.create("div", {id: "audienceQuestionList"}, audienceQuestionsPane.domNode);
				
				audienceFeedbackChart.init(feedbackPaneContentNode);
				
				feedbackModel.onReceive(function(feedback) {
					var feedback0 = feedback[0];
					feedback[0] = feedback[1];
					feedback[1] = feedback0;
					self.updateFeedbackPanel(feedback);
				});
				
				audienceQuestionModel.onQuestionAvailable(function(questionId) {
					var question = audienceQuestionModel.get(questionId);
					question.then(function(question) {
						self.prependQuestionToList(question);
					});
				});
				
				/* add full screen menu items */
				var fullScreenMenu = registry.byId("fullScreenMenu");
				fullScreenMenu.addChild(new MenuItem({
					label: "Audience feedback",
					onClick: this.toggleFeedbackPresentMode
				}));
				fullScreenMenu.addChild(new MenuItem({
					label: "Audience questions",
					onClick: this.toggleQuestionsPresentMode
				}));
				
				/* handle events fired when full screen mode is canceled */
				fullScreen.onChange(function(event, isActive) {
					if (!isActive) {
						domConstruct.place(dom.byId("audienceFeedbackPaneContent"), audienceFeedbackPane.domNode);
						domConstruct.destroy("audienceFeedbackTitle");

						domConstruct.place(dom.byId("audienceQuestionList"), audienceQuestionsPane.domNode);
						domConstruct.destroy("audienceQuestionsTitle");
						
						audienceContainer.resize();
					}
				});
				fullScreen.onError(function(event) {
					domConstruct.place(dom.byId("audienceFeedbackPaneContent"), audienceFeedbackPane.domNode);
					domConstruct.destroy("audienceFeedbackTitle");

					domConstruct.place(dom.byId("audienceQuestionList"), audienceQuestionsPane.domNode);
					domConstruct.destroy("audienceQuestionsTitle");
				});
			},
			
			prependQuestionToList: function(question) {
				var questionNode = domConstruct.create("div", {"class": "question"}, questionListNode, "first");
				domConstruct.create("p", {"class": "subject", innerHTML: question.subject}, questionNode);
				var deleteNode = domConstruct.create("span", {"class": "delete", innerHTML: "x"}, questionNode);
				domConstruct.create("div", {"class": "clearFix"}, questionNode);
				var messageNode = domConstruct.create("p", {"class": "message"}, questionNode);
				if (!question.read) {
					domClass.add(questionNode, "unread");
				}
				if (null != question.text) {
					domClass.add(questionNode, "loaded");
					messageNode.innerHTML = question.text;
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
			
			updateQuestionsPanel: function(questions) {
				questionListNode.innerHTML = "";
				when(questions, function(questions) {
					questions.forEach(function(question) {
						self.prependQuestionToList(question);
					});
				});
			},
			
			updateFeedbackPanel: function(feedback) {
				audienceFeedbackChart.update(feedback);
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
					messageNode.innerHTML = question.text;
				});
			},
			
			toggleFeedbackPresentMode: function() {
				if (fullScreen.isSupported()) {
					if (fullScreen.isActive()) {
						/* dom node rearrangement takes place in fullscreenchange event handler */
						fullScreen.exit();
					} else {
						fullScreen.request(dom.byId("fullScreenContainer"));
						domConstruct.create("header", {id: "audienceFeedbackTitle", innerHTML: "Audience feedback"}, "fullScreenHeader");
						domConstruct.place(dom.byId("audienceFeedbackPaneContent"), "fullScreenContent");
						
						registry.byId("fullScreenContainer").resize();
					}
				} else {
					console.log("Full screen mode not supported");
				}
			},
			
			toggleQuestionsPresentMode: function() {
				if (fullScreen.isSupported()) {
					if (fullScreen.isActive()) {
						/* dom node rearrangement takes place in fullscreenchange event handler */
						fullScreen.exit();
					} else {
						fullScreen.request(dom.byId("fullScreenContainer"));
						domConstruct.create("header", {id: "audienceQuestionsTitle", innerHTML: "Audience questions"}, "fullScreenHeader");
						domConstruct.place(questionListNode, "fullScreenContent");
					}
				} else {
					console.log("Full screen mode not supported");
				}
			}
		};
	}
);
