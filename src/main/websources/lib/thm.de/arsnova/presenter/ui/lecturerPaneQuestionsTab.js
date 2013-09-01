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
		"dijit/a11yclick",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/ui/mathJax",
		"arsnova-presenter/ui/lecturerPaneAnswersTab",
		"arsnova-api/session",
		"arsnova-api/lecturerQuestion",
		"dojo/i18n",
		"dojo/i18n!./nls/lecturerQuestions"
	],
	function (on, topic, when, domConstruct, a11yclick, ContentPane, mathJax, answersTab, sessionModel, lecturerQuestionModel, i18n) {
		"use strict";

		var
			self = null,
			model = null,
			messages = null,

			/* declarations of private "methods" */
			onSessionKeyChange = null,

			/* DOM */
			questionListNode = null,

			/* Dijit */
			pane = null
		;

		self = {
			/* public "methods" */
			init: function () {
				model = lecturerQuestionModel;

				messages = i18n.getLocalization("arsnova-presenter/ui", "lecturerQuestions");

				pane = new ContentPane({
					id: "piQuestionsPane",
					title: messages.questions
				});

				return pane;
			},

			startup: function () {
				questionListNode = domConstruct.create("div", {id: "piQuestionList"}, pane.domNode);

				sessionModel.watchKey(onSessionKeyChange);
			},

			update: function (questions) {
				domConstruct.empty(questionListNode);

				if (!questions) {
					return;
				}

				when(questions, function (questions) {
					/* group questions by category */
					var categories = {};
					questions.forEach(function (question) {
						if (!categories[question.subject]) {
							categories[question.subject] = [];
						}
						categories[question.subject].push(question);
					});

					var handleQuestion = function (question) {
						var questionNode = domConstruct.create("p", {"class": "question", tabindex: 0}, categoryNode);
						questionNode.appendChild(document.createTextNode(question.text));
						mathJax.parse(questionNode);
						on(questionNode, a11yclick, function (event) {
							model.setId(question._id);
							answersTab.selectTab();
						});
					};

					for (var category in categories) {
						if (categories.hasOwnProperty(category)) {
							var categoryNode = domConstruct.create("div", {"class": "questionCategory"}, questionListNode);
							var categoryHeaderNode = domConstruct.create("header", null, categoryNode);
							categoryHeaderNode.appendChild(document.createTextNode(category));
							categories[category].forEach(handleQuestion);
						}
					}
				});
			}
		};

		/* private "methods" */
		onSessionKeyChange = function (name, oldValue, value) {
			var questions = lecturerQuestionModel.getAll();
			when(questions, function (questions) {
				self.update(questions);
			});
		};

		return self;
	}
);
