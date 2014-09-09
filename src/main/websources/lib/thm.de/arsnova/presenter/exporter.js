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
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/promise/all",
		"dojo/when",
		"arsnova-api/session",
		"arsnova-api/lecturerQuestion",
		"arsnova-api/audienceQuestion"
	],
	function (domConstruct, domStyle, all, when, sessionModel, lecturerQuestionModel, audienceQuestionModel) {
		"use strict";

		var
			self = null,

			dlLinkNode = null
		;

		self = {
			exportSession: function () {
				var
					session = sessionModel.getCurrent(),
					promises = []
				;

				lecturerQuestionModel.getAll().then(function (lecturerQuestions) {
					lecturerQuestions.forEach(function (question) {
						question.answers = [];
						if (!question.piRound || question.piRound < 1) {
							question.piRound = 1;
						}
						var promise;
						var promiseFunc = function (answers) {
							question.answers.push(answers);
						};
						for (var i = 1; i <= question.piRound; i++) {
							promises.push(promise = lecturerQuestionModel.getAnswers(question._id, i));
							console.debug(promise);
							when(promise).then(promiseFunc);
						}
					});
					session.questions = lecturerQuestions;
					all(promises).then(function (answers) {
						self.saveJson(session, session.keyword);
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
