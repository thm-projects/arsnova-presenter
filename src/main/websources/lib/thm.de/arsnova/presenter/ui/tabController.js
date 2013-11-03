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
		"arsnova-presenter/ui/EditQuestionTab",
		"dojo/i18n",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/main"
	],
	function (lang, array, on, aspect, topic, when, domConstruct, domStyle, registry, BorderContainer, TabContainer, ContentPane, confirmDialog, LecturerQuestionsTab, answersTab, feedbackTab, audienceQuestionsTab, EditQuestionTab, i18n, commonMessages, messages) {
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

				var that = this;
				tabs.addQuestion = new ContentPane({
					title: "Add question",
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

				topic.subscribe("arsnova/question/edit", lang.hitch(this, function (questionId) {
					console.log("Topic: ", questionId);
					this.addEditQuestionTab(questionId);
				}));
			},

			addEditQuestionTab: function (questionId) {
				var eqt = new EditQuestionTab(questionId);
				eqt.init();
				var pos = tabsRight.getChildren().length - 1;
				tabsRight.addChild(eqt, pos);
				tabsRight.selectChild(eqt);
			},

			selectMode: function (mode) {
				mode = isNaN(mode) ? appMode[mode] : mode;
				if (mode === activeMode) {
					return;
				}

				if (appMode.EDITING === activeMode && tabsRight.getChildren().length > 0) {
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
				});
				array.forEach(tabsRight.getChildren(), function (tab) {
					tabsRight.removeChild(tab);
				});

				switch (mode) {
				case appMode.EDITING:
					tabs.lecturerPiQuestions.enableEditing(true);
					tabs.lecturerJittQuestions.enableEditing(true);
					tabsLeft.addChild(tabs.lecturerPiQuestions);
					tabsLeft.addChild(tabs.lecturerJittQuestions);
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
