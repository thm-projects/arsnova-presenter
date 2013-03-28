define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/promise/all",
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
		"dijit/form/DropDownButton",
		"dijit/form/Select",
		"dijit/Menu",
		"dijit/MenuItem",
		"dijit/CheckedMenuItem",
		"dojo/fx",
		"dojo/fx/Toggler",
		"dgerhardt/common/confirmDialog",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/ui/chart/piAnswers"
	],
	function(on, when, promiseAll, dom, domConstruct, domClass, domStyle, registry, BorderContainer, TabContainer, ContentPane, Button, ComboButton, DropDownButton, Select, Menu, MenuItem, CheckedMenuItem, fx, Toggler, confirmDialog, fullScreen, piAnswersChart) {
		"use strict";
		
		var
			self = null,
			lecturerQuestionModel = null,
			showAnswers = false,
			unlockMenu = null,
			fsControlsToggleHandlers = [],
			fsControlsToggleFx = {},
			
			/* DOM */
			fullScreenControlsNode = null,
			questionListNode = null,
			freeTextAnswersNode = null,
			piAnswersMainPaneContentNode = null,
			controlPaneContentNode = null,
			titlePaneContentNode = null,
			piNavigationStatusNode = null,
			piAnswersQuestionSubjectNode = null,
			piAnswersQuestionTitleSeperatorNode = null,
			piAnswersQuestionTextNode = null,
			piAnswersCountNode = null,
			
			/* Dijit */
			piContainer = null,
			piHeaderPane = null,
			piTabs = null,
			piQuestionsPane = null,
			piAnswersContainer = null,
			piAnswersControlPane = null,
			piAnswersTitlePane = null,
			piAnswersMainPane = null,
			piRoundButton = null,
			showCorrectMenuItem = null,
			showPiRoundMenuItem = [],
			unlockQuestionMenuItem = null,
			unlockAnswerStatsMenuItem = null,
			unlockCorrectAnswerMenuItem = null
		;
		
		var toggleFsControls = function(event) {
			if (event.clientY < 150) {
				fsControlsToggleFx.show.play();
			} else if (event.clientY > 200) {
				fsControlsToggleFx.hide.play();
			}
		};
		
		var updateLocks = function() {
			lecturerQuestionModel.updateLocks(
				null,
				!unlockQuestionMenuItem.get("checked"),
				!unlockAnswerStatsMenuItem.get("checked"),
				!unlockCorrectAnswerMenuItem.get("checked")
			);
		};
		
		return {
			init: function(lecturerQuestion) {
				console.log("-- UI: piPanel.init --");
				
				self = this;
				lecturerQuestionModel = lecturerQuestion;
				
				piContainer = new BorderContainer({
					id: "piContainer",
					region: "center"
				});
				
				piHeaderPane = new ContentPane({
					region: "top",
					content: domConstruct.create("header", {innerHTML: "Lecturer: "}),
					"class": "headerPane sidePanel"
				});
				piTabs = new TabContainer({
					id: "piTabs",
					region: "center"
				});
				piQuestionsPane = new ContentPane({
					id: "piQuestionsPane",
					title: "Questions"
				});
				piAnswersContainer = new BorderContainer({
					id: "piAnswersContainer",
					title: "Answers"
				});
				piAnswersControlPane = new ContentPane({
					id: "piAnswersControlPane",
					region: "top"
				});
				piAnswersTitlePane = new ContentPane({
					id: "piAnswersTitlePane",
					region: "top"
				});
				piAnswersMainPane = new ContentPane({
					id: "piAnswersMainPane",
					region: "center"
				});
				
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
				questionListNode = domConstruct.create("div", {id: "piQuestionList"}, piQuestionsPane.domNode);
				piAnswersMainPaneContentNode = domConstruct.create("div", {id: "piAnswersMainPaneContent"}, piAnswersMainPane.domNode);
				freeTextAnswersNode = domConstruct.create("div", {id: "piFreeTextAnswers"}, piAnswersMainPaneContentNode);
				domStyle.set(freeTextAnswersNode, "display", "none");
				
				controlPaneContentNode = domConstruct.create("div", {id: "piAnswersControlPaneContent"}, piAnswersControlPane.domNode);
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
				piNavigationStatusNode = domConstruct.create("span", {id: "piNavigationStatus", innerHTML: "0/0"}, answersNav);
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
				showAnswersMenu.addChild(showCorrectMenuItem = new CheckedMenuItem({
					label: "Correct answers",
					onClick: function() {
						if (showAnswers) {
							self.updateAnswersPaneAnswers();
						}
					}
				}));
				showAnswersMenu.addChild(showPiRoundMenuItem[1] = new CheckedMenuItem({
					label: "Before discussion (1st)",
					onClick: function() {
						if (showAnswers) {
							self.updateAnswersPaneAnswers();
						}
					}
				}));
				showAnswersMenu.addChild(showPiRoundMenuItem[2] = new CheckedMenuItem({
					label: "After discussion (2nd)",
					onClick: function() {
						if (showAnswers) {
							self.updateAnswersPaneAnswers();
						}
					}
				}));
				new ComboButton({
					id: "piAnswersShowButton",
					label: "Show",
					dropDown: showAnswersMenu,
					onClick: function() {
						showAnswers = !showAnswers;
						self.updateAnswersPaneAnswers();
					}
				}).placeAt(answersNav).startup();
				(piRoundButton = new Button({
					id: "piRoundButton",
					onClick: function() {
						confirmDialog.confirm("Peer Instruction", "Do you really want to start the next Peer Instruction round? Answers for the current round will be locked permanently.", {
							"Proceed": function() {
								lecturerQuestionModel.startSecondPiRound().then(function() {
									piRoundButton.set("label", "2nd");
									piRoundButton.set("disabled", true);
									showPiRoundMenuItem[2].set("disabled", false);
								});
							},
							"Cancel": null
						});
					}
				})).placeAt(answersSettings).startup();
				domStyle.set(piRoundButton.domNode, "display", "none");
				unlockMenu = new Menu({style: "display: none"});
				unlockMenu.addChild(unlockQuestionMenuItem = new CheckedMenuItem({
					label: "Question",
					onClick: updateLocks
				}));
				unlockMenu.addChild(unlockAnswerStatsMenuItem = new CheckedMenuItem({
					onClick: updateLocks
				}));
				unlockMenu.addChild(unlockCorrectAnswerMenuItem = new CheckedMenuItem({
					label: "Correct answer",
					onClick: updateLocks
				}));
				var unlockButton = new DropDownButton({
					id: "piUnlockButton",
					label: "Unlock",
					dropDown: unlockMenu
				});
				unlockButton.placeAt(answersSettings).startup();

				titlePaneContentNode = domConstruct.create("div", {id: "piAnswersTitlePaneContent"}, piAnswersTitlePane.domNode);
				var questionNode = domConstruct.create("header", {id: "piAnswersQuestion"}, titlePaneContentNode);
				piAnswersQuestionSubjectNode = domConstruct.create("span", {id: "piAnswersQuestionSubject", innerHTML: "Question subject"}, questionNode);
				piAnswersQuestionTitleSeperatorNode = domConstruct.create("span", {id: "piAnswersQuestionTitleSeperator", innerHTML: ": "}, questionNode);
				piAnswersQuestionTextNode = domConstruct.create("span", {id: "piAnswersQuestionText", innerHTML: "Question text"}, questionNode);

				piAnswersCountNode = domConstruct.create("span", {id: "piAnswersCount", innerHTML: "-"}, titlePaneContentNode);
				
				lecturerQuestionModel.watchId(this.onLecturerQuestionIdChange);
				
				piAnswersChart.init(piAnswersMainPaneContentNode);
				
				/* add full screen menu item */
				registry.byId("fullScreenMenu").addChild(new MenuItem({
					label: "Answers to Lecturer's questions",
					onClick: self.togglePresentMode
				}));
				
				fullScreenControlsNode = domConstruct.create("div", {id: "fullScreenControls"}, document.body);
				
				var onResize = function() {
					domStyle.set(fullScreenControlsNode, "left", Math.round(document.body.clientWidth / 2 - 250) + "px");

					fsControlsToggleFx.show = fx.slideTo({
						node: fullScreenControlsNode,
						top: 70,
						left: domStyle.get(fullScreenControlsNode, "left"),
						unit: "px"
					});
					fsControlsToggleFx.hide = fx.slideTo({
						node: fullScreenControlsNode,
						top: -40,
						left: domStyle.get(fullScreenControlsNode, "left"),
						unit: "px"
					});
				};
				on(window, "resize", onResize);
				onResize();

				/* handle events fired when full screen mode is canceled */
				fullScreen.onChange(function(event, isActive) {
					if (!isActive) {
						domStyle.set(piAnswersQuestionSubjectNode, "display", "none");
						domStyle.set(piAnswersQuestionTitleSeperatorNode, "display", "none");
						domConstruct.place(controlPaneContentNode, piAnswersControlPane.domNode);
						domConstruct.place(titlePaneContentNode, piAnswersTitlePane.domNode);
						domConstruct.place(piAnswersMainPaneContentNode, piAnswersMainPane.domNode);
						
						for (var i = 0; i < fsControlsToggleHandlers.length; i++) {
							fsControlsToggleHandlers[i].remove();
						}
						fsControlsToggleHandlers = [];
						fsControlsToggleFx.hide.play();
						
						piContainer.resize();
					}
				});
				
				lecturerQuestionModel.onAnswersAvailable(function(questionId) {
					if (lecturerQuestionModel.getId() != questionId) {
						return;
					}
					var question = lecturerQuestionModel.get();
					when(question, function(question) {
						when(lecturerQuestionModel.getAnswers(question.piRound, true), function() {
							self.updateAnswersPaneAnswers();
						});
					});
				});
			},
			
			updateQuestionsPanel: function(questions) {
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
								piTabs.selectChild(piAnswersContainer);
							});
						});
					}
				});
			},
			
			updateAnswersPaneQuestion: function(question) {
				var labels = [];
				
				if (null == question) {
					piNavigationStatusNode.innerHTML = "0/0";
					piAnswersQuestionSubjectNode.innerHTML = "Question subject";
					piAnswersQuestionTextNode.innerHTML = "Question text";
					piContainer.resize();
					piAnswersChart.update([], []);
					domStyle.set(piRoundButton, "display", "none");
					
					return;
				}
				
				piNavigationStatusNode.innerHTML = (lecturerQuestionModel.getPosition() + 1) + "/" + lecturerQuestionModel.getCount();
				domConstruct.empty(piAnswersQuestionSubjectNode);
				piAnswersQuestionSubjectNode.appendChild(document.createTextNode(question.subject));
				domConstruct.empty(piAnswersQuestionTextNode);
				piAnswersQuestionTextNode.appendChild(document.createTextNode(question.text));
				piContainer.resize();
				registry.byId("fullScreenContainer").resize();
				
				if ("freetext" == question.questionType) {
					piAnswersChart.hide();
					domConstruct.empty(freeTextAnswersNode);
					domStyle.set(freeTextAnswersNode, "display", "block");
					domStyle.set(piRoundButton.domNode, "display", "none");
				} else {
					domStyle.set(freeTextAnswersNode, "display", "none");
					if (question.piRound == 2) {
						piRoundButton.set("label", "2nd");
						piRoundButton.set("disabled", true);
					} else {
						piRoundButton.set("label", "1st");
						piRoundButton.set("disabled", false);
					}
					domStyle.set(piRoundButton.domNode, "display", "");
					question.possibleAnswers.forEach(function(possibleAnswer, i) {
						labels.push({value: i + 1, text: possibleAnswer.text});
					});
					piAnswersChart.show();
					piAnswersChart.update(labels);
				}
			},
			
			updateAnswersPaneAnswers: function() {
				when(lecturerQuestionModel.get(), function(question) {
					if ("freetext" == question.questionType) {
						when(lecturerQuestionModel.getAnswers(), function(answers) {
							self.updateAnswersPaneFreeText(answers);
						});
					} else {
						var rounds = {};
						for (var i = 1; i < showPiRoundMenuItem.length; i++) {
							if (!showPiRoundMenuItem[i].get("checked")) {
								continue;
							}
							rounds["PI round " + i] = lecturerQuestionModel.getAnswers(i);
						}
						/* update UI when data for answer rounds are ready */
						promiseAll(rounds).then(self.updateAnswersPaneChart);
					}
				});
			},
			
			updateAnswersPaneFreeText: function(answers) {
				var totalAnswerCount = 0;
				domConstruct.empty(freeTextAnswersNode);
				answers.forEach(function(answer) {
					totalAnswerCount += answer.answerCount;
					
					if (!showAnswers) {
						return;
					}
					
					var answerNode = domConstruct.create("div", {"class": "answer"});
					var subjectNode = domConstruct.create("p", {"class": "subject"}, answerNode);
					subjectNode.appendChild(document.createTextNode(answer.answerSubject));
					var deleteNode = domConstruct.create("span", {"class": "delete", innerHTML: "x"}, answerNode);
					domConstruct.create("div", {"class": "clearFix"}, answerNode);
					var messageNode = domConstruct.create("p", {"class": "message"}, answerNode);
					messageNode.appendChild(document.createTextNode(answer.answerText));
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
				});
				
				piAnswersCountNode.innerHTML = totalAnswerCount;
			},
			
			updateAnswersPaneChart: function(rounds) {
				var question = lecturerQuestionModel.get();
				var totalAnswerCount = 0;
				var possibleAnswersCount = 0;
				var valueSeries = {};
				var values = [];
				var labels = [];
				var labelReverseMapping = {};
				var correctIndexes = [];
				
				question.possibleAnswers.forEach(function(possibleAnswer, i) {
					/* transform the label and answer count data into arrays usable by dojox/charting */
					labelReverseMapping[possibleAnswer.text] = i;
					labels.push({value: i + 1, text: possibleAnswer.text});
					values[i] = 0;
					if (showCorrectMenuItem.get("checked") && possibleAnswer.correct) {
						correctIndexes.push(i);
					}
					possibleAnswersCount++;
				});

				for (var round in rounds) {
					var answers = rounds[round];
					var values = [];
					answers.forEach(function(answer) {
						totalAnswerCount += answer.answerCount;
						
						if (!showAnswers) {
							return;
						}
						
						values[labelReverseMapping[answer.answerText]] = answer.answerCount;
					});
					while (values.length < possibleAnswersCount) {
						values.push(0);
					}
					
					valueSeries[round] = values;
				}
				piAnswersChart.update(labels, correctIndexes, valueSeries);
				
				piAnswersCountNode.innerHTML = totalAnswerCount;
			},
			
			togglePresentMode: function() {
				if (fullScreen.isActive()) {
					/* dom node rearrangement takes place in fullscreenchange event handler */
					fullScreen.exit();
				} else {
					fullScreen.request(dom.byId("fullScreenContainer"));
					domStyle.set(piAnswersQuestionSubjectNode, "display", "inline");
					domStyle.set(piAnswersQuestionTitleSeperatorNode, "display", "inline");
					domConstruct.place(controlPaneContentNode, fullScreenControlsNode);
					domConstruct.place(titlePaneContentNode, "fullScreenHeader");
					domConstruct.place(piAnswersMainPaneContentNode, "fullScreenContent");
					
					registry.byId("fullScreenContainer").resize();
					
					fsControlsToggleHandlers.push(on(document.body, "mousemove", toggleFsControls));
					fsControlsToggleHandlers.push(on(document.body, "click", toggleFsControls));
				}
			},
			
			onLecturerQuestionIdChange: function(name, oldValue, value) {
				showCorrectMenuItem.set("checked", false);
				for (var i = 1; i < showPiRoundMenuItem.length; i++) {
					showPiRoundMenuItem[i].set("checked", false);
				}
				showAnswers = false;
				var question = lecturerQuestionModel.get();
				when(question, function(question) {
					self.updateAnswersPaneQuestion(question);
					if (null != question) {
						unlockQuestionMenuItem.set("checked", question.active);
						unlockAnswerStatsMenuItem.set("checked", question.showStatistic);
						unlockCorrectAnswerMenuItem.set("checked", question.showAnswer);
						if ("freetext" == question.questionType) {
							showCorrectMenuItem.set("disabled", true);
							for (var i = 1; i < showPiRoundMenuItem.length; i++) {
								showPiRoundMenuItem[i].set("disabled", true);
							}
							unlockCorrectAnswerMenuItem.set("disabled", true);
							unlockCorrectAnswerMenuItem.set("checked", false);
							unlockAnswerStatsMenuItem.set("label", "View of answers");
						} else {
							var noCorrectAnswer = true;
							question.possibleAnswers.forEach(function(answer) {
								if (answer.correct) {
									noCorrectAnswer = false;
								}
							});
							showCorrectMenuItem.set("disabled", noCorrectAnswer);
							unlockCorrectAnswerMenuItem.set("disabled", noCorrectAnswer);
							unlockCorrectAnswerMenuItem.set("checked", question.showAnswer);
							unlockAnswerStatsMenuItem.set("label", "Answers statistics");
							for (var i = 1; i < showPiRoundMenuItem.length; i++) {
								if (i > question.piRound) {
									showPiRoundMenuItem[i].set("disabled", true);
								} else {
									showPiRoundMenuItem[i].set("disabled", false);
								}
							}
							showPiRoundMenuItem[question.piRound].set("checked", true);
						}
						self.updateAnswersPaneAnswers();
					}
				});
			}
		};
	}
);
