/*
 * Copyright 2013-2014 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
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
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-class",
		"dojo/date/locale",
		"dijit/registry",
		"dijit/a11yclick",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/MenuItem",
		"dgerhardt/common/confirmDialog",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/ui/mathJax",
		"arsnova-api/session",
		"arsnova-api/audienceQuestion",
		"dojo/i18n",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/audienceQuestions",
		"dojo/i18n!./nls/session"
	],
	function (on, when, dom, domConstruct, domClass, dateLocale, registry, a11yclick, ContentPane, MenuItem, confirmDialog, fullScreen, mathJax, sessionModel, audienceQuestionModel, i18n, commonMessages, messages, sessionMessages) {
		"use strict";

		var
			self = null,
			model = null,
			newQuestionsCount = 0,

			/* declarations of private "methods" */
			onSessionKeyChange = null,

			/* DOM */
			questionListNode = null,

			/* Dijit */
			tabContainer = null,
			pane = null
		;

		self = {
			/* public "methods" */
			init: function (_tabContainer) {
				tabContainer = _tabContainer;
				model = audienceQuestionModel;

				pane = new ContentPane({
					id: "audienceQuestionsPane",
					title: messages.audienceQuestions
				});

				return pane;
			},

			startup: function () {
				pane.showModalMessage(sessionMessages.noSession, "gray");
				questionListNode = domConstruct.create("div", {id: "audienceQuestionList"}, pane.domNode);

				sessionModel.watchKey(onSessionKeyChange);

				model.onQuestionAvailable(function (questionId) {
					var question = model.get(questionId);
					question.then(function (question) {
						self.prependQuestionToList(question);
						if (!pane.get("selected")) {
							newQuestionsCount++;
							var label = messages.audienceQuestions + " (+" + newQuestionsCount + ")";
							pane.set("title", label);
							pane.controlButton.set("label", label);
						}
					});
				});

				/* reset new questions count when this tab is activated */
				tabContainer.watch("selectedChildWidget", function (name, oldValue, value) {
					if (value === pane) {
						newQuestionsCount = 0;
						pane.set("title", messages.audienceQuestions);
						pane.controlButton.set("label", messages.audienceQuestions);
					}
				});

				/* add full screen menu items */
				var fullScreenMenu = registry.byId("fullScreenMenu");
				fullScreenMenu.addChild(new MenuItem({
					label: messages.audienceQuestions,
					onClick: self.toggleFullScreenMode
				}));

				/* handle events fired when full screen mode is canceled */
				fullScreen.onChange(function (event, isActive) {
					if (!isActive) {
						self.exitFullScreenMode();

						pane.resize();
					}
				});
			},

			update: function (questions) {
				domConstruct.empty(questionListNode);
				when(questions, function (questions) {
					questions.forEach(function (question) {
						self.prependQuestionToList(question);
					});

					if (0 === questions.length) {
						pane.showModalMessage(messages.noQuestions, "gray");
					}
				});
			},

			prependQuestionToList: function (question) {
				pane.hideModalMessage();
				var questionNode = domConstruct.create("div", {"class": "question", tabindex: 0}, questionListNode, "first");
				var subjectNode = domConstruct.create("p", {"class": "subject"}, questionNode);
				subjectNode.appendChild(document.createTextNode(question.subject));
				var deleteNode = domConstruct.create("span", {"class": "delete", tabindex: 0, title: commonMessages.del, innerHTML: "x"}, questionNode);
				domConstruct.create("div", {"class": "clearFix"}, questionNode);
				var messageNode = domConstruct.create("p", {"class": "message"}, questionNode);
				if (!question.read) {
					domClass.add(questionNode, "unread");
				}
				if (question.text) {
					domClass.add(questionNode, "loaded");
					messageNode.appendChild(document.createTextNode(question.text));
					mathJax.parse(messageNode);
				}
				var date = new Date(question.timestamp);
				var dateTime = dateLocale.format(date, {selector: "date", formatLength: "long"})
					+ " " + dateLocale.format(date, {selector: "time", formatLength: "short"})
				;
				domConstruct.create("footer", {"class": "creationTime", innerHTML: dateTime}, questionNode);
				on(questionNode, a11yclick, function (event) {
					self.openQuestion(question._id, questionNode, messageNode);
				});
				on(deleteNode, a11yclick, function (event) {
					if (event.stopPropagation) { /* IE8 does not support stopPropagation */
						event.stopPropagation();
					}
					var buttons = {};
					buttons[commonMessages.del] = function () {
						model.remove(question._id);
						domConstruct.destroy(questionNode);
						if (0 === questionListNode.children.length) {
							pane.showModalMessage(messages.noQuestions, "gray");
						}
					};
					buttons[commonMessages.cancel] = null;
					confirmDialog.confirm(messages.deleteQuestion, messages.deleteQuestionConfirm, buttons);
				});
			},

			openQuestion: function (questionId, questionNode, messageNode) {
				if (domClass.contains(questionNode, "opened")) {
					domClass.remove(questionNode, "opened");

					return;
				}
				if (domClass.contains(questionNode, "loaded")) {
					domClass.add(questionNode, "opened");

					return;
				}
				var question = model.get(questionId);
				when(question, function (question) {
					domClass.remove(questionNode, "unread");
					domClass.add(questionNode, "opened");
					domClass.add(questionNode, "loaded");
					messageNode.appendChild(document.createTextNode(question.text));
					mathJax.parse(messageNode);
				});
			},

			toggleFullScreenMode: function () {
				if (fullScreen.isActive()) {
					/* dom node rearrangement takes place in fullscreenchange event handler */
					fullScreen.exit();
				} else {
					fullScreen.request(dom.byId("fullScreenContainer"));
					domConstruct.create("header", {id: "audienceQuestionsTitle", innerHTML: messages.audienceQuestions}, "fullScreenHeader");
					domConstruct.place(questionListNode, "fullScreenContent");

					registry.byId("fullScreenContainer").resize();
				}
			},

			exitFullScreenMode: function () {
				domConstruct.place(dom.byId("audienceQuestionList"), pane.domNode);
				domConstruct.destroy("audienceQuestionsTitle");
			}
		};

		/* private "methods" */
		onSessionKeyChange = function (name, oldValue, value) {
			domConstruct.empty(questionListNode);
			if (value) {
				pane.showModalMessage(messages.loadingQuestions + "...", "info");
				var questions = audienceQuestionModel.getAll();
				when(questions, function (questions) {
					questions.sort(function (obj1, obj2) {
						return obj1.timestamp - obj2.timestamp;
					});
					self.update(questions);
				});
			} else {
				pane.showModalMessage(sessionMessages.noSession, "gray");
			}
		};

		return self;
	}
);
