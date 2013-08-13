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
		"dojo/when",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/ui/audiencePaneFeedbackTab",
		"arsnova-presenter/ui/audiencePaneQuestionsTab"
	],
	function (on, when, domConstruct, domStyle, registry, BorderContainer, TabContainer, ContentPane, feedbackTab, questionsTab) {
		"use strict";

		var
			MIN_WIDTH = 485,
			self = null,
			sessionModel = null,
			audienceQuestionModel = null,
			feedbackModel = null,

			/* declarations of private "methods" */
			onSessionKeyChange = null,

			/* Dijit */
			container = null,
			headerPane = null,
			tabs = null
		;

		self = {
			/* public "methods" */
			init: function (_sessionModel, _audienceQuestionModel, _feedbackModel) {
				console.log("-- UI: audiencePane.init --");

				sessionModel = _sessionModel;
				audienceQuestionModel = _audienceQuestionModel;
				feedbackModel = _feedbackModel;

				container = new BorderContainer({
					id: "audienceContainer",
					region: "right",
					splitter: true,
					minSize: MIN_WIDTH
				});
				headerPane = new ContentPane({
					region: "top",
					content: domConstruct.create("header", {innerHTML: "Audience"}),
					"class": "headerPane sidePanel"
				});
				tabs = new TabContainer({
					id: "audienceTabs",
					region: "center"
				});

				registry.byId("mainContainer").addChild(container);
				container.addChild(headerPane);
				container.addChild(tabs);

				feedbackTab.init(tabs, feedbackModel);
				questionsTab.init(tabs, audienceQuestionModel);

				var onWindowResize = function () {
					var maxSize = document.body.clientWidth - MIN_WIDTH;
					container.set("maxSize", maxSize);
					var width = domStyle.get(container.domNode, "width");
					if (width > maxSize) {
						domStyle.set(container.domNode, "width", "49.5%");
						registry.byId("mainContainer").resize();
					}
				};
				on(window, "resize", onWindowResize);
				onWindowResize();
			},

			startup: function () {
				feedbackTab.startup();
				questionsTab.startup();

				sessionModel.watchKey(onSessionKeyChange);
			}
		};

		/* private "methods" */
		onSessionKeyChange = function (name, oldValue, value) {
			var questions = audienceQuestionModel.getAll();
			when(questions, function (questions) {
				questionsTab.update(questions);
			});
		};

		return self;
	}
);
