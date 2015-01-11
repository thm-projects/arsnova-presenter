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
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dojox/charting/Chart",
		"dojox/charting/plot2d/ClusteredColumns",
		"dojox/charting/plot2d/Grid",
		"dojo/fx/easing",
		"./theme",
		"dojox/charting/axis2d/Default"
	],
	function (dom, domConstruct, domStyle, registry, Chart, ClusteredColumns, Grid, easing, theme) {
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
				console.log("-- Chart: piAnswers.init --");

				chartNode = domConstruct.create("div", {id: "piAnswersChart"}, parentNode);
				chart = new Chart(chartNode);
				chart.setTheme(theme);
				chart.addPlot("default", {
					type: ClusteredColumns,
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
				chart.addAxis("x");
				chart.addAxis("y", {
					vertical: true,
					includeZero: true,
					natural: true,
					labelFunc: function (value) {
						return value + "%";
					}
				});
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
						var panel = dom.byId("piAnswersMainPaneContent");
						var height = panel ? panel.clientHeight : 0;
						if (height < 1 || "none" === domStyle.get(chartNode, "display")) {
							/* return if piAnswersMainPaneContent is not visible */
							return;
						}
						chart.resize(-1, height);
					}, 20);
				};
				registry.byId("piAnswersMainPane").on("resize", onResize);
				registry.byId("fullScreenContent").on("resize", onResize);
				//onResize();
			},

			show: function () {
				domStyle.set(chartNode, "display", "block");
			},

			hide: function () {
				domStyle.set(chartNode, "display", "none");
			},

			update: function (labels, correctIndexes, series, percentageValues, abstention) {
				var i;

				chart.addAxis("x", {
					labels: labels,
					dropLabels: false,
					maxLabelSize: 120,
					rotation: -25,
					trailingSymbol: "...",
					minorTicks: false,
					majorTickStep: 1
				});
				chart.addAxis("y", {
					vertical: true,
					includeZero: true,
					natural: true,
					labelFunc: !percentageValues ? null : function (value) {
						return value + "%";
					}
				});

				chart.removeSeries("No data");
				chart.removeSeries("PI round 1");
				chart.removeSeries("PI round 2");

				var seriesCount = 0;
				if (series) {
					var showCorrect = correctIndexes && correctIndexes.length > 0;

					/* sort series object property name */
					var seriesNames = [];
					var seriesName = null;
					for (seriesName in series) {
						if (series.hasOwnProperty(seriesName)) {
							seriesNames.push(seriesName);
						}
					}
					seriesNames.sort();

					for (i = 0; i < seriesNames.length; i++) {
						seriesName = seriesNames[i];
						chart.addSeries(seriesName,
							showCorrect
								? theme.applyColors(series[seriesName], "markCorrect", i < seriesNames.length - 1, correctIndexes)
								: theme.applyColors(series[seriesName], "answers", i < seriesNames.length - 1, null, abstention ? [labels.length - 1] : null)
						);
						seriesCount++;
					}
				}
				if (0 === seriesCount) {
					var values = [];
					for (i = 0; i < labels.length; i++) {
						values.push(0);
					}
					chart.addSeries("No data", values);
				}
				chart.render();
			}
		};

		return self;
	}
);
