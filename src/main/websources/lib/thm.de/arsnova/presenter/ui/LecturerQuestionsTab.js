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
		"dojo/i18n!./nls/lecturerQuestions",
		"dojo/i18n!./nls/session"
	],
	function (declare, lang, on, topic, when, domConstruct, a11yclick, ContentPane, mathJax, answersTab, sessionModel, lecturerQuestionModel, i18n, messages, sessionMessages) {
		"use strict";

		return declare("LecturerQuestionsTab", ContentPane, {
			editing: false,
			questionVariant: null,
			title: messages.questions,
			questionListNode: null,

			init: function (editing, questionVariant) {
				this.editing = editing;
				this.questionVariant = questionVariant;
				this.title = "lecture" === questionVariant ? messages.lectureQuestions : messages.preparationQuestions;

				this.questionListNode = domConstruct.create("div", {"class": "lecturerQuestionList"}, this.domNode);

				sessionModel.watchKey(lang.hitch(this, this.onSessionKeyChange));
				topic.subscribe("arsnova/question/update", lang.hitch(this, function () {
					this.load();
				}));
			},

			startup: function () {
				ContentPane.prototype.startup.call(this);
				this.showModalMessage(sessionMessages.noSession, "gray");
			},

			update: function (questions) {
				domConstruct.empty(this.questionListNode);

				if (!questions) {
					return;
				}

				when(questions, lang.hitch(this, function (questions) {
					if (0 === questions.length) {
						this.showModalMessage(messages.noQuestions, "disabled");

						return;
					} else {
						this.hideModalMessage();
					}

					/* group questions by category */
					var categories = {};
					questions.forEach(function (question) {
						if (!categories[question.subject]) {
							categories[question.subject] = [];
						}
						categories[question.subject].push(question);
					});

					var handleQuestion = lang.hitch(this, function (question) {
						var questionNode = domConstruct.create("p", {"class": "question", tabindex: 0}, categoryNode);
						questionNode.appendChild(document.createTextNode(question.text));
						mathJax.parse(questionNode);
						on(questionNode, a11yclick, lang.hitch(this, function (event) {
							if (this.editing) {
								topic.publish("arsnova/question/edit", question._id);
							} else {
								lecturerQuestionModel.setId(question._id);
								answersTab.selectTab();
							}
						}));
					});

					for (var category in categories) {
						if (categories.hasOwnProperty(category)) {
							var categoryNode = domConstruct.create("div", {"class": "questionCategory"}, this.questionListNode);
							var categoryHeaderNode = domConstruct.create("header", null, categoryNode);
							categoryHeaderNode.appendChild(document.createTextNode(category));
							categories[category].forEach(handleQuestion);
						}
					}
				}));
			},

			load: function () {
				this.showModalMessage(messages.loadingQuestions + "...", "info");
				var questions = lecturerQuestionModel.getAll().filter(lang.hitch(this, function (question) {
					if ("lecture" === this.questionVariant) {
						return !question.questionVariant || "lecture" === question.questionVariant;
					} else {
						return question.questionVariant && this.questionVariant === question.questionVariant;
					}
				}));
				when(questions, lang.hitch(this, function (questions) {
					this.update(questions);
				}));
			},

			enableEditing: function (enable) {
				this.editing = !!enable;
			},

			onSessionKeyChange: function (name, oldValue, value) {
				domConstruct.empty(this.questionListNode);
				if (value) {
					this.load();
				} else {
					this.showModalMessage(sessionMessages.noSession, "gray");
				}
			}
		});
	}
);
