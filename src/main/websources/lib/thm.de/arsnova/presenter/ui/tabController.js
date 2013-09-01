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
		"dojo/on",
		"dojo/topic",
		"dojo/when",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/ui/lecturerPaneQuestionsTab",
		"arsnova-presenter/ui/lecturerPaneAnswersTab",
		"arsnova-presenter/ui/audiencePaneFeedbackTab",
		"arsnova-presenter/ui/audiencePaneQuestionsTab"
	],
	function (on, topic, when, domConstruct, domStyle, registry, BorderContainer, TabContainer, ContentPane, lecturerQuestionsTab, answersTab, feedbackTab, audienceQuestionsTab) {
		"use strict";

		var
			MIN_WIDTH = 485,
			self = null,
			tabs = {},

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

				tabs.lecturerQuestions = lecturerQuestionsTab.init(tabsLeft);
				tabs.answers = answersTab.init(tabsLeft);
				tabs.feedback = feedbackTab.init(tabsRight);
				tabs.audienceQuestions = audienceQuestionsTab.init(tabsRight);

				tabsLeft.addChild(tabs.lecturerQuestions);
				tabsLeft.addChild(tabs.answers);
				tabsRight.addChild(tabs.feedback);
				tabsRight.addChild(tabs.audienceQuestions);

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
				lecturerQuestionsTab.startup();
				answersTab.startup();

				feedbackTab.startup();
				audienceQuestionsTab.startup();
			}
		};

		return self;
	}
);
