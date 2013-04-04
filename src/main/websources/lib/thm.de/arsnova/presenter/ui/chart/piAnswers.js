define(
	[
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
	 	"dojox/charting/Chart",
	 	"dojox/charting/plot2d/ClusteredColumns",
	 	"dojox/charting/plot2d/Grid",
	 	"dojox/charting/axis2d/Default",
	 	"dgerhardt/common/fullscreen",
	 	"dojo/fx/easing",
	 	"./theme"
	],
	function(dom, domConstruct, domStyle, registry, Chart, ClusteredColumns, Grid, AxisDefault, fullScreen, easing, theme) {
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
			init: function(parentNode) {
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
					vMinorLines: false
				});
				chart.addAxis("x");
				chart.addAxis("y", {
					vertical: true,
					includeZero: true,
					natural: true,
					labelFunc: function(value) {
						return value + "%";
					}
				});
				chart.render();
				
				var resizeTimeout = null;
				var onResize = function(event) {
					if (resizeTimeout) {
						clearTimeout(resizeTimeout);
					}
					resizeTimeout = setTimeout(function() {
						if ("hidden" == appContainer.style.visibility) {
							return;
						}
						var panel = dom.byId("piAnswersMainPaneContent");
						var height = panel.clientHeight;
						if (height < 1 || "none" == domStyle.get(chartNode, "display")) {
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
			
			show: function() {
				domStyle.set(chartNode, "display", "block");
			},
			
			hide: function() {
				domStyle.set(chartNode, "display", "none");
			},
			
			update: function(labels, correctIndexes, series, percentageValues) {
				chart.addAxis("x", {
					labels: labels,
					dropLabels: false,
					maxLabelSize: 120,
					rotation: -25,
					trailingSymbol: "...",
					minorTicks: false,
				});
				chart.addAxis("y", {
					vertical: true,
					includeZero: true,
					natural: true,
					labelFunc: !percentageValues ? null : function(value) {
						return value + "%";
					}
				});
				
				chart.removeSeries("No data");
				chart.removeSeries("PI round 1");
				chart.removeSeries("PI round 2");
				
				var seriesCount = 0;
				if (null != series) {
					var showCorrect = correctIndexes && correctIndexes.length > 0;
					
					/* sort series object property name */
					var seriesNames = [];
					for (var seriesName in series) {
						seriesNames.push(seriesName);
					}
					seriesNames.sort();
					
					for (var i = 0; i < seriesNames.length; i++) {
						var seriesName = seriesNames[i];
						chart.addSeries(seriesName,
							showCorrect
								? theme.applyColors(series[seriesName], "markCorrect", i < seriesNames.length - 1, correctIndexes)
								: theme.applyColors(series[seriesName], "answers", i < seriesNames.length - 1)
						);
						seriesCount++;
					}
				}
				if (0 == seriesCount) {
					var values = [];
					for (var i = 0; i < labels.length; i++) {
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
