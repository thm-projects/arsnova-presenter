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
		"dojo/_base/declare",
		"dojo/_base/lang",
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
	function (declare, lang, on, topic, when, domConstruct, a11yclick, ContentPane, mathJax, answersTab, sessionModel, lecturerQuestionModel, i18n, messages) {
		"use strict";

		return declare("LecturerQuestionsTab", ContentPane, (function () {
			return {
				editing: false,
				title: messages.questions,
				questionListNode: null,

				init: function () {
					this.questionListNode = domConstruct.create("div", {"class": "lecturerQuestionList"}, this.domNode);

					sessionModel.watchKey(lang.hitch(this, this.onSessionKeyChange));
				},

				startup: function () {},

				update: function (questions) {
					domConstruct.empty(this.questionListNode);

					if (!questions) {
						return;
					}

					when(questions, lang.hitch(this, function (questions) {
						/* group questions by category */
						var categories = {};
						questions.forEach(function (question) {
							if (!categories[question.subject]) {
								categories[question.subject] = [];
							}
							categories[question.subject].push(question);
						});

						for (var category in categories) {
							if (categories.hasOwnProperty(category)) {
								var categoryNode = domConstruct.create("div", {"class": "questionCategory"}, this.questionListNode);
								var categoryHeaderNode = domConstruct.create("header", null, categoryNode);
								categoryHeaderNode.appendChild(document.createTextNode(category));
								categories[category].forEach(function (question) {
									this.handleQuestion(question, categoryNode);
								}, this);
							}
						}
					}));
				},

				handleQuestion: function (question, categoryNode) {
					var questionNode = domConstruct.create("p", {"class": "question", tabindex: 0}, categoryNode);
					questionNode.appendChild(document.createTextNode(question.text));
					mathJax.parse(questionNode);
					on(questionNode, a11yclick, lang.hitch(this, function (event) {
						lecturerQuestionModel.setId(question._id);
						if (this.editing) {
							topic.publish("arsnova/question/edit", question._id);
						} else {
							answersTab.selectTab();
						}
					}));
				},

				enableEditing: function (enable) {
					this.editing = !!enable;
				},

				onSessionKeyChange: function (name, oldValue, value) {
					var questions = lecturerQuestionModel.getAll();
					when(questions, lang.hitch(this, function (questions) {
						this.update(questions);
					}));
				}
			};
		}()));
	}
);
