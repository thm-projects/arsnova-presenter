/*
 * Copyright 2013 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
 *
 * This file is part of ARSnova Presenter.
 *
 * Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/on",
		"dojo/aspect",
		"dojo/topic",
		"dojo/when",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dgerhardt/common/confirmDialog",
		"arsnova-presenter/ui/LecturerQuestionsTab",
		"arsnova-presenter/ui/lecturerPaneAnswersTab",
		"arsnova-presenter/ui/audiencePaneFeedbackTab",
		"arsnova-presenter/ui/audiencePaneQuestionsTab",
		"arsnova-presenter/ui/sessionTab",
		"arsnova-presenter/ui/EditQuestionTab",
		"dojo/i18n",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/main",
		"dojo/i18n!./nls/lecturerQuestions"
	],
	function (lang, array, on, aspect, topic, when, domConstruct, domStyle, registry, BorderContainer, TabContainer, ContentPane, confirmDialog, LecturerQuestionsTab, answersTab, feedbackTab, audienceQuestionsTab, sessionTab, EditQuestionTab, i18n, commonMessages, messages, lecturerQuestionMessages) {
		"use strict";

		var
			MIN_WIDTH = 485,
			self = null,
			tabs = {},
			appMode = {EDITING: 1, PI: 2, JITT: 3},
			activeMode = null,

			/* Dijit */
			tabsLeft = null,
			tabsRight = null
		;

		self = {
			/* public "methods" */
			init: function () {
				console.log("-- UI: tabController.init --");

				tabsLeft = new TabContainer({
					id: "lecturerContainer",
					region: "center"
				});
				tabsRight = new TabContainer({
					id: "audienceContainer",
					region: "right",
					splitter: true,
					minSize: MIN_WIDTH
				});

				registry.byId("mainContainer").addChild(tabsLeft);
				registry.byId("mainContainer").addChild(tabsRight);

				tabs.lecturerPiQuestions = new LecturerQuestionsTab();
				tabs.lecturerPiQuestions.init(true, "lecture");
				tabs.lecturerJittQuestions = new LecturerQuestionsTab();
				tabs.lecturerJittQuestions.init(true, "preparation");
				tabs.answers = answersTab.init(tabsLeft);
				tabs.feedback = feedbackTab.init(tabsRight);
				tabs.audienceQuestions = audienceQuestionsTab.init(tabsRight);
				tabs.session = sessionTab.init();

				var that = this;
				tabs.addQuestion = new ContentPane({
					title: lecturerQuestionMessages.addQuestion,
					onShow: function () {
						if (activeMode) {
							/* do not create a new tab while switching modes */
							that.addEditQuestionTab();
						}
					}
				});
				aspect.after(tabsRight, "selectChild", function () {
					/* select second last tab when addQuestion is selected */
					if (activeMode && tabsRight.selectedChildWidget === tabs.addQuestion) {
						tabsRight.selectChild(tabsRight.getChildren()[tabsRight.getChildren().length - 2]);
					}
				});

				var onWindowResize = function () {
					var maxSize = document.body.clientWidth - MIN_WIDTH;
					tabsRight.set("maxSize", maxSize);
					var width = domStyle.get(tabsRight.domNode, "width");
					if (width > maxSize) {
						domStyle.set(tabsRight.domNode, "width", "49.5%");
						registry.byId("mainContainer").resize();
					}
				};
				on(window, "resize", onWindowResize);
				onWindowResize();
			},

			startup: function () {
				self.switchMode(appMode.PI);

				tabs.lecturerPiQuestions.startup();
				tabs.lecturerJittQuestions.startup();
				answersTab.startup();
				feedbackTab.startup();
				audienceQuestionsTab.startup();
				sessionTab.startup();

				topic.subscribe("arsnova/question/edit", lang.hitch(this, function (questionId) {
					console.log("Topic: ", questionId);
					this.addEditQuestionTab(questionId);
				}));
			},

			addEditQuestionTab: function (questionId) {
				var eqt;

				if (questionId) {
					eqt = EditQuestionTab.getTab(questionId);
				}
				if (!eqt) {
					eqt = new EditQuestionTab(questionId);
					eqt.init();
					eqt.startup();
					var pos = tabsRight.getChildren().length - 1;
					tabsRight.addChild(eqt, pos);
				}
				tabsRight.selectChild(eqt);
			},

			selectMode: function (mode) {
				var modified = false;
				mode = isNaN(mode) ? appMode[mode] : mode;
				if (mode === activeMode) {
					return;
				}

				if (appMode.EDITING === activeMode) {
					EditQuestionTab.getInstances().forEach(function (tab, i) {
						if (tab[1].modified) {
							console.debug("Question " + (tab[0] || "new[" + i + "]") + " has modifications");
							modified = true;
						}
					});
				}

				if (appMode.EDITING === activeMode && modified) {
					var buttons = {};
					buttons[commonMessages.proceed] = lang.hitch(this, function () {
						this.switchMode(mode);
					});
					buttons[commonMessages.cancel] = function () {
						registry.byId("editingModeMenuItem").set("checked", true);
					};
					confirmDialog.confirm(messages.modeChange, messages.leaveEditingConfirm, buttons, buttons[commonMessages.cancel]);
				} else {
					this.switchMode(mode);
				}
			},

			switchMode: function (mode) {
				activeMode = null;
				tabs.lecturerPiQuestions.enableEditing(false);
				tabs.lecturerJittQuestions.enableEditing(false);

				array.forEach(tabsLeft.getChildren(), function (tab) {
					tabsLeft.removeChild(tab);
					/* unfortunately tc.removeChild(...) does not fire an onClose event */
					tab.onClose();
				});
				array.forEach(tabsRight.getChildren(), function (tab) {
					tabsRight.removeChild(tab);
					tab.onClose();
				});

				switch (mode) {
				case appMode.EDITING:
					tabs.lecturerPiQuestions.enableEditing(true);
					tabs.lecturerJittQuestions.enableEditing(true);
					tabsLeft.addChild(tabs.lecturerPiQuestions);
					tabsLeft.addChild(tabs.lecturerJittQuestions);
					tabsLeft.addChild(tabs.session);
					this.addEditQuestionTab();
					tabsRight.addChild(tabs.addQuestion);

					break;
				case appMode.PI:
					tabsLeft.addChild(tabs.lecturerPiQuestions);
					tabsLeft.addChild(tabs.answers);
					tabsRight.addChild(tabs.feedback);
					tabsRight.addChild(tabs.audienceQuestions);

					break;
				case appMode.JITT:
					tabsLeft.addChild(tabs.lecturerJittQuestions);
					tabsLeft.addChild(tabs.answers);
					tabsRight.addChild(tabs.audienceQuestions);

					break;
				}

				activeMode = mode;
			},

			isActiveMode: function (mode) {
				return activeMode === appMode[mode];
			}
		};

		return self;
	}
);
