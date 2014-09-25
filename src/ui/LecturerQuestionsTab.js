/*
 * This file is part of ARSnova Presenter.
 * Copyright 2013-2014 Daniel Gerhardt <code@dgerhardt.net>
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
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/on",
		"dojo/topic",
		"dojo/when",
		"dojo/dom-construct",
		"dijit/a11yclick",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/appState",
		"arsnova-presenter/ui/mathJax",
		"arsnova-presenter/ui/lecturerPaneAnswersTab",
		"libarsnova/session",
		"libarsnova/lecturerQuestion",
		"dojo/i18n",
		"dojo/i18n!./nls/lecturerQuestions",
		"dojo/i18n!./nls/session"
	],
	function (declare, lang, on, topic, when, domConstruct, a11yclick, ContentPane, appState, mathJax, answersTab, sessionModel, lecturerQuestionModel, i18n, messages, sessionMessages) {
		"use strict";

		return declare("LecturerQuestionsTab", ContentPane, {
			editing: false,
			questionVariant: null,
			title: messages.questions,
			questionListNode: null,

			init: function (editing, type) {
				this.editing = editing;
				this.type = type;
				this.title = "lecture" === type ? messages.lectureQuestions : messages.preparationQuestions;

				this.questionListNode = domConstruct.create("div", {"class": "lecturerQuestionList"}, this.domNode);

				/* TODO: remove model.watchKey when completely replaced */
				//sessionModel.watchKey(lang.hitch(this, this.onSessionKeyChange));
				appState.watch("sessionId", lang.hitch(this, this.onSessionKeyChange));
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
						questionNode.appendChild(document.createTextNode(question.body));
						mathJax.parse(questionNode);
						on(questionNode, a11yclick, lang.hitch(this, function (event) {
							if (this.editing) {
								topic.publish("arsnova/question/edit", question.id);
							} else {
								/* TODO: remove model.setId when completely replaced */
								//lecturerQuestionModel.setId(question.id);
								appState.set("questionId", question.id);
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
				var self = this;
				when(lecturerQuestionModel.getAll(), lang.hitch(this, function (cache) {
					var questions = cache.filter(lang.hitch(this, function (question) {
						if ("lecture" === this.type) {
							return !question.type || "lecture" === question.type;
						} else {
							return question.type && this.type === question.type;
						}
					}));
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
