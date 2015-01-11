/*
 * This file is part of ARSnova Presenter.
 * Copyright 2013-2015 Daniel Gerhardt <code@dgerhardt.net>
 *
 * ARSnova Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Presenter is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
		"dijit/a11yclick",
		"dijit/layout/BorderContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Button",
		"dijit/form/ComboButton",
		"dijit/form/DropDownButton",
		"dijit/Menu",
		"dijit/MenuItem",
		"dijit/CheckedMenuItem",
		"dojo/fx",
		"dgerhardt/common/confirmDialog",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/appState",
		"arsnova-presenter/ui/mathJax",
		"arsnova-presenter/ui/chart/piAnswers",
		"libarsnova/lecturerQuestion",
		"dojo/i18n",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/lecturerAnswers"
	],
	function (on, when, promiseAll, dom, domConstruct, domClass, domStyle, registry, a11yclick, BorderContainer, ContentPane, Button, ComboButton, DropDownButton, Menu, MenuItem, CheckedMenuItem, fx, confirmDialog, fullScreen, appState, mathJax, piAnswersChart, lecturerQuestionModel, i18n, commonMessages, messages) {
		"use strict";

		var
			self = null,
			model = null,
			showAnswers = false,
			unlockMenu = null,
			fsControlsToggleHandlers = [],
			fsControlsToggleFx = {},

			/* declarations of private "methods" */
			onLecturerQuestionIdChange = null,
			toggleFullScreenControls = null,
			updateLocks = null,

			/* DOM */
			fullScreenControlsNode = null,
			freeTextAnswersNode = null,
			mainPaneContentNode = null,
			controlPaneContentNode = null,
			titlePaneContentNode = null,
			navigationStatusNode = null,
			questionSubjectNode = null,
			questionTitleSeperatorNode = null,
			questionTextNode = null,
			answerCountNode = null,

			/* Dijit */
			tabContainer = null,
			answersContainer = null,
			controlPane = null,
			titlePane = null,
			mainPane = null,
			prevButton = null,
			nextButton = null,
			firstButton = null,
			lastButton = null,
			showButton = null,
			piRoundButton = null,
			unlockButton = null,
			alwaysShowAnswersMenuItem = null,
			showCorrectMenuItem = null,
			showPiRoundMenuItem = [],
			unlockQuestionMenuItem = null,
			unlockAnswerStatsMenuItem = null,
			unlockCorrectAnswerMenuItem = null
		;

		self = {
			/* public "methods" */
			init: function (_tabContainer) {
				tabContainer = _tabContainer;
				model = lecturerQuestionModel;

				answersContainer = new BorderContainer({
					id: "piAnswersContainer",
					title: messages.answers
				});

				controlPane = new ContentPane({
					id: "piAnswersControlPane",
					region: "top"
				});
				titlePane = new ContentPane({
					id: "piAnswersTitlePane",
					region: "top"
				});
				mainPane = new ContentPane({
					id: "piAnswersMainPane",
					region: "center"
				});
				answersContainer.addChild(controlPane);
				answersContainer.addChild(titlePane);
				answersContainer.addChild(mainPane);

				return answersContainer;
			},

			startup: function () {
				mainPaneContentNode = domConstruct.create("div", {id: "piAnswersMainPaneContent"}, mainPane.domNode);
				freeTextAnswersNode = domConstruct.create("div", {id: "piFreeTextAnswers"}, mainPaneContentNode);
				domStyle.set(freeTextAnswersNode, "display", "none");

				controlPaneContentNode = domConstruct.create("div", {id: "piAnswersControlPaneContent"}, controlPane.domNode);
				var answersNav = domConstruct.create("div", {id: "piAnswersNavigation"}, controlPaneContentNode);
				var answersSettings = domConstruct.create("div", {id: "piAnswersSettings"}, controlPaneContentNode);

				(firstButton = new Button({
					id: "firstPiQuestionButton",
					label: messages.firstQuestion,
					showLabel: false,
					iconClass: "iconFirst",
					onClick: function () {
						var firstId = model.firstId(appState.get("mode"));
						appState.set("questionId", firstId);
					}
				})).placeAt(answersNav).startup();
				(prevButton = new Button({
					id: "prevPiQuestionButton",
					label: messages.prevQuestion,
					showLabel: false,
					iconClass: "iconPrev",
					onClick: function () {
						var prevId = model.prevId(appState.get("questionId"), appState.get("mode"));
						appState.set("questionId", prevId);
					}
				})).placeAt(answersNav).startup();
				navigationStatusNode = domConstruct.create("span", {id: "piNavigationStatus", innerHTML: "0/0"}, answersNav);
				(nextButton = new Button({
					id: "nextPiQuestionButton",
					label: messages.nextQuestion,
					showLabel: false,
					iconClass: "iconNext",
					onClick: function () {
						var nextId = model.nextId(appState.get("questionId"), appState.get("mode"));
						appState.set("questionId", nextId);
					}
				})).placeAt(answersNav).startup();
				(lastButton = new Button({
					id: "lastPiQuestionButton",
					label: messages.lastQuestion,
					showLabel: false,
					iconClass: "iconLast",
					onClick: function () {
						var lastId = model.lastId(appState.get("mode"));
						appState.set("questionId", lastId);
					}
				})).placeAt(answersNav).startup();

				var showAnswersMenu = new Menu({style: "display: none"});
				showAnswersMenu.addChild(alwaysShowAnswersMenuItem = new CheckedMenuItem({
					label: messages.alwaysShowAnswers,
					onClick: function () {
						if (!showAnswers) {
							self.updateAnswers();
						}
						showAnswers = true;
					}
				}));
				showAnswersMenu.addChild(showCorrectMenuItem = new CheckedMenuItem({
					label: messages.correctAnswers,
					onClick: function () {
						if (showAnswers) {
							self.updateAnswers();
						}
					}
				}));
				showAnswersMenu.addChild(showPiRoundMenuItem[1] = new CheckedMenuItem({
					label: messages.piBefore,
					onClick: function () {
						self.updateAnswers();
					}
				}));
				showAnswersMenu.addChild(showPiRoundMenuItem[2] = new CheckedMenuItem({
					label: messages.piAfter,
					onClick: function () {
						self.updateAnswers();
					}
				}));
				(showButton = new ComboButton({
					id: "piAnswersShowButton",
					label: messages.show,
					dropDown: showAnswersMenu,
					onClick: function () {
						showAnswers = !showAnswers;
						self.updateAnswers();
					}
				})).placeAt(answersNav).startup();
				(piRoundButton = new Button({
					id: "piRoundButton",
					onClick: function () {
						var buttons = {};
						buttons[commonMessages.proceed] = function () {
							model.startSecondPiRound(appState.get("questionId")).then(function () {
								piRoundButton.set("label", "2nd");
								piRoundButton.set("disabled", true);
								showPiRoundMenuItem[2].set("disabled", false);
							});
						};
						buttons[commonMessages.cancel] = null;
						confirmDialog.confirm(messages.pi, messages.piNextRoundConfirm, buttons);
					}
				})).placeAt(answersSettings).startup();
				domStyle.set(piRoundButton.domNode, "display", "none");
				unlockMenu = new Menu({style: "display: none"});
				unlockMenu.addChild(unlockQuestionMenuItem = new CheckedMenuItem({
					label: messages.question,
					onClick: updateLocks
				}));
				unlockMenu.addChild(unlockAnswerStatsMenuItem = new CheckedMenuItem({
					onClick: updateLocks
				}));
				unlockMenu.addChild(unlockCorrectAnswerMenuItem = new CheckedMenuItem({
					label: messages.correctAnswers,
					onClick: updateLocks
				}));
				unlockButton = new DropDownButton({
					id: "piUnlockButton",
					label: messages.release,
					dropDown: unlockMenu
				});
				unlockButton.placeAt(answersSettings).startup();

				titlePaneContentNode = domConstruct.create("div", {id: "piAnswersTitlePaneContent"}, titlePane.domNode);
				var questionNode = domConstruct.create("header", {id: "piAnswersQuestion"}, titlePaneContentNode);
				questionSubjectNode = domConstruct.create("span", {id: "piAnswersQuestionSubject", innerHTML: messages.questionSubject}, questionNode);
				questionTitleSeperatorNode = domConstruct.create("span", {id: "piAnswersQuestionTitleSeperator", innerHTML: ": "}, questionNode);
				questionTextNode = domConstruct.create("span", {id: "piAnswersQuestionText", innerHTML: messages.noQuestions}, questionNode);
				answerCountNode = domConstruct.create("span", {id: "piAnswersCount"}, titlePaneContentNode);
				domConstruct.create("span", {"class": "answerCount", innerHTML: "-"}, answerCountNode);

				self.enableControls(false);

				piAnswersChart.init(mainPaneContentNode);

				/* add full screen menu item */
				registry.byId("fullScreenMenu").addChild(new MenuItem({
					label: messages.answersToLecturersQuestion,
					onClick: self.toggleFullScreenMode
				}));

				fullScreenControlsNode = domConstruct.create("div", {id: "fullScreenControls"}, document.body);

				var onResize = function () {
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
				fullScreen.onChange(function (event, isActive) {
					if (!isActive) {
						domStyle.set(questionSubjectNode, "display", "none");
						domStyle.set(questionTitleSeperatorNode, "display", "none");
						domConstruct.place(controlPaneContentNode, controlPane.domNode);
						domConstruct.place(titlePaneContentNode, titlePane.domNode);
						domConstruct.place(mainPaneContentNode, mainPane.domNode);

						for (var i = 0; i < fsControlsToggleHandlers.length; i++) {
							fsControlsToggleHandlers[i].remove();
						}
						fsControlsToggleHandlers = [];
						fsControlsToggleFx.hide.play();

						answersContainer.resize();
					}
				});

				/* TODO: remove model.watchId when completely replaced */
				//model.watchId(onLecturerQuestionIdChange);
				appState.watch("questionId", onLecturerQuestionIdChange);
				appState.watch("mode", function (name, oldValue, value) {
					if (["pi", "jitt"].indexOf(value) !== -1) {
						appState.set("questionId", lecturerQuestionModel.firstId(value));
					}
				});
				model.onAnswersAvailable(function (questionId) {
					if (appState.get("questionId") !== questionId) {
						return;
					}
					var question = model.get(questionId);
					when(question, function (question) {
						when(model.getAnswers(questionId, question.round, true), function () {
							self.updateAnswers();
						});
					});
				});
			},

			updateQuestion: function (question) {
				var labels = [];

				if (!question) {
					navigationStatusNode.innerHTML = "0/0";
					questionSubjectNode.innerHTML = messages.questionSubject;
					questionTextNode.innerHTML = messages.noQuestions;
					answersContainer.resize();
					piAnswersChart.update([], []);
					domStyle.set(piRoundButton, "display", "none");

					return;
				}

				navigationStatusNode.innerHTML = (model.position(appState.get("questionId"), appState.get("mode")) + 1)
					+ "/" + model.count(appState.get("mode"));
				domConstruct.empty(questionSubjectNode);
				questionSubjectNode.appendChild(document.createTextNode(question.subject));
				domConstruct.empty(questionTextNode);
				questionTextNode.appendChild(document.createTextNode(question.body));
				mathJax.parse(questionTextNode);
				answersContainer.resize();
				registry.byId("fullScreenContainer").resize();

				if ("freetext" === question.format) {
					piAnswersChart.hide();
					domConstruct.empty(freeTextAnswersNode);
					domStyle.set(freeTextAnswersNode, "display", "block");
					domStyle.set(piRoundButton.domNode, "display", "none");
				} else {
					domStyle.set(freeTextAnswersNode, "display", "none");
					if (2 === question.round) {
						piRoundButton.set("label", "2nd");
						piRoundButton.set("disabled", true);
					} else {
						piRoundButton.set("label", "1st");
						piRoundButton.set("disabled", false);
					}
					domStyle.set(piRoundButton.domNode, "display", "");
					question.answerOptions.forEach(function (possibleAnswer, i) {
						labels.push({value: i + 1, text: possibleAnswer.text});
					});
					if (question.allowAbstentions) {
						labels.push({value: labels.length + 1, text: messages.abstentions});
					}
					piAnswersChart.show();
					piAnswersChart.update(labels);
				}
			},

			updateAnswers: function () {
				/* hide answer count until answers have been loaded */
				domStyle.set(answerCountNode, "visibility", "hidden");

				when(model.get(appState.get("questionId")), function (question) {
					if ("freetext" === question.format) {
						when(model.getAnswers(question.id), function (answers) {
							self.updateFreeText(answers);
						});
					} else {
						var rounds = {};
						for (var i = 1; i < showPiRoundMenuItem.length; i++) {
							if (!showPiRoundMenuItem[i].get("checked")) {
								continue;
							}
							rounds["PI round " + i] = model.getAnswers(question.id, i);
						}
						/* update UI when data for answer rounds are ready */
						promiseAll(rounds).then(self.updateAnswerStatistics);
					}
				});
			},

			updateFreeText: function (answers) {
				var totalAnswerCount = 0;
				var abstentionCount = 0;
				domConstruct.empty(freeTextAnswersNode);
				answers.sort(function (obj1, obj2) {
					return obj2.creation - obj1.creation;
				});
				answers.forEach(function (answer) {
					totalAnswerCount++;

					if (!showAnswers) {
						return;
					}
					if (!answer.subject && !answer.body) {
						abstentionCount++;

						return;
					}

					var answerNode = domConstruct.create("div", {"class": "answer", tabindex: 0});
					var subjectNode = domConstruct.create("p", {"class": "subject"}, answerNode);
					subjectNode.appendChild(document.createTextNode(answer.subject));
					var deleteNode = domConstruct.create("span", {"class": "delete", tabindex: 0, title: commonMessages.del, innerHTML: "x"}, answerNode);
					domConstruct.create("div", {"class": "clearFix"}, answerNode);
					var messageNode = domConstruct.create("p", {"class": "message"}, answerNode);
					messageNode.appendChild(document.createTextNode(answer.body));
					mathJax.parse(messageNode);
					on(answerNode, a11yclick, function () {
						domClass.toggle(this, "opened");
					});
					on(deleteNode, a11yclick, function (event) {
						if (event.stopPropagation) { /* IE8 does not support stopPropagation */
							event.stopPropagation();
						}
						var buttons = {};
						buttons[commonMessages.del] = function () {
							model.removeAnswer(answer.questionId, answer.id);
							domConstruct.destroy(answerNode);
						};
						buttons[commonMessages.cancel] = null;
						confirmDialog.confirm(messages.deleteAnswer, messages.deleteAnswerConfirm, buttons);
					});
					domConstruct.place(answerNode, freeTextAnswersNode);
				});

				domConstruct.empty(answerCountNode);
				var countNode = domConstruct.create("span", {"class": "answerCount"}, answerCountNode);
				countNode.appendChild(document.createTextNode(totalAnswerCount));
				domStyle.set(answerCountNode, "visibility", "visible");
			},

			updateAnswerStatistics: function (rounds) {
				var question = model.get(appState.get("questionId"));
				var answerCountPerRound = [];
				var possibleAnswersCount = 0;
				var valueSeries = {};
				var values = [];
				var labels = [];
				var labelReverseMapping = {};
				var correctIndexes = [];
				var abstentionCount = 0;

				question.answerOptions.forEach(function (possibleAnswer, i) {
					/* transform the label and answer count data into arrays usable by dojox/charting */
					labelReverseMapping[possibleAnswer.text] = i;
					labels.push({value: i + 1, text: possibleAnswer.text});
					values[i] = 0;
					if (showCorrectMenuItem.get("checked") && possibleAnswer.correct) {
						correctIndexes.push(i);
					}
					possibleAnswersCount++;
				});

				if (question.allowAbstentions) {
					labels.push({value: labels.length + 1, text: messages.abstentions});
					values.push(0);
					possibleAnswersCount++;
				}

				/* sorting is needed since the order of the object's properties is not determined */
				var roundNames = [];
				var round = null;
				for (round in rounds) {
					if (rounds.hasOwnProperty(round)) {
						roundNames.push(round);
					}
				}
				roundNames.sort();
				var percentageValues = true; //roundNames.length > 1;

				var handleAnswer = function (answer) {
					answerCountPerRound[round] += answer.count;

					if (!showAnswers) {
						return;
					}

					if (!answer.choices) {
						/* handle abstentions */
						abstentionCount = answer.count;
					} else {
						if ("mc" === question.format || "grid" === question.format) {
							/* handle selected options for multiple choice questions */
							var selectedOptions = answer.choices.split(",");
							for (var j = 0; j < selectedOptions.length; j++) {
								if ("mc" === question.format) {
									if (1 === parseInt(selectedOptions[j], 10)) {
										values[j] += answer.count;
									}
								} else {
									values[labelReverseMapping[selectedOptions[j]]] += 1;
								}
							}
						} else {
							/* handle single answer option */
							values[labelReverseMapping[answer.choices]] = answer.count;
						}
					}
				};

				domConstruct.empty(answerCountNode);
				for (var i = 0; i < roundNames.length; i++) {
					round = roundNames[i];
					var answers = rounds[round];
					values = [];
					while (values.length < possibleAnswersCount) {
						values.push(0);
					}
					answerCountPerRound[round] = 0;
					answers.forEach(handleAnswer);

					if (question.allowAbstentions) {
						values[values.length - 1] = abstentionCount;
					}

					if (percentageValues) {
						for (var j = 0; j < values.length; j++) {
							values[j] *= 100 / answerCountPerRound[round];
						}
					}
					valueSeries[round] = values;

					var countNode = null;
					/* only display PI round label if PI has been started */
					if (question.round > 1) {
						var piRoundNode = domConstruct.create("span", {"class": "piRound"}, answerCountNode);
						var roundString = "PI round 2" === round ? "2nd" : ("PI round 1" === round ? "1st" : "");
						piRoundNode.appendChild(document.createTextNode(roundString));
						countNode = domConstruct.create("span", {"class": "answerCount"}, piRoundNode);
					} else {
						countNode = domConstruct.create("span", {"class": "answerCount"}, answerCountNode);
					}
					countNode.appendChild(document.createTextNode(answerCountPerRound[round]));
					domStyle.set(answerCountNode, "visibility", "visible");
				}
				piAnswersChart.update(labels, correctIndexes, valueSeries, percentageValues, question.allowAbstentions);
			},

			toggleFullScreenMode: function () {
				if (fullScreen.isActive()) {
					/* dom node rearrangement takes place in fullscreenchange event handler */
					fullScreen.exit();
				} else {
					fullScreen.request(dom.byId("fullScreenContainer"));
					domStyle.set(questionSubjectNode, "display", "inline");
					domStyle.set(questionTitleSeperatorNode, "display", "inline");
					domConstruct.place(controlPaneContentNode, fullScreenControlsNode);
					domConstruct.place(titlePaneContentNode, "fullScreenHeader");
					domConstruct.place(mainPaneContentNode, "fullScreenContent");

					registry.byId("fullScreenContainer").resize();

					fsControlsToggleHandlers.push(on(document.body, "mousemove", toggleFullScreenControls));
					fsControlsToggleHandlers.push(on(document.body, "click", toggleFullScreenControls));
				}
			},

			selectTab: function () {
				tabContainer.selectChild(answersContainer);
			},

			enableControls: function (enable) {
				if (!enable) {
					domStyle.set(piRoundButton.domNode, "display", "none");
					domStyle.set(answerCountNode, "visibility", "hidden");
				}
				showButton.set("disabled", !enable);
				unlockButton.set("disabled", !enable);
				prevButton.set("disabled", !enable);
				nextButton.set("disabled", !enable);
				firstButton.set("disabled", !enable);
				lastButton.set("disabled", !enable);
			}
		};

		/* private "methods" */
		onLecturerQuestionIdChange = function (name, oldValue, value) {
			var i;

			showCorrectMenuItem.set("checked", false);
			for (i = 1; i < showPiRoundMenuItem.length; i++) {
				showPiRoundMenuItem[i].set("checked", false);
			}
			showAnswers = alwaysShowAnswersMenuItem.get("checked");
			var question = value ? model.get(value) : null;
			when(question, function (question) {
				self.updateQuestion(question);
				if (question) {
					unlockQuestionMenuItem.set("checked", question.active);
					unlockAnswerStatsMenuItem.set("checked", question.publishResults);
					unlockCorrectAnswerMenuItem.set("checked", question.publishCorrectAnswer);
					if ("freetext" === question.format) {
						showCorrectMenuItem.set("disabled", true);
						for (i = 1; i < showPiRoundMenuItem.length; i++) {
							showPiRoundMenuItem[i].set("disabled", true);
						}
						unlockCorrectAnswerMenuItem.set("disabled", true);
						unlockCorrectAnswerMenuItem.set("checked", false);
						unlockAnswerStatsMenuItem.set("label", messages.viewOfAnswers);
					} else {
						var noCorrectAnswer = true;
						question.answerOptions.forEach(function (answer) {
							if (answer.correct) {
								noCorrectAnswer = false;
							}
						});
						showCorrectMenuItem.set("disabled", noCorrectAnswer);
						unlockCorrectAnswerMenuItem.set("disabled", noCorrectAnswer);
						unlockCorrectAnswerMenuItem.set("checked", question.publishCorrectAnswer);
						unlockAnswerStatsMenuItem.set("label", messages.answerStatistics);
						for (i = 1; i < showPiRoundMenuItem.length; i++) {
							if (i > question.round) {
								showPiRoundMenuItem[i].set("disabled", true);
							} else {
								showPiRoundMenuItem[i].set("disabled", false);
							}
						}
						showPiRoundMenuItem[question.round].set("checked", true);
					}
					self.updateAnswers();
					self.enableControls(true);
				} else {
					self.enableControls(false);
				}
			});
		};

		toggleFullScreenControls = function (event) {
			if (event.clientY < 150) {
				fsControlsToggleFx.show.play();
			} else if (event.clientY > 200) {
				fsControlsToggleFx.hide.play();
			}
		};

		updateLocks = function () {
			model.updateLocks(
				appState.get("questionId"),
				!unlockQuestionMenuItem.get("checked"),
				!unlockAnswerStatsMenuItem.get("checked"),
				!unlockCorrectAnswerMenuItem.get("checked")
			);
		};

		return self;
	}
);
