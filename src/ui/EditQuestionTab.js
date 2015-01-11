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
		"dojo/_base/declare",
		"dojo/on",
		"dojo/topic",
		"dojo/keys",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/ValidationTextBox",
		"dijit/form/Textarea",
		"dijit/form/Select",
		"dijit/form/MultiSelect",
		"dijit/form/ComboBox",
		"dijit/form/CheckBox",
		"dijit/form/RadioButton",
		"dojox/form/CheckedMultiSelect",
		"dojo/store/Memory",
		"dgerhardt/common/confirmDialog",
		"libarsnova/lecturerQuestion",
		"dojo/i18n",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/lecturerQuestions",
		"dojo/i18n!./nls/answerOptions"
	],
	function (lang, declare, on, topic, keys, domConstruct, domStyle, ContentPane, Form, Button, TextBox, TextArea, Select, MultiSelect, ComboBox, CheckBox, RadioButton, CheckedMultiSelect, MemoryStore, confirmDialog, lecturerQuestion, i18n, commonMessages, messages, answerOptions) {
		"use strict";

		var self, tabs = [];

		self = declare("EditQuestionTab", ContentPane, {
			closable: true,
			modified: false,
			questionId: null,
			form: null,
			optionsForm: null,
			typeSelect: null,
			subjectField: null,
			descriptionField: null,
			formatSelect: null,
			abstentionCb: null,
			releaseCb: null,
			releaseStatsCb: null,
			releaseCorrectCb: null,

			constructor: function (questionId) {
				if (questionId) {
					this.questionId = questionId;
					this.set("title", messages.editQuestion);
				} else {
					this.set("title", messages.newQuestion);
				}

				tabs.push([questionId, this]);
			},

			init: function () {
				var container;
				this.form = new Form({
					"class": "labeled questionForm",
					doLayout: false
				});
				this.form.placeAt(this);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.mode}, container);
				(this.typeSelect = new Select({
					name: "type",
					options: [
						{value: "lecture", label: messages.lectureMode},
						{value: "preparation", label: messages.preparationMode}
					]
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.subject}, container);
				(this.subjectField = new ComboBox({
					name: "subject",
					store: new MemoryStore({
						data: lecturerQuestion.getSubjects().map(function (subject) {
							return {id: subject, name: subject};
						})
					}),
					required: true,
					trim: true
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.description}, container);
				(this.descriptionField = new TextArea({
					name: "body",
					trim: true,
					style: "width: 242px; font-family: sans-serif;"
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.format}, container);
				(this.formatSelect = new Select({
					name: "format",
					options: [
						{value: "abcd", label: messages.singleChoice},
						{value: "mc", label: messages.multipleChoice},
						{value: "yesno", label: messages.yesNo},
						{value: "vote", label: messages.likertScale},
						{value: "freetext", label: messages.freeText}
					]
				})).placeAt(container).startup();
				this.formatSelect.watch("value", lang.hitch(this, function (id, oldValue, value) {
					this.changeQuestionFormat(value);
				}));

				container.appendChild(document.createTextNode(" "));

				(this.templateSelect = new Select({
					options: [
						{value: "custom", label: answerOptions.custom},
						{value: "agreement", label: answerOptions.agreement},
						{value: "intensity", label: answerOptions.intensity},
						{value: "frequency", label: answerOptions.frequency},
						{value: "quality", label: answerOptions.quality},
						{value: "importance", label: answerOptions.importance},
						{value: "rating5", label: answerOptions.rating5},
						{value: "grades", label: answerOptions.grades}
					]
				})).placeAt(container).startup();
				domStyle.set(this.templateSelect.domNode, "display", "none");

				this.templateSelect.watch("value", lang.hitch(this, function (name, oldValue, value) {
					this.changeQuestionTemplate(value);
				}));

				this.addAnswerContainer = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.answerOption}, this.addAnswerContainer);
				var addAnswerOption = lang.hitch(this, function () {
					var type = this.getAnswerOptionType();
					var value = this.addAnswerOptionField.get("value");
					if (!value) {
						return;
					}
					this.addAnswerOption(value, type, true);
					this.addAnswerOptionField.set("value", "");
				});
				(this.addAnswerOptionField = new TextBox({
					trim: true,
					onKeyPress: function (e) {
						if (keys.ENTER === e.charOrCode) {
							addAnswerOption();
						}
					}
				})).placeAt(this.addAnswerContainer).startup();
				(this.addAnswerButton = new Button({
					label: commonMessages.add,
					onClick: addAnswerOption
				})).placeAt(this.addAnswerContainer).startup();
				if (this.questionId) {
					domStyle.set(this.addAnswerContainer, "display", "none");
				}

				this.optionsForm = new Form();
				this.optionsForm.placeAt(this.form);
				domConstruct.create("label", {innerHTML: messages.correctAnswers}, this.optionsForm.domNode);
				this.answerOptionsContainer = domConstruct.create("div", {style: "display: inline-block;"}, this.optionsForm.domNode);
				this.noCorrectOptionContainer = domConstruct.create("div", null, this.optionsForm.domNode);
				domConstruct.create("label", null, this.noCorrectOptionContainer);
				(this.noCorrectOptionButton = new RadioButton({
					name: "answerOptions",
					value: "",
					checked: true
				})).placeAt(this.noCorrectOptionContainer).startup();
				var labelTextNode = document.createTextNode("(" + commonMessages.notApplicable + ")");
				var labelNode = domConstruct.create("label", null, this.noCorrectOptionContainer);
				labelNode.appendChild(labelTextNode);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.allowAbstentions}, container);
				(this.abstentionCb = new CheckBox({
					name: "allowAbstentions"
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.releaseQuestion}, container);
				(this.releaseCb = new CheckBox({
					name: "active",
					checked: true
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.releaseStatistics}, container);
				(this.releaseStatsCb = new CheckBox({
					name: "publishResults",
					checked: true
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.releaseCorrectAnswer}, container);
				(this.releaseCorrectCb = new CheckBox({
					name: "publishCorrectAnswer",
					checked: false
				})).placeAt(container).startup();

				(new Button({
					label: this.questionId ? commonMessages.update : commonMessages.create,
					onClick: lang.hitch(this, this.questionId ? this.updateQuestion : this.createQuestion)
				})).placeAt(this.form).startup();

				if (this.questionId) {
					(new Button({
						label: commonMessages.del,
						onClick: lang.hitch(this, function () {
							var buttons = {};
							buttons[commonMessages.del] = lang.hitch(this, this.deleteQuestion);
							buttons[commonMessages.cancel] = null;
							confirmDialog.confirm(messages.deleteQuestion, messages.deleteQuestionConfirm, buttons);
						})
					})).placeAt(this.form).startup();

					(new Button({
						label: commonMessages.reset,
						onClick: lang.hitch(this, function () {
							var buttons = {};
							buttons[commonMessages.reset] = lang.hitch(this, this.resetQuestion);
							buttons[commonMessages.cancel] = null;
							confirmDialog.confirm(messages.resetQuestion, messages.resetQuestionConfirm, buttons);
						})
					})).placeAt(this.form).startup();
				}

				if (this.questionId) {
					lecturerQuestion.get(this.questionId).then(lang.hitch(this, function (question) {
						this.fillForm(question);
					}));
				}

				this.form.watch("value", lang.hitch(this, function (name, oldValue, value) {
					this.modified = true;
				}));
			},

			changeQuestionFormat: function (format) {
				if (!this.questionId) {
					domStyle.set(this.addAnswerContainer, "display", "");
				}
				domConstruct.empty(this.answerOptionsContainer);
				domStyle.set(this.templateSelect.domNode, "display", "none");
				domStyle.set(this.optionsForm.domNode, "display", "");
				domStyle.set(this.noCorrectOptionContainer, "display", "none");

				switch (format) {
				case "abcd":
					domStyle.set(this.noCorrectOptionContainer, "display", "");
					this.noCorrectOptionButton.set("checked", true);
					break;
				case "mc":
					break;
				case "yesno":
					domStyle.set(this.addAnswerContainer, "display", "none");
					this.addAnswerOption(commonMessages.yes, "sc");
					this.addAnswerOption(commonMessages.no, "sc");
					domStyle.set(this.noCorrectOptionContainer, "display", "");
					this.noCorrectOptionButton.set("checked", true);
					break;
				case "vote":
					this.templateSelect.set("value", "");
					domStyle.set(this.templateSelect.domNode, "display", "");
					break;
				case "freetext":
					domStyle.set(this.addAnswerContainer, "display", "none");
					domStyle.set(this.optionsForm.domNode, "display", "none");
					break;
				}
			},

			changeQuestionTemplate: function (template) {
				domConstruct.empty(this.answerOptionsContainer);
				if ("custom" !== template) {
					domStyle.set(this.addAnswerContainer, "display", "none");
					var options = this.getTemplateOptions(template);
					options.forEach(lang.hitch(this, function (name) {
						this.addAnswerOption(name, "hidden");
					}));
				} else {
					domStyle.set(this.addAnswerContainer, "display", "");
				}
			},

			getTemplateOptions: function (template) {
				var options = [], templates, i;

				templates = {
					agreement: 5,
					intensity: 5,
					frequency: 5,
					quality: 5,
					importance: 5,
					grades: 6
				};

				if (templates.hasOwnProperty(template)) {
					for (i = 1; i <= templates[template]; i++) {
						options.push(answerOptions[template + i]);
					}
				} else if ("rating5" === template) {
					options = [5, 4, 3, 2, 1];
				}

				return options;
			},

			getAnswerOptionType: function () {
				var type;
				if ("abcd" === this.formatSelect.get("value") || "yesno" === this.formatSelect.get("value")) {
					type = "sc";
				} else if ("vote" === this.formatSelect.get("value")) {
					type = "hidden";
				} else {
					type = "mc";
				}

				return type;
			},

			addAnswerOption: function (name, type, removable, checked) {
				var widget;
				var optionContainer = domConstruct.create("div", null, this.answerOptionsContainer);
				var WidgetType = "mc" === type ? CheckBox : RadioButton;
				(widget = new WidgetType({
					name: "answerOptions",
					value: name,
					checked: !!checked,
					style: "hidden" === type ? "display: none;" : null
				})).placeAt(optionContainer).startup();
				var labelTextNode = document.createTextNode(name);
				var labelNode = domConstruct.create("label", null, optionContainer);
				labelNode.appendChild(labelTextNode);
				if (removable) {
					(new Button({
						label: "X",
						onClick: function (event) {
							domConstruct.destroy(optionContainer);
						}
					})).placeAt(optionContainer);
				}

				return widget;
			},

			fillForm: function (question) {
				/* Form.set("value", ...) cannot be used since it does not handle CheckBox widgets correctly */
				this.form.getChildren().forEach(function (widget) {
					if (widget.name && question.hasOwnProperty(widget.name)) {
						widget.set("value", question[widget.name]);
					}
				});

				var type = this.getAnswerOptionType();
				domConstruct.empty(this.answerOptionsContainer);
				question.answerOptions.forEach(lang.hitch(this, function (answer) {
					var widget = this.addAnswerOption(answer.text, type, false, !!answer.correct);
					widget.set("checked", !!answer.correct);
				}));
			},

			setupFieldStatus: function (enabled) {
				this.form.getChildren().forEach(function (widget) {
					widget.set("disabled", !enabled);
				});
				this.optionsForm.getChildren().forEach(function (widget) {
					widget.set("disabled", !enabled);
				});
				if (enabled && this.questionId) {
					this.typeSelect.set("disabled", true);
					this.formatSelect.set("disabled", true);
					this.templateSelect.set("disabled", true);
				}
			},

			showModalMessage: function (message, messageClass) {
				this.setupFieldStatus(false);
				ContentPane.prototype.showModalMessage.call(this, message, messageClass);
			},

			hideModalMessage: function () {
				this.setupFieldStatus(true);
				ContentPane.prototype.hideModalMessage.call(this);
			},

			createQuestion: function () {
				if (!this.form.validate()) {
					return;
				}

				var question = this.form.get("value");
				this.showModalMessage(messages.creatingQuestion + "...", "info");

				question.allowAbstentions = question.allowAbstentions.length > 0;
				question.active = question.active.length > 0;
				question.publishResults = question.publishResults.length > 0;
				question.publishCorrectAnswer = question.publishCorrectAnswer.length > 0;
				question.answerOptions = [];
				this.optionsForm.getChildren().forEach(function (widget) {
					if ("answerOptions" === widget.name && widget.value) {
						question.answerOptions.push({
							text: widget.value,
							correct: widget.checked
						});
					}
				});
				lecturerQuestion.create(question).then(lang.hitch(this, function () {
					this.showModalMessage(messages.questionSaved, "success");
					setTimeout(lang.hitch(this, this.close), 1500);
					topic.publish("arsnova/question/update");
				}), lang.hitch(this, function (error) {
					console.error("Could not update question");
					this.showModalMessage(messages.questionNotSaved, "error");
					setTimeout(lang.hitch(this, this.hideModalMessage), 3000);
				}));
			},

			updateQuestion: function () {
				if (!this.form.validate()) {
					return;
				}

				var newQuestion = this.form.get("value");
				this.showModalMessage(messages.updatingQuestion + "...", "info");

				lecturerQuestion.get(this.questionId).then(lang.hitch(this, function (question) {
					for (var attr in newQuestion) {
						if (newQuestion.hasOwnProperty(attr)) {
							question[attr] = newQuestion[attr];
						}
					}
					question.allowAbstentions = question.allowAbstentions.length > 0;
					question.active = question.active.length > 0;
					question.publishResults = question.publishResults.length > 0;
					question.publishCorrectAnswer = question.publishCorrectAnswer.length > 0;

					var correctAnswerOptions = {};
					this.optionsForm.getChildren().forEach(function (widget, i) {
						if ("answerOptions" === widget.name && widget.value) {
							question.answerOptions[i].correct = widget.checked;
						}
					});

					lecturerQuestion.update(question).then(lang.hitch(this, function () {
						this.showModalMessage(messages.questionSaved, "success");
						setTimeout(lang.hitch(this, this.close), 1500);
						topic.publish("arsnova/question/update");
					}), lang.hitch(this, function (error) {
						console.error("Could not update question");
						this.showModalMessage(messages.questionNotSaved, "error");
						setTimeout(lang.hitch(this, this.hideModalMessage), 3000);
					}));
				}));
			},

			deleteQuestion: function () {
				this.showModalMessage(messages.deletingQuestion + "...", "info");
				lecturerQuestion.remove(this.questionId).then(lang.hitch(this, function () {
					this.showModalMessage(messages.questionDeleted, "success");
					setTimeout(lang.hitch(this, this.close), 1500);
					topic.publish("arsnova/question/update");
				}), lang.hitch(this, function (error) {
					console.error("Could not delete question");
					this.showModalMessage(messages.questionNotDeleted, "error");
					setTimeout(lang.hitch(this, this.hideModalMessage), 3000);
				}));
			},

			resetQuestion: function () {
				this.showModalMessage(messages.resettingQuestion + "...", "info");
				lecturerQuestion.removeAllAnswers(this.questionId).then(lang.hitch(this, function () {
					this.showModalMessage(messages.questionReset, "success");
					setTimeout(lang.hitch(this, this.hideModalMessage), 1500);
				}), lang.hitch(this, function (error) {
					console.error("Could not reset question");
					this.showModalMessage(messages.questionNotReset, "error");
					setTimeout(lang.hitch(this, this.hideModalMessage), 3000);
				}));
			},

			close: function () {
				this.getParent().removeChild(this);
				/* unfortunately tc.removeChild(...) does not fire an onClose event */
				this.onClose();
			},

			onClose: function () {
				tabs.forEach(lang.hitch(this, function (tab, i) {
					if (tab[1] === this) {
						delete tabs[i];
					}
				}));

				return true;
			}
		});

		self.getInstances = function () {
			return tabs;
		};

		self.getTab = function (questionId) {
			var result = null;
			tabs.forEach(function (tab) {
				if (questionId === tab[0]) {
					result = tab[1];
				}
			});

			return result;
		};

		return self;
	}
);
