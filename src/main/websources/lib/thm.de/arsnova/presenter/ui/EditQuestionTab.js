define(
	[
		"dojo/_base/declare",
		"dojo/dom-construct",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/TextBox",
		"dijit/form/Select",
		"dijit/form/ComboBox",
		"dojo/store/Memory"
	],
	function (declare, domConstruct, ContentPane, Form, Button, TextBox, Select, ComboBox, Memory) {
		"use strict";

		return declare("EditQuestionTab", ContentPane, {
			title: "Edit question",
			closable: true,

			init: function () {
				var container;
				this.form = new Form({"class": "question"});
				this.form.placeAt(this);

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Subject"}, container);
				(this.subject = new ComboBox({
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
					label: "Test"
				})).placeAt(container).startup();

				container = domConstruct.create("div", null, this.form.domNode);
				domConstruct.create("label", {innerHTML: "Type"}, container);
				(this.type = new Select({
					options: [
						{value: "sc", label: "Single choice"},
						{value: "mc", label: "Multiple choice"},
						{value: "yn", label: "Yes/No"},
						{value: "ls", label: "(Likert) scale"},
						{value: "ft", label: "Free text"}
					]
				})).placeAt(container).startup();

				(new Button({
					label: "Save"
				})).placeAt(this.form).startup();
			}
		});
	}
);
