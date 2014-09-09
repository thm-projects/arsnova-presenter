/*
 * This file is part of ARSnova Presenter.
 * Copyright 2013-2014 Daniel Gerhardt <code@dgerhardt.net>
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
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dojox/charting/Chart",
		"dojox/charting/plot2d/Columns",
		"dojox/charting/plot2d/Grid",
		"dojo/fx/easing",
		"./theme",
		"dojo/i18n",
		"dojo/i18n!../nls/audienceFeedback",
		"dojox/charting/axis2d/Default"
	],
	function (dom, domConstruct, domStyle, registry, Chart, Columns, Grid, easing, theme, i18n, messages) {
		"use strict";

		var
			self = null,

			/* DOM */
			chartNode = null,

			/* dojox.charting */
			chart = null
		;

		self = {
			/* public "methods" */
			init: function (parentNode) {
				console.log("-- Chart: audienceFeedback.init --");

				chartNode = domConstruct.create("div", {id: "audienceFeedbackChart"}, parentNode);
				chart = new Chart(chartNode);
				chart.setTheme(theme);
				chart.addPlot("default", {
					type: Columns,
					gap: 5,
					maxBarSize: 180,
					animate: {duration: 500, easing: easing.expoOut}
				});
				chart.addPlot("grid", {
					type: Grid,
					hMajorLines: true,
					hMinorLines: false,
					vMajorLines: false,
					vMinorLines: false,
					majorHLine: {color: "#333", width: 1, style: "Dash"},
					renderOnAxis: false
				});

				var labels = [
					{value: 1, text: messages.canFollow},
					{value: 2, text: messages.faster},
					{value: 3, text: messages.slower},
					{value: 4, text: messages.cannotFollow}
				];
				var data = [0, 0, 0, 0];

				chart.addAxis("x", {
					labels: labels,
					dropLabels: false,
					maxLabelSize: 120,
					rotation: -25,
					trailingSymbol: "...",
					minorTicks: false
				});
				chart.addAxis("y", {
					vertical: true,
					includeZero: true,
					natural: true
				});
				chart.addSeries("Feedback", data);
				chart.render();

				var resizeTimeout = null;
				var onResize = function (event) {
					if (resizeTimeout) {
						clearTimeout(resizeTimeout);
					}
					resizeTimeout = setTimeout(function () {
						if ("hidden" === domStyle.get(chartNode, "visibility")) {
							return;
						}
						var panel = dom.byId("audienceFeedbackPaneContent");
						var height = panel.clientHeight;
						if (height < 1) {
							/* return if audienceFeedbackPaneContent is not visible */
							return;
						}
						chart.resize(-1, height);
					}, 20);
				};
				registry.byId("audienceFeedbackPane").on("resize", onResize);
				registry.byId("fullScreenContent").on("resize", onResize);
				onResize();
			},

			update: function (feedback) {
				chart.updateSeries("Feedback", theme.applyColors(feedback, "feedback"));
				chart.render();
			}
		};

		return self;
	}
);
