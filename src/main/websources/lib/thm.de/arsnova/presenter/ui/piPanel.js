define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Button",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/ui/chart/piAnswers"
	],
	function(on, when, dom, domConstruct, domStyle, registry, BorderContainer, TabContainer, ContentPane, Button, fullscreen, piAnswersChart) {
		"use strict";
		
		var
			self = null,
			lecturerQuestionModel = null,
			fullscreenNode = null
		;
		
		return {
			init: function(lecturerQuestion) {
				console.log("-- UI: piPanel.init --");
				
				self = this;
				lecturerQuestionModel = lecturerQuestion;
				fullscreenNode = dom.byId("fullscreenContainer");
				
				var
					piContainer = new BorderContainer({
						id: "piContainer",
						region: "center"
					}),
					piHeaderPane = new ContentPane({
						region: "top",
						content: "Peer Instruction",
						"class": "headerPane sidePanel"
					}),
					piTabs = new TabContainer({
						id: "piTabs",
						region: "center"
					}),
					piQuestionsPane = new ContentPane({
						id: "piQuestionsPane",
						title: "Questions"
					}),
					piAnswersContainer = new BorderContainer({
						id: "piAnswersContainer",
						title: "Answers"
					}),
					piAnswersControlPane = new ContentPane({
						id: "piAnswersControlPane",
						region: "top"
					}),
					piAnswersMainPane = new ContentPane({
						id: "piAnswersMainPane",
						region: "center"
					})
				;
				
				registry.byId("mainContainer").addChild(piContainer);
				piContainer.addChild(piHeaderPane);
				piContainer.addChild(piTabs);
				piTabs.addChild(piQuestionsPane);
				piTabs.addChild(piAnswersContainer);
				piAnswersContainer.addChild(piAnswersControlPane);
				piAnswersContainer.addChild(piAnswersMainPane);
			},
			
			startup: function() {
				domConstruct.create("div", {id: "piQuestionList"}, "piQuestionsPane");
				domConstruct.create("div", {id: "piAnswersMainPaneContent"}, "piAnswersMainPane");
				domConstruct.create("div", {id: "piAnswersChart"}, "piAnswersMainPaneContent");
				
				var controlPaneContentNode = domConstruct.create("div", {id: "piAnswersControlPaneContent"}, "piAnswersControlPane");
				var answersNav = domConstruct.create("div", {id: "piAnswersNavigation"}, controlPaneContentNode);
				var answersHeader = domConstruct.create("header", {id: "piAnswersQuestion"}, controlPaneContentNode);
				var answersSettings = domConstruct.create("div", {id: "piAnswersSettings"}, controlPaneContentNode);
				
				new Button({
					label: "&#x25C0;"
				}, domConstruct.create("button", {id: "prevPiQuestionButton", type: "button"}, answersNav));
				new Button({
					label: "&#x25B6;"
				}, domConstruct.create("button", {id: "nextPiQuestionButton", type: "button"}, answersNav));
				
				domConstruct.create("span", {id: "piAnswersQuestionSubject", innerHTML: "Question subject"}, answersHeader);
				domConstruct.create("span", {id: "piAnswersQuestionTitleSeperator", innerHTML: ": "}, answersHeader);
				domConstruct.create("span", {id: "piAnswersQuestionText", innerHTML: "Question text"}, answersHeader);

				domConstruct.create("span", {id: "piAnswersCount", innerHTML: "-"}, answersSettings);
				
				on(registry.byId("nextPiQuestionButton"), "click", function(event) {
					lecturerQuestionModel.next();
				});
				
				on(registry.byId("prevPiQuestionButton"), "click", function(event) {
					lecturerQuestionModel.prev();
				});
				
				on(registry.byId("answersPanelFullscreenButton"), "click", function(event) {
					self.togglePresentMode();
				});
				
				fullscreen.onChange(function(event, isActive) {
					if (!isActive) {
						domStyle.set(dom.byId("piAnswersQuestionSubject"), "display", "none");
						domStyle.set(dom.byId("piAnswersQuestionTitleSeperator"), "display", "none");
						domConstruct.place(dom.byId("piAnswersControlPaneContent"), dom.byId("piAnswersControlPane"));
						domConstruct.place(dom.byId("piAnswersMainPaneContent"), dom.byId("piAnswersMainPane"));
					}
				});
				
				fullscreen.onError(function(event) {
					domConstruct.place(dom.byId("piAnswersControlPaneContent"), dom.byId("piAnswersControlPane"));
					domConstruct.place(dom.byId("piAnswersMainPaneContent"), dom.byId("piAnswersMainPane"));
				});
				
				lecturerQuestionModel.watchId(this.onLecturerQuestionIdChange);
				
				piAnswersChart.init();
			},
			
			updateQuestionsPanel: function(questions) {
				var questionList = dom.byId("piQuestionList");
				questionList.innerHTML = "";
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
						var categoryNode = domConstruct.toDom("<div class='questionCategory'><header>" + category + "</header></div>");
						domConstruct.place(categoryNode, questionList);
						categories[category].forEach(function(question) {
							var questionNode = domConstruct.toDom("<p class='question'>" + question.text + "</p>");
							on(questionNode, "click", function(event) {
								lecturerQuestionModel.setId(question._id);
								registry.byId("piTabs").selectChild(registry.byId("piAnswersContainer"));
							});
							domConstruct.place(questionNode, categoryNode);
						});
					}
				});
			},
			
			updateAnswersPanel: function(question, answers) {
				var labelReverseMapping = {};
				var labels = [];
				var values = [];
				
				/* transform the label and answer count data into arrays usable by dojox/charting */
				when(question, function(question) {
					dom.byId("piAnswersQuestionSubject").innerHTML = question.subject;
					dom.byId("piAnswersQuestionText").innerHTML = question.text;
					
					question.possibleAnswers.forEach(function(possibleAnswer, i) {
						labelReverseMapping[possibleAnswer.text] = i;
						labels.push({value: i + 1, text: possibleAnswer.text});
						values[i] = 0;
					});
					
					when(answers, function(answers) {
						var totalAnswerCount = 0;
						answers.forEach(function(answer) {
							totalAnswerCount += answer.answerCount;
							values[labelReverseMapping[answer.answerText]] = answer.answerCount;
						}, values);
						dom.byId("piAnswersCount").innerHTML = totalAnswerCount;
						
						piAnswersChart.update(labels, values);
					});
				});
			},
			
			togglePresentMode: function() {
				if (fullscreen.isSupported()) {
					if (fullscreen.isActive()) {
						/* dom node rearrangement takes place in fullscreenchange event handler */
						fullscreen.exit();
					} else {
						fullscreen.request(fullscreenNode);
						domStyle.set(dom.byId("piAnswersQuestionSubject"), "display", "inline");
						domStyle.set(dom.byId("piAnswersQuestionTitleSeperator"), "display", "inline");
						domConstruct.place(dom.byId("piAnswersControlPaneContent"), dom.byId("fullscreenControl"));
						domConstruct.place(dom.byId("piAnswersMainPaneContent"), dom.byId("fullscreenContent"));
					}
				} else {
					console.log("Fullscreen mode not supported");
				}
			},
			
			onLecturerQuestionIdChange: function(name, oldValue, value) {
				self.updateAnswersPanel(lecturerQuestionModel.get(), lecturerQuestionModel.getAnswers());
			},
		};
	}
);
