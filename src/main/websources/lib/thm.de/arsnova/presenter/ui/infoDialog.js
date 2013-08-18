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
		"version"
	],
	function (domConstruct, BorderContainer, TabContainer, ContentPane, Button, Dialog, version) {
		"use strict";

		var
			self = null,

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
						label: "Close",
						onClick: function () {
							dialog.hide();
						}
					})).placeAt(footerPane);
					container.addChild(tabContainer);
					container.addChild(footerPane);

					/* product info tab */
					productInfoTab = new ContentPane({
						id: "infoDialogProductInfoTab",
						title: "Product info"
					});

					domConstruct.create("div", {"class": "productLogo"}, productInfoTab.domNode);

					var infoTableNode = domConstruct.create("table", null, productInfoTab.domNode);

					var nameRowNode = domConstruct.create("tr", null, infoTableNode);
					domConstruct.create("td", {innerHTML: "Product name"}, nameRowNode);
					domConstruct.create("td", {innerHTML: "ARSnova Presenter"}, nameRowNode);

					var versionRowNode = domConstruct.create("tr", null, infoTableNode);
					domConstruct.create("td", {innerHTML: "Version"}, versionRowNode);
					domConstruct.create("td", {innerHTML: version.version}, versionRowNode);

					var commitRowNode = domConstruct.create("tr", null, infoTableNode);
					domConstruct.create("td", {innerHTML: "Commit"}, commitRowNode);
					domConstruct.create("td", {innerHTML: version.commitId}, commitRowNode);

					var buildTimeRowNode = domConstruct.create("tr", null, infoTableNode);
					domConstruct.create("td", {innerHTML: "Build time"}, buildTimeRowNode);
					domConstruct.create("td", {innerHTML: version.buildTime}, buildTimeRowNode);

					domConstruct.create("div", {innerHTML: "Please mention the version information above in bug reports."}, productInfoTab.domNode);
					domConstruct.create("div", {innerHTML: "ARSnova Presenter (1.0) was developed by Daniel Gerhardt as project for his bachelor thesis. The project is managed by Prof. Dr. Klaus Quibeldey-Cirkel."}, productInfoTab.domNode);

					domConstruct.create("div", {"class": "thmLogo"}, productInfoTab.domNode);

					/* contributors tab */
					contributorsTab = new ContentPane({
						id: "infoDialogContributorsTab",
						title: "Contributors"
					});

					/* credits tab */
					creditsTab = new ContentPane({
						id: "infoDialogCreditsTab",
						title: "Credits"
					});

					domConstruct.create("div", {innerHTML: "We would like to thank the following organizations, project groups and individuals for creating the software which Presenter or some of it's features are based on."}, creditsTab.domNode);
					domConstruct.create("div", {innerHTML: "<strong>Dojo Toolkit</strong><br>Dojo Foundation<br>“New” BSD License"}, creditsTab.domNode);
					domConstruct.create("div", {innerHTML: "<strong>Socket.IO</strong><br>Guillermo Rauch, LearnBoost<br>MIT License"}, creditsTab.domNode);
					domConstruct.create("div", {innerHTML: "<strong>MathJax</strong><br>Apache License, version 2.0"}, creditsTab.domNode);
					domConstruct.create("div", {innerHTML: "<strong>QR Code Generator</strong><br>Kazuhiko Arase<br>MIT License<br>The word “QR Code” is registered trademark of DENSO WAVE INCORPORATED."}, creditsTab.domNode);

					tabContainer.addChild(productInfoTab);
					tabContainer.addChild(contributorsTab);
					tabContainer.addChild(creditsTab);

					container.startup();
					dialog = new Dialog({
						title: "About ARSnova Presenter",
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
