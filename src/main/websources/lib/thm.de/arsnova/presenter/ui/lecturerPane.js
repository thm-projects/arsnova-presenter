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
		"dojo/when",
		"dojo/dom-construct",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Select",
		"arsnova-presenter/ui/lecturerPaneQuestionsTab",
		"arsnova-presenter/ui/lecturerPaneAnswersTab"
	],
	function(when, domConstruct, registry, BorderContainer, TabContainer, ContentPane, Select, questionsTab, answersTab) {
		"use strict";

		var
			self = null,
			sessionModel = null,
			lecturerQuestionModel = null,

			/* Dijit */
			container = null,
			headerPane = null,
			tabs = null
		;

		self = {
			/* public "methods" */
			init: function(_sessionModel, _lecturerQuestionModel) {
				console.log("-- UI: lecturerPane.init --");

				sessionModel = _sessionModel;
				lecturerQuestionModel = _lecturerQuestionModel;

				container = new BorderContainer({
					id: "lecturerContainer",
					region: "center"
				});
				headerPane = new ContentPane({
					region: "top",
					content: domConstruct.create("header", {innerHTML: "Lecturer: "}),
					"class": "headerPane sidePanel"
				});
				tabs = new TabContainer({
					id: "lecturerTabs",
					region: "center"
				});

				registry.byId("mainContainer").addChild(container);
				container.addChild(headerPane);
				container.addChild(tabs);

				headerPane.addChild(new Select({
					id: "lecturerPaneModeSelect",
					options: [
						{label: "Clicker Questions", value: "1", disabled: true},
						{label: "Peer Instruction (PI)", value: "2", selected: true},
						{label: "Pre-Class Assignments (JiTT)", value: "3", disabled: true}
					]
				}));

				questionsTab.init(tabs, lecturerQuestionModel);
				answersTab.init(tabs, lecturerQuestionModel);
			},

			startup: function() {
				questionsTab.startup();
				answersTab.startup();

				sessionModel.watchKey(onSessionKeyChange);
			}
		};

		/* private "methods" */
		var onSessionKeyChange = function(name, oldValue, value) {
			var questions = lecturerQuestionModel.getAll();
			when(questions, function(questions) {
				questionsTab.update(questions);
			});
		};

		return self;
	}
);
