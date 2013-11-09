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
		"dojo/dom",
		"dojo/dom-construct",
		"dijit/layout/ContentPane",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/TextBox",
		"dijit/form/CheckBox",
		"arsnova-api/session",
		"dojo/i18n!./nls/session"
	],
	function (dom, domConstruct, ContentPane, Form, Button, TextBox, CheckBox, model, messages) {
		"use strict";

		var
			self = null,

			/* Dijit */
			pane = null,
			form = null
		;

		self = {
			init: function () {
				var container;

				pane = new ContentPane({
					title: "Session",
					content: domConstruct.create("div")
				});
				(form = new Form({
					"class": "labeled"
				})).placeAt(pane.content);

				container = domConstruct.create("div", null, form.domNode);
				domConstruct.create("label", {innerHTML: messages.name}, container);
				(new TextBox({
					name: "name",
					readonly: true
				})).placeAt(container);

				container = domConstruct.create("div", null, form.domNode);
				domConstruct.create("label", {innerHTML: messages.shortName}, container);
				(new TextBox({
					name: "shortName",
					readonly: true
				})).placeAt(container);

				container = domConstruct.create("div", null, form.domNode);
				domConstruct.create("label", {innerHTML: messages.suspend}, container);
				(new CheckBox({
					name: "lock"
				})).placeAt(container);

				return pane;
			},

			startup: function () {
				pane.startup();
				model.watchKey(function (name, oldValue, value) {
					self.fillForm(model.getCurrent());
				});
			},

			fillForm: function (session) {
				/* Form.set("value", ...) cannot be used since it does not handle CheckBox widgets correctly */
				form.getChildren().forEach(function (widget) {
					if (widget.name && session.hasOwnProperty(widget.name)) {
						widget.set("value", session[widget.name]);
					}
				});
			}
		};

		return self;
	}
);
