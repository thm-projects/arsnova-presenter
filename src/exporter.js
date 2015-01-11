/*
 * This file is part of ARSnova Presenter.
 * Copyright 2013-2015 Daniel Gerhardt <code@dgerhardt.net>
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
		"dojo/_base/lang",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/promise/all",
		"dojo/when",
		"libarsnova/session",
		"libarsnova/lecturerQuestion",
		"libarsnova/audienceQuestion"
	],
	function (lang, domConstruct, domStyle, all, when, sessionModel, lecturerQuestionModel, audienceQuestionModel) {
		"use strict";

		var
			self = null,

			dlLinkNode = null
		;

		self = {
			exportSession: function () {
				var
					session = lang.clone(sessionModel.getCurrent()),
					promises = []
				;

				delete session._hidden;
				delete session._scenario;
				session.questions = [];
				lecturerQuestionModel.getAll().then(function (lecturerQuestions) {
					lecturerQuestions.forEach(function (question) {
						question = lang.clone(question);
						delete question._hidden;
						delete question._scenario;
						session.questions.push(question);
						question.answers = [];
						if (!question.round || question.round < 1) {
							question.round = 1;
						}
						var promise;
						var promiseFunc = function (answers) {
							answers.forEach(function (answer) {
								answer = lang.clone(answer);
								delete answer._hidden;
								delete answer._scenario;
								delete answer._id;
								question.answers.push(answer);
							});
						};
						for (var i = 1; i <= question.round; i++) {
							promises.push(promise = lecturerQuestionModel.getAnswers(question.id, i));
							when(promise).then(promiseFunc);
						}
					});
					all(promises).then(function (answers) {
						self.saveJson(session, session.id);
					});
				});
			},

			saveJson: function (object, name) {
				dlLinkNode = domConstruct.create("a", {
					href: "data:application/json;base64," + btoa(JSON.stringify(object, null, "\t") + "\n"),
					download: "arsnova-" + name + ".json"
				}, document.body);
				domStyle.set(dlLinkNode, "display", "none");
				dlLinkNode.click();
			}
		};

		return self;
	}
);
