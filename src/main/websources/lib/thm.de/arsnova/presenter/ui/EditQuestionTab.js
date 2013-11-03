define(
	[
		"dojo/_base/lang",
		"dojo/_base/declare",
		"dojo/dom-construct",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/TextBox",
		"dijit/form/Select",
		"dijit/form/MultiSelect",
		"dijit/form/ComboBox",
		"dijit/form/CheckBox",
		"dojox/form/CheckedMultiSelect",
		"dojo/store/Memory",
		"arsnova-api/lecturerQuestion"
	],
	function (lang, declare, domConstruct, ContentPane, Form, Button, TextBox, Select, MultiSelect, ComboBox, CheckBox, CheckedMultiSelect, Memory, lecturerQuestion) {
		"use strict";

		return declare("EditQuestionTab", ContentPane, {
			closable: true,
			questionId: null,
			form: null,

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
				this.form = new Form({"class": "question"});
				this.form.placeAt(this);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Subject"}, container);
				(this.subject = new ComboBox({
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
				(this.description = new TextBox({
					name: "text"
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Question format"}, container);
				(this.type = new Select({
					name: "questionType",
					options: [
						{value: "abcd", label: "Single choice"},
						{value: "mc", label: "Multiple choice"},
						{value: "yesno", label: "Yes/No"},
						{value: "ls", label: "(Likert) scale"},
						{value: "freetext", label: "Free text"}
					]
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Answer option"}, container);
				(this.addAnswerOption = new TextBox()).placeAt(container).startup();
				(this.addAnswerButton = new Button({
					label: "Add",
					onClick: lang.hitch(this, function () {
						var optionContainer = domConstruct.create("div", null, this.answerOptionsContainer);
						(this.release = new CheckBox({
							name: "active",
							checked: true
						})).placeAt(optionContainer).startup();
						domConstruct.create("label", {innerHTML: "XSS " + this.addAnswerOption.get("value")}, optionContainer);
					})
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Correct answers"}, container);
				this.answerOptionsContainer = domConstruct.create("div", {style: "display: inline-block;"}, container);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Allow abstantions"}, container);
				(this.abstention = new CheckBox({
					name: "abstention"
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Release question"}, container);
				(this.release = new CheckBox({
					name: "active",
					checked: true
				})).placeAt(container).startup();

				(new Button({
					label: "Save",
					onClick: lang.hitch(this, this.createQuestion)
				})).placeAt(this.form).startup();
			},

			createQuestion: function () {
				var question = this.form.get("value");
				question.abstention = question.abstention.length > 0;
				question.active = question.active.length > 0;
				console.debug(question);
				lecturerQuestion.create(question);
			},

			updateQuestion: function () {
				lecturerQuestion.update(question);
			}
		});
	}
);
