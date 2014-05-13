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
		"dojo/topic",
		"dojo/dom",
		"dojo/dom-construct",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Form",
		"dijit/form/Button",
		"dijit/form/TextBox",
		"dijit/form/CheckBox",
		"dgerhardt/common/confirmDialog",
		"arsnova-api/session",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/session"
	],
	function (topic, dom, domConstruct, ContentPane, Form, Button, TextBox, CheckBox, confirmDialog, model, commonMessages, messages) {
		"use strict";

		var
			self = null,

			/* Dijit */
			pane = null,
			form = null,
			suspendCb = null
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
					name: "name"
				})).placeAt(container);

				container = domConstruct.create("div", null, form.domNode);
				domConstruct.create("label", {innerHTML: messages.shortName}, container);
				(new TextBox({
					name: "shortName"
				})).placeAt(container);

				container = domConstruct.create("div", null, form.domNode);
				domConstruct.create("label", {innerHTML: messages.suspend}, container);
				(suspendCb = new CheckBox({
					name: "suspend"
				})).placeAt(container);

				(new Button({
					label: commonMessages.update,
					onClick: self.updateSession
				})).placeAt(form).startup();

				(new Button({
					label: commonMessages.del,
					onClick: function () {
						var buttons = {};
						buttons[commonMessages.del] = self.deleteSession;
						buttons[commonMessages.cancel] = null;
						confirmDialog.confirm(messages.deleteSession, messages.deleteSessionConfirm, buttons);
					}
				})).placeAt(form).startup();

				return pane;
			},

			startup: function () {
				pane.startup();
				pane.showModalMessage(messages.noSession, "disabled");
				model.watchKey(function (name, oldValue, value) {
					if (value) {
						pane.hideModalMessage();
						self.fillForm(model.getCurrent());
					} else {
						pane.showModalMessage(messages.noSession, "gray");
						form.reset();
					}
				});
			},

			fillForm: function (session) {
				/* Form.set("value", ...) cannot be used since it does not handle CheckBox widgets correctly */
				form.getChildren().forEach(function (widget) {
					if (widget.name && session.hasOwnProperty(widget.name)) {
						widget.set("value", session[widget.name]);
					}
				});
				suspendCb.set("checked", !session.active);
			},

			updateSession: function () {
				if (!form.validate()) {
					return;
				}

				var newSession = form.get("value");
				pane.showModalMessage(messages.updatingSession + "...", "info");

				var session = model.getCurrent();
				for (var attr in newSession) {
					if (newSession.hasOwnProperty(attr)) {
						session[attr] = newSession[attr];
					}
				}
				session.active = session.suspend.length === 0;
				delete session.suspend;

				model.update(session).then(function () {
					pane.showModalMessage(messages.sessionSaved, "success");
					setTimeout(function () {
						pane.hideModalMessage();
						topic.publish("arsnova/session/update");
					}, 1500);
				}, function (error) {
					console.error("Could not save session");
					pane.showModalMessage(messages.sessionNotSaved, "error");
					setTimeout(pane.hideModalMessage, 3000);
				});
			},

			deleteSession: function () {
				pane.showModalMessage(messages.deletingSession + "...", "info");
				model.remove(model.getKey()).then(function () {
					pane.showModalMessage(messages.sessionDeleted, "success");
					setTimeout(function () {
						pane.hideModalMessage();
						topic.publish("arsnova/session/update");
						model.setKey(null);
					}, 1500);
				}, function (error) {
					console.error("Could not delete session");
					pane.showModalMessage(messages.sessionNotDeleted, "error");
					setTimeout(pane.hideModalMessage, 3000);
				});
			}
		};

		return self;
	}
);
