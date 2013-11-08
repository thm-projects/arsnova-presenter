define(
	[
		"dojo/_base/lang",
		"dojo/_base/declare",
		"dojo/on",
		"dojo/dom-construct",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/TextBox",
		"dijit/form/Select",
		"dijit/form/MultiSelect",
		"dijit/form/ComboBox",
		"dijit/form/CheckBox",
		"dijit/form/RadioButton",
		"dojox/form/CheckedMultiSelect",
		"dojo/store/Memory",
		"arsnova-api/lecturerQuestion"
	],
	function (lang, declare, on, domConstruct, ContentPane, Form, Button, TextBox, Select, MultiSelect, ComboBox, CheckBox, RadioButton, CheckedMultiSelect, Memory, lecturerQuestion) {
		"use strict";

		return declare("EditQuestionTab", ContentPane, {
			closable: true,
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
					this.set("title", "Edit question");
				} else {
					this.set("title", "New question");
				}
			},

			init: function () {
				var container;
				this.form = new Form({
					"class": "question",
					doLayout: false
				});
				this.form.placeAt(this);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Mode"}, container);
				(this.typeSelect = new Select({
					name: "questionVariant",
					options: [
						{value: "lecture", label: "Lecture"},
						{value: "preparation", label: "Preparation"}
					]
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Subject"}, container);
				(this.subjectField = new ComboBox({
					name: "subject",
					store: new Memory({
						idProperty: "id",
						data: [
							{id: 1, name: "MyCategory"}
						],
						searchAttr: "name"
					})
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Description"}, container);
				(this.descriptionField = new TextBox({
					name: "text"
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Question format"}, container);
				(this.typeSelect = new Select({
					name: "questionType",
					options: [
						{value: "abcd", label: "Single choice"},
						{value: "mc", label: "Multiple choice"},
						{value: "yesno", label: "Yes/No"},
						{value: "ls", label: "(Likert) scale"},
						{value: "freetext", label: "Free text"}
					]
				})).placeAt(container).startup();
				this.typeSelect.watch("value", lang.hitch(this, function (id, oldValue, value) {
					this.addAnswerOptionField.set("disabled", false);
					this.addAnswerButton.set("disabled", false);

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
						this.addAnswerOption("Yes");
						this.addAnswerOption("No");
						break;
					case "ls":
						domConstruct.empty(this.answerOptionsContainer);
						break;
					case "freetext":
						this.addAnswerOptionField.set("disabled", true);
						this.addAnswerButton.set("disabled", true);
						domConstruct.empty(this.answerOptionsContainer);
						break;
					}
				}));

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Answer option"}, container);
				(this.addAnswerOptionField = new TextBox()).placeAt(container).startup();
				(this.addAnswerButton = new Button({
					label: "Add",
					onClick: lang.hitch(this, function () {
						var value = this.addAnswerOptionField.get("value");
						if (!value) {
							return;
						}
						this.addAnswerOption(value);
						this.addAnswerOptionField.set("value", "");
					})
				})).placeAt(container).startup();

				this.optionsForm = new Form();
				this.optionsForm.placeAt(this.form);
				domConstruct.create("label", {innerHTML: "Correct answers"}, this.optionsForm.domNode);
				this.answerOptionsContainer = domConstruct.create("div", {style: "display: inline-block;"}, this.optionsForm.domNode);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Allow abstantions"}, container);
				(this.abstentionCb = new CheckBox({
					name: "abstention"
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Release question"}, container);
				(this.releaseCb = new CheckBox({
					name: "active",
					checked: true
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Release statistics"}, container);
				(this.releaseStatsCb = new CheckBox({
					name: "showStatistic",
					checked: true
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Release correct answer"}, container);
				(this.releaseCorrectCb = new CheckBox({
					name: "showAnswer",
					checked: true
				})).placeAt(container).startup();

				(new Button({
					label: "Save",
					onClick: lang.hitch(this, this.questionId ? this.updateQuestion : this.createQuestion)
				})).placeAt(this.form).startup();

				if (this.questionId) {
					this.fillForm(lecturerQuestion.get(this.questionId));
				}
			},

			addAnswerOption: function (name) {
				var optionContainer = domConstruct.create("div", null, this.answerOptionsContainer);
				var Widget = "mc" === this.typeSelect.get("value") ? CheckBox : RadioButton;
				(new Widget({
					name: "answerOptions",
					value: name
				})).placeAt(optionContainer).startup();
				domConstruct.create("label", {innerHTML: "XSS " + name}, optionContainer);
				(new Button({
					label: "X",
					onClick: function (event) {
						domConstruct.destroy(optionContainer);
					}
				})).placeAt(optionContainer);
			},

			fillForm: function (question) {
				//this.form.set("value", question);
				/* Form.set cannot be used since it does not handle CheckBox widgets correctly */
				this.form.getChildren().forEach(function (widget) {
					if (widget.name && question.hasOwnProperty(widget.name)) {
						widget.set("value", question[widget.name]);
					}
				});
			},

			createQuestion: function () {
				var question = this.form.get("value");
				question.abstention = question.abstention.length > 0;
				question.active = question.active.length > 0;
				question.showStatistic = question.showStatistic.length > 0;
				question.showAnswer = question.showAnswer.length > 0;
				question.possibleAnswers = [];
				this.optionsForm.getChildren().forEach(function (widget) {
					if ("answerOptions" === widget.name) {
						question.possibleAnswers.push({
							text: widget.value,
							correct: widget.checked
						});
					}
				});
				lecturerQuestion.create(question).then(lang.hitch(this, function () {
					this.getParent().removeChild(this);
				}));
			},

			updateQuestion: function () {
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
					this.getParent().removeChild(this);
				}));
			}
		});
	}
);
