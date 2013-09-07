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
		"dojo/_base/array",
		"dojo/on",
		"dojo/topic",
		"dojo/when",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/ui/LecturerQuestionsTab",
		"arsnova-presenter/ui/lecturerPaneAnswersTab",
		"arsnova-presenter/ui/audiencePaneFeedbackTab",
		"arsnova-presenter/ui/audiencePaneQuestionsTab",
		"arsnova-presenter/ui/EditQuestionTab"
	],
	function (array, on, topic, when, domConstruct, domStyle, registry, BorderContainer, TabContainer, ContentPane, lecturerQuestionsTab, answersTab, feedbackTab, audienceQuestionsTab, EditQuestionTab) {
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
				tabs.lecturerPiQuestions.init();
				tabs.lecturerJittQuestions = new LecturerQuestionsTab();
				tabs.lecturerJittQuestions.init();
				tabs.answers = answersTab.init(tabsLeft);
				tabs.feedback = feedbackTab.init(tabsRight);
				tabs.audienceQuestions = audienceQuestionsTab.init(tabsRight);

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

				topic.subscribe("arsnova/question/edit", function (questionId) {
					console.log("Topic: ", questionId);
					var eqt = new EditQuestionTab();
					eqt.init();
					tabsRight.addChild(eqt);
					tabsRight.selectChild(eqt);
				});
			},

			switchMode: function (mode) {
				mode = isNaN(mode) ? appMode[mode] : mode;
				if (mode == activeMode) {
					return;
				}

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
				return activeMode == appMode[mode];
			}
		};

		return self;
	}
);
