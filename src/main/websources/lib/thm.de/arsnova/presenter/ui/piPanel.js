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
		"dijit/form/Button",
		"dijit/form/ComboButton",
		"dijit/form/Select",
		"dijit/Menu",
		"dijit/MenuItem",
		"dgerhardt/common/confirmDialog",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/ui/chart/piAnswers"
	],
	function(on, when, dom, domConstruct, domClass, domStyle, registry, BorderContainer, TabContainer, ContentPane, Button, ComboButton, Select, Menu, MenuItem, confirmDialog, fullScreen, piAnswersChart) {
		"use strict";
		
		var
			self = null,
			lecturerQuestionModel = null,
			piContainer = null,
			freeTextAnswersNode = null,
			showAnswers = false,
			showCorrect = false;
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
				freeTextAnswersNode = domConstruct.create("div", {id: "piFreeTextAnswers"}, piAnswersMainPaneContentNode);
				domStyle.set(freeTextAnswersNode, "display", "none");
				
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
					label: "Correct answers",
					onClick: function() {
						showAnswers = true;
						showCorrect = !showCorrect;
						self.updateAnswersPanel(lecturerQuestionModel.get(), lecturerQuestionModel.getAnswers());
					}
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
					dropDown: showAnswersMenu,
					onClick: function() {
						showAnswers = !showAnswers;
						self.updateAnswersPanel(lecturerQuestionModel.get(), lecturerQuestionModel.getAnswers());
					}
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
						var categoryNode = domConstruct.create("div", {"class": "questionCategory"}, questionList);
						domConstruct.create("header", {innerHTML: category}, categoryNode);
						categories[category].forEach(function(question) {
							var questionNode = domConstruct.create("p", {"class": "question", innerHTML: question.text}, categoryNode);
							on(questionNode, "click", function(event) {
								lecturerQuestionModel.setId(question._id);
								registry.byId("piTabs").selectChild(registry.byId("piAnswersContainer"));
							});
						});
					}
				});
			},
			
			updateAnswersPanel: function(question, answers) {
				var labelReverseMapping = {};
				var labels = [];
				var values = [];
				
				if (null == question) {
					dom.byId("piNavigationStatus").innerHTML = "0/0";
					dom.byId("piAnswersQuestionSubject").innerHTML = "Question subject";
					dom.byId("piAnswersQuestionText").innerHTML = "Question text";
					piContainer.resize();
					piAnswersChart.update([], []);
					
					return;
				}
				
				when(question, function(question) {
					dom.byId("piNavigationStatus").innerHTML = (lecturerQuestionModel.getPosition() + 1) + "/" + lecturerQuestionModel.getCount();
					dom.byId("piAnswersQuestionSubject").innerHTML = question.subject;
					dom.byId("piAnswersQuestionText").innerHTML = question.text;
					piContainer.resize();
					
					var correctIndexes = [];
					
					if ("freetext" == question.questionType) {
						piAnswersChart.hide();
						domConstruct.empty(freeTextAnswersNode);
						domStyle.set(freeTextAnswersNode, "display", "block");
					} else {
						domStyle.set(freeTextAnswersNode, "display", "none");
						question.possibleAnswers.forEach(function(possibleAnswer, i) {
							/* transform the label and answer count data into arrays usable by dojox/charting */
							labelReverseMapping[possibleAnswer.text] = i;
							labels.push({value: i + 1, text: possibleAnswer.text});
							values[i] = 0;
							if (showCorrect && possibleAnswer.correct) {
								correctIndexes.push(i);
							}
						});
						piAnswersChart.show();
						piAnswersChart.update(labels);
					}
					
					when(answers, function(answers) {
						var totalAnswerCount = 0;
						answers.forEach(function(answer) {
							totalAnswerCount += answer.answerCount;
							
							if (!showAnswers) {
								return;
							}
							
							if ("freetext" == question.questionType) {
								var answerNode = domConstruct.create("div", {"class": "answer"});
								domConstruct.create("p", {"class": "subject", innerHTML: answer.answerSubject}, answerNode);
								var deleteNode = domConstruct.create("span", {"class": "delete", innerHTML: "x"}, answerNode);
								domConstruct.create("div", {"class": "clearFix"}, answerNode);
								domConstruct.create("p", {"class": "message", innerHTML: answer.answerText}, answerNode);
								on(answerNode, "click", function() {
									domClass.toggle(this, "opened");
								});
								on(deleteNode, "click", function() {
									confirmDialog.confirm("Delete answer", "Do you really want to delete this answer?", {
										"Delete": function() {
											lecturerQuestionModel.removeAnswer(answer._id);
											domConstruct.destroy(answerNode);
										},
										"Cancel": null
									});
								});
								domConstruct.place(answerNode, freeTextAnswersNode);
							} else {
								values[labelReverseMapping[answer.answerText]] = answer.answerCount;
							}
						}, values);
						dom.byId("piAnswersCount").innerHTML = totalAnswerCount;

						piAnswersChart.update(labels, values, correctIndexes);
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
				showAnswers = false;
				showCorrect = false;
				self.updateAnswersPanel(lecturerQuestionModel.get(), lecturerQuestionModel.getAnswers());
			},
		};
	}
);
