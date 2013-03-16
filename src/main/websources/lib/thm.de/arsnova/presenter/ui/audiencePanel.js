define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/MenuItem",
		"dgerhardt/common/fullscreen",
		"arsnova-api/feedback",
		"arsnova-presenter/ui/chart/audienceFeedback"
	],
	function(on, when, dom, domConstruct, domClass, domStyle, registry, BorderContainer, TabContainer, ContentPane, MenuItem, fullScreen, feedbackModel, audienceFeedbackChart) {
		"use strict";
		
		var
			MIN_WIDTH = 370,
			self = null,
			audienceQuestionModel = null,
			audienceContainer = null
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
				
				var
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
						title: "Live Feedback"
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
				
				var onWindowResize = function() {
					var maxSize = document.body.clientWidth - MIN_WIDTH;
					audienceContainer.set("maxSize", maxSize);
					var width = domStyle.get("audienceContainer", "width");
					if (width > maxSize) {
						domStyle.set("audienceContainer", "width", "49.5%");
						registry.byId("mainContainer").resize();
					}
				};
				on(window, "resize", onWindowResize);
				onWindowResize();
			},
			
			startup: function() {
				domConstruct.create("div", {id: "audienceFeedbackChart"},
					domConstruct.create("div", {id: "audienceFeedbackPaneContent"}, "audienceFeedbackPane")
				);
				domConstruct.create("div", {id: "audienceQuestionList"}, "audienceQuestionsPane");
				
				audienceFeedbackChart.init();
				
				feedbackModel.onReceive(function(feedback) {
					var feedback0 = feedback[0];
					feedback[0] = feedback[1];
					feedback[1] = feedback0;
					self.updateFeedbackPanel(feedback);
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
						domConstruct.place(dom.byId("audienceFeedbackPaneContent"), dom.byId("audienceFeedbackPane"));
						domConstruct.destroy("audienceFeedbackTitle");

						domConstruct.place(dom.byId("audienceQuestionList"), dom.byId("audienceQuestionsPane"));
						domConstruct.destroy("audienceQuestionsTitle");
						
						audienceContainer.resize();
					}
				});
				fullScreen.onError(function(event) {
					domConstruct.place(dom.byId("audienceFeedbackPaneContent"), dom.byId("audienceFeedbackPane"));
					domConstruct.destroy("audienceFeedbackTitle");

					domConstruct.place(dom.byId("audienceQuestionList"), dom.byId("audienceQuestionsPane"));
					domConstruct.destroy("audienceQuestionsTitle");
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
			},
			
			toggleFeedbackPresentMode: function() {
				if (fullScreen.isSupported()) {
					if (fullScreen.isActive()) {
						/* dom node rearrangement takes place in fullscreenchange event handler */
						fullScreen.exit();
					} else {
						fullScreen.request(dom.byId("fullScreenContainer"));
						domConstruct.create("header", {id: "audienceFeedbackTitle", innerHTML: "Audience feedback"}, "fullScreenHeader");
						domConstruct.place(dom.byId("audienceFeedbackPaneContent"), dom.byId("fullScreenContent"));
						
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
						domConstruct.place(dom.byId("audienceQuestionList"), dom.byId("fullScreenContent"));
					}
				} else {
					console.log("Full screen mode not supported");
				}
			},
		};
	}
);
