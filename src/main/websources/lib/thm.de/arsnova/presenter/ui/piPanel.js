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
		"dijit/form/ComboButton",
		"dijit/form/Select",
		"dijit/Menu",
		"dijit/MenuItem",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/ui/chart/piAnswers"
	],
	function(on, when, dom, domConstruct, domStyle, registry, BorderContainer, TabContainer, ContentPane, Button, ComboButton, Select, Menu, MenuItem, fullScreen, piAnswersChart) {
		"use strict";
		
		var
			self = null,
			lecturerQuestionModel = null,
			piContainer = null
		;
		
		return {
			init: function(lecturerQuestion) {
				console.log("-- UI: piPanel.init --");
				
				self = this;
				lecturerQuestionModel = lecturerQuestion;
				
				piContainer = new BorderContainer({
					id: "piContainer",
					region: "center"
				});
				
				var
					piHeaderPane = new ContentPane({
						region: "top",
						content: domConstruct.create("header", {innerHTML: "Lecturer: "}),
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
					piAnswersTitlePane = new ContentPane({
						id: "piAnswersTitlePane",
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
				piAnswersContainer.addChild(piAnswersTitlePane);
				piAnswersContainer.addChild(piAnswersMainPane);
				piHeaderPane.addChild(new Select({
					id: "lecturerPaneModeSelect",
					options: [
						{label: "Clicker Questions", value: "1", disabled: true},
						{label: "Peer Instruction (PI)", value: "2", selected: true},
						{label: "Pre-Class Assignments (JiTT)", value: "3", disabled: true},
					]
				}));
			},
			
			startup: function() {
				domConstruct.create("div", {id: "piQuestionList"}, "piQuestionsPane");
				var piAnswersMainPaneContentNode = domConstruct.create("div", {id: "piAnswersMainPaneContent"}, "piAnswersMainPane");
				
				var controlPaneContentNode = domConstruct.create("div", {id: "piAnswersControlPaneContent"}, "piAnswersControlPane");
				var answersNav = domConstruct.create("div", {id: "piAnswersNavigation"}, controlPaneContentNode);
				var answersSettings = domConstruct.create("div", {id: "piAnswersSettings"}, controlPaneContentNode);
				
				new Button({
					id: "firstPiQuestionButton",
					label: "First question",
					showLabel: false,
					iconClass: "iconFirst",
					onClick: function() {
						lecturerQuestionModel.first();
					}
				}).placeAt(answersNav).startup();
				new Button({
					id: "prevPiQuestionButton",
					label: "Previous question",
					showLabel: false,
					iconClass: "iconPrev",
					onClick: function() {
						lecturerQuestionModel.prev();
					}
				}).placeAt(answersNav).startup();
				domConstruct.create("span", {id: "piNavigationStatus", innerHTML: "0/0"}, answersNav);
				new Button({
					id: "nextPiQuestionButton",
					label: "Next question",
					showLabel: false,
					iconClass: "iconNext",
					onClick: function() {
						lecturerQuestionModel.next();
					}
				}).placeAt(answersNav).startup();
				new Button({
					id: "lastPiQuestionButton",
					label: "Last question",
					showLabel: false,
					iconClass: "iconLast",
					onClick: function() {
						lecturerQuestionModel.last();
					}
				}).placeAt(answersNav).startup();
				
				var showAnswersMenu = new Menu({style: "display: none"});
				showAnswersMenu.addChild(new MenuItem({
					label: "Correct answers"
				}));
				showAnswersMenu.addChild(new MenuItem({
					label: "Before discussion (PI)"
				}));
				showAnswersMenu.addChild(new MenuItem({
					label: "After discussion (PI)"
				}));
				new ComboButton({
					id: "piAnswersShowButton",
					label: "Show",
					dropDown: showAnswersMenu
				}).placeAt(answersNav).startup();

				var titlePaneContentNode = domConstruct.create("div", {id: "piAnswersTitlePaneContent"}, "piAnswersTitlePane");
				domConstruct.create("span", {id: "piAnswersQuestionSubject", innerHTML: "Question subject"}, titlePaneContentNode);
				domConstruct.create("span", {id: "piAnswersQuestionTitleSeperator", innerHTML: ": "}, titlePaneContentNode);
				domConstruct.create("span", {id: "piAnswersQuestionText", innerHTML: "Question text"}, titlePaneContentNode);

				domConstruct.create("span", {id: "piAnswersCount", innerHTML: "-"}, answersSettings);
				
				lecturerQuestionModel.watchId(this.onLecturerQuestionIdChange);
				
				piAnswersChart.init(piAnswersMainPaneContentNode);
				
				/* add full screen menu item */
				registry.byId("fullScreenMenu").addChild(new MenuItem({
					label: "Answers to Lecturer's questions",
					onClick: self.togglePresentMode
				}));

				/* handle events fired when full screen mode is canceled */
				fullScreen.onChange(function(event, isActive) {
					if (!isActive) {
						domStyle.set(dom.byId("piAnswersQuestionSubject"), "display", "none");
						domStyle.set(dom.byId("piAnswersQuestionTitleSeperator"), "display", "none");
						domConstruct.place(dom.byId("piAnswersControlPaneContent"), dom.byId("piAnswersControlPane"));
						domConstruct.place(dom.byId("piAnswersTitlePaneContent"), dom.byId("piAnswersTitlePane"));
						domConstruct.place(dom.byId("piAnswersMainPaneContent"), dom.byId("piAnswersMainPane"));
						
						piContainer.resize();
					}
				});
				fullScreen.onError(function(event) {
					domConstruct.place(dom.byId("piAnswersControlPaneContent"), dom.byId("piAnswersControlPane"));
					domConstruct.place(dom.byId("piAnswersTitlePaneContent"), dom.byId("piAnswersTitlePane"));
					domConstruct.place(dom.byId("piAnswersMainPaneContent"), dom.byId("piAnswersMainPane"));
				});
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
					piContainer.resize();
					
					if ("freetext" == question.questionType) {
						piAnswersChart.hide();
					} else {
						question.possibleAnswers.forEach(function(possibleAnswer, i) {
							labelReverseMapping[possibleAnswer.text] = i;
							labels.push({value: i + 1, text: possibleAnswer.text});
							values[i] = 0;
						});
						piAnswersChart.show();
						piAnswersChart.update(labels);
					}
					
					when(answers, function(answers) {
						var totalAnswerCount = 0;
						answers.forEach(function(answer) {
							totalAnswerCount += answer.answerCount;
							if ("freetext" == question.questionType) {
								/* TODO implementation */
							} else {
								values[labelReverseMapping[answer.answerText]] = answer.answerCount;
							}
						}, values);
						dom.byId("piAnswersCount").innerHTML = totalAnswerCount;
						
						piAnswersChart.update(labels, values);
					});
				});
			},
			
			togglePresentMode: function() {
				if (fullScreen.isSupported()) {
					if (fullScreen.isActive()) {
						/* dom node rearrangement takes place in fullscreenchange event handler */
						fullScreen.exit();
					} else {
						fullScreen.request(dom.byId("fullScreenContainer"));
						domStyle.set(dom.byId("piAnswersQuestionSubject"), "display", "inline");
						domStyle.set(dom.byId("piAnswersQuestionTitleSeperator"), "display", "inline");
						domConstruct.place(dom.byId("piAnswersControlPaneContent"), dom.byId("fullScreenControl"));
						domConstruct.place(dom.byId("piAnswersTitlePaneContent"), dom.byId("fullScreenHeader"));
						domConstruct.place(dom.byId("piAnswersMainPaneContent"), dom.byId("fullScreenContent"));
						
						registry.byId("fullScreenContainer").resize();
					}
				} else {
					console.log("Full screen mode not supported");
				}
			},
			
			onLecturerQuestionIdChange: function(name, oldValue, value) {
				self.updateAnswersPanel(lecturerQuestionModel.get(), lecturerQuestionModel.getAnswers());
			},
		};
	}
);
