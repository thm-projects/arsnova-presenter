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
		"dojo/_base/lang",
		"dojo/_base/declare",
		"dojo/on",
		"dojo/topic",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/ValidationTextBox",
		"dijit/form/Select",
		"dijit/form/MultiSelect",
		"dijit/form/ComboBox",
		"dijit/form/CheckBox",
		"dijit/form/RadioButton",
		"dojox/form/CheckedMultiSelect",
		"dojo/store/Memory",
		"arsnova-api/lecturerQuestion",
		"dojo/i18n",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/lecturerQuestions",
		"dojo/i18n!./nls/answerOptions"
	],
	function (lang, declare, on, topic, domConstruct, domStyle, ContentPane, Form, Button, TextBox, Select, MultiSelect, ComboBox, CheckBox, RadioButton, CheckedMultiSelect, MemoryStore, lecturerQuestion, i18n, commonMessages, messages, answerOptions) {
		"use strict";

		var self, tabs = [];

		self = declare("EditQuestionTab", ContentPane, {
			closable: true,
			modified: false,
			questionId: null,
			form: null,
			optionsForm: null,
			subjectField: null,
			descriptionField: null,
			typeSelect: null,
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
					"class": "labeled",
					doLayout: false
				});
				this.form.placeAt(this);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.mode}, container);
				(this.typeSelect = new Select({
					name: "questionVariant",
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
				(this.descriptionField = new TextBox({
					name: "text",
					required: true,
					trim: true
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.format}, container);
				(this.typeSelect = new Select({
					name: "questionType",
					options: [
						{value: "abcd", label: messages.singleChoice},
						{value: "mc", label: messages.multipleChoice},
						{value: "yesno", label: messages.yesNo},
						{value: "ls", label: messages.likertScale},
						{value: "freetext", label: messages.freeText}
					]
				})).placeAt(container).startup();
				this.typeSelect.watch("value", lang.hitch(this, function (id, oldValue, value) {
					this.addAnswerOptionField.set("disabled", false);
					this.addAnswerButton.set("disabled", false);
					domStyle.set(this.templateSelect.domNode, "display", "none");

					switch (value) {
					case "abcd":
						domConstruct.empty(this.answerOptionsContainer);
						break;
					case "mc":
						domConstruct.empty(this.answerOptionsContainer);
						break;
					case "yesno":
						this.addAnswerOptionField.set("disabled", true);
						this.addAnswerButton.set("disabled", true);
						domConstruct.empty(this.answerOptionsContainer);
						this.addAnswerOption(commonMessages.yes, "sc");
						this.addAnswerOption(commonMessages.no, "sc");
						this.addAnswerOption(null, "sc", false, true);
						break;
					case "ls":
						domConstruct.empty(this.answerOptionsContainer);
						domStyle.set(this.templateSelect.domNode, "display", "");
						break;
					case "freetext":
						this.addAnswerOptionField.set("disabled", true);
						this.addAnswerButton.set("disabled", true);
						domConstruct.empty(this.answerOptionsContainer);
						break;
					}
				}));

				(this.templateSelect = new Select({
					options: [
						{value: "", label: answerOptions.custom},
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
					domConstruct.empty(this.answerOptionsContainer);
					if (value) {
						this.addAnswerOptionField.set("disabled", true);
						this.addAnswerButton.set("disabled", true);
						var options = this.getTemplateOptions(value);
						options.forEach(lang.hitch(this, function (name) {
							this.addAnswerOption(name, "hidden");
						}));
					} else {
						this.addAnswerOptionField.set("disabled", false);
						this.addAnswerButton.set("disabled", false);
					}
				}));

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.answerOption}, container);
				(this.addAnswerOptionField = new TextBox({
					trim: true
				})).placeAt(container).startup();
				(this.addAnswerButton = new Button({
					label: commonMessages.add,
					onClick: lang.hitch(this, function () {
						var type;
						var value = this.addAnswerOptionField.get("value");
						if (!value) {
							return;
						}
						if ("abcd" === this.typeSelect.get("value")) {
							type = "sc";
						} else if ("ls" === this.typeSelect.get("value")) {
							type = "hidden";
						} else {
							type = "mc";
						}
						this.addAnswerOption(value, type, true);
						this.addAnswerOptionField.set("value", "");
					})
				})).placeAt(container).startup();

				this.optionsForm = new Form();
				this.optionsForm.placeAt(this.form);
				domConstruct.create("label", {innerHTML: messages.correctAnswers}, this.optionsForm.domNode);
				this.answerOptionsContainer = domConstruct.create("div", {style: "display: inline-block;"}, this.optionsForm.domNode);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.allowAbstentions}, container);
				(this.abstentionCb = new CheckBox({
					name: "abstention"
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
					name: "showStatistic",
					checked: true
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: messages.releaseCorrectAnswer}, container);
				(this.releaseCorrectCb = new CheckBox({
					name: "showAnswer",
					checked: true
				})).placeAt(container).startup();

				(new Button({
					label: this.questionId ? commonMessages.update : commonMessages.create,
					onClick: lang.hitch(this, this.questionId ? this.updateQuestion : this.createQuestion)
				})).placeAt(this.form).startup();

				if (this.questionId) {
					this.fillForm(lecturerQuestion.get(this.questionId));
				}

				this.form.watch("value", lang.hitch(this, function (name, oldValue, value) {
					this.modified = true;
				}));
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

			addAnswerOption: function (name, type, removable, checked) {
				var optionContainer = domConstruct.create("div", null, this.answerOptionsContainer);
				var Widget = "mc" === type ? CheckBox : RadioButton;
				(new Widget({
					name: "answerOptions",
					value: name ? name : null,
					checked: !!checked,
					style: "hidden" === type ? "display: none;" : null
				})).placeAt(optionContainer).startup();
				var labelTextNode = document.createTextNode(name ? name : "(" + commonMessages.notApplicable + ")");
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
			},

			fillForm: function (question) {
				/* Form.set("value", ...) cannot be used since it does not handle CheckBox widgets correctly */
				this.form.getChildren().forEach(function (widget) {
					if (widget.name && question.hasOwnProperty(widget.name)) {
						widget.set("value", question[widget.name]);
					}
				});
			},

			createQuestion: function () {
				if (!this.form.validate()) {
					return;
				}

				var question = this.form.get("value");
				question.abstention = question.abstention.length > 0;
				question.active = question.active.length > 0;
				question.showStatistic = question.showStatistic.length > 0;
				question.showAnswer = question.showAnswer.length > 0;
				question.possibleAnswers = [];
				this.optionsForm.getChildren().forEach(function (widget) {
					if ("answerOptions" === widget.name && widget.value) {
						question.possibleAnswers.push({
							text: widget.value,
							correct: widget.checked
						});
					}
				});
				lecturerQuestion.create(question).then(lang.hitch(this, function () {
					this.close();
					topic.publish("arsnova/question/update");
				}), function (error) {
					console.error("Could not create question");
				});
			},

			updateQuestion: function () {
				if (!this.form.validate()) {
					return;
				}

				var question = lecturerQuestion.get(this.questionId);
				var newQuestion = this.form.get("value");
				for (var attr in newQuestion) {
					if (newQuestion.hasOwnProperty(attr)) {
						question[attr] = newQuestion[attr];
					}
				}
				question.abstention = question.abstention.length > 0;
				question.active = question.active.length > 0;
				question.showStatistic = question.showStatistic.length > 0;
				question.showAnswer = question.showAnswer.length > 0;
				lecturerQuestion.update(question).then(lang.hitch(this, function () {
					this.close();
					topic.publish("arsnova/question/update");
				}), function (error) {
					console.error("Could not update question");
				});
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
