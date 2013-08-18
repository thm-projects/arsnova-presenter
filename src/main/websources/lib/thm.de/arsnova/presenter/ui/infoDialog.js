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
		"dojo/dom-construct",
		"dijit/layout/BorderContainer",
		"dijit/layout/TabContainer",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/form/Button",
		"dijit/Dialog",
		"version",
		"dojo/i18n",
		"dojo/i18n!./nls/common",
		"dojo/i18n!./nls/info"
	],
	function (domConstruct, BorderContainer, TabContainer, ContentPane, Button, Dialog, version, i18n) {
		"use strict";

		var
			self = null,
			commonMessages = null,
			messages = null,

			/* Dijit */
			dialog = null,
			container = null,
			tabContainer = null,
			footerPane = null,
			productInfoTab = null,
			contributorsTab = null,
			creditsTab = null
		;

		self = {
			/* public "methods" */
			show: function () {
				if (!dialog) {
					commonMessages = i18n.getLocalization("arsnova-presenter/ui", "common");
					messages = i18n.getLocalization("arsnova-presenter/ui", "info");
					container = new BorderContainer({
						style: "width: 25em; height: 27em;"
					});
					tabContainer = new TabContainer({
						id: "infoDialogTabs",
						region: "center"
					});
					footerPane = new ContentPane({
						id: "infoDialogFooter",
						region: "bottom"
					});
					(new Button({
						label: commonMessages.close,
						onClick: function () {
							dialog.hide();
						}
					})).placeAt(footerPane);
					container.addChild(tabContainer);
					container.addChild(footerPane);

					/* product info tab */
					productInfoTab = new ContentPane({
						id: "infoDialogProductInfoTab",
						title: messages.productInfo
					});

					domConstruct.create("div", {"class": "productLogo"}, productInfoTab.domNode);

					var infoTableNode = domConstruct.create("table", null, productInfoTab.domNode);

					var nameRowNode = domConstruct.create("tr", null, infoTableNode);
					domConstruct.create("td", {innerHTML: messages.productName}, nameRowNode);
					domConstruct.create("td", {innerHTML: commonMessages.arsnova + " " + commonMessages.productNameValue}, nameRowNode);

					var versionRowNode = domConstruct.create("tr", null, infoTableNode);
					domConstruct.create("td", {innerHTML: messages.version}, versionRowNode);
					domConstruct.create("td", {innerHTML: version.version}, versionRowNode);

					var commitRowNode = domConstruct.create("tr", null, infoTableNode);
					domConstruct.create("td", {innerHTML: messages.commit}, commitRowNode);
					domConstruct.create("td", {innerHTML: version.commitId}, commitRowNode);

					var buildTimeRowNode = domConstruct.create("tr", null, infoTableNode);
					domConstruct.create("td", {innerHTML: messages.buildTime}, buildTimeRowNode);
					domConstruct.create("td", {innerHTML: version.buildTime}, buildTimeRowNode);

					domConstruct.create("div", {innerHTML: messages.bugReportsInfo}, productInfoTab.domNode);
					domConstruct.create("div", {innerHTML: messages.leadDeveloperInfo}, productInfoTab.domNode);

					domConstruct.create("div", {"class": "thmLogo"}, productInfoTab.domNode);

					/* contributors tab */
					contributorsTab = new ContentPane({
						id: "infoDialogContributorsTab",
						title: messages.contributors
					});

					/* credits tab */
					creditsTab = new ContentPane({
						id: "infoDialogCreditsTab",
						title: messages.credits
					});

					domConstruct.create("div", {innerHTML: messages.creditsInfo}, creditsTab.domNode);
					domConstruct.create("div", {innerHTML: "<strong>Dojo Toolkit</strong><br>Dojo Foundation<br>“New” BSD License"}, creditsTab.domNode);
					domConstruct.create("div", {innerHTML: "<strong>Socket.IO</strong><br>Guillermo Rauch, LearnBoost<br>MIT License"}, creditsTab.domNode);
					domConstruct.create("div", {innerHTML: "<strong>MathJax</strong><br>Apache License, version 2.0"}, creditsTab.domNode);
					domConstruct.create("div", {innerHTML: "<strong>QR Code Generator</strong><br>Kazuhiko Arase<br>MIT License<br>The word “QR Code” is registered trademark of DENSO WAVE INCORPORATED."}, creditsTab.domNode);

					tabContainer.addChild(productInfoTab);
					tabContainer.addChild(contributorsTab);
					tabContainer.addChild(creditsTab);

					container.startup();
					dialog = new Dialog({
						title: messages.info,
						content: container
					});
				}

				tabContainer.selectChild(productInfoTab);
				dialog.show();
			}
		};

		return self;
	}
);
