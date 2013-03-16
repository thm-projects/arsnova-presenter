define(
	[
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
	 	"dojox/charting/Chart",
	 	"dojox/charting/plot2d/Columns",
	 	"dojox/charting/axis2d/Default",
	 	"dgerhardt/common/fullscreen",
	 	"dojo/fx/easing",
	 	"./theme"
	],
	function(dom, domConstruct, domStyle, registry, Chart, Columns, AxisDefault, fullScreen, easing, theme) {
		"use strict";
		
		var
			answersChart = null,
			answersChartNode = null
		;
		
		return {
			init: function(parentNode) {
				console.log("-- Chart: piAnswers.init --");

				answersChartNode = domConstruct.create("div", {id: "piAnswersChart"}, parentNode);
				answersChart = new Chart(answersChartNode);
				answersChart.setTheme(theme);
				answersChart.addPlot("default", {
					type: Columns,
					gap: 3,
					animate: {duration: 500, easing: easing.expoOut}
				});
				answersChart.addAxis("x");
				answersChart.addAxis("y", {
					vertical: true,
					includeZero: true,
					minorTicks: false
				});
				answersChart.render();
				
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
						if (height < 1 || "none" == domStyle.get(answersChartNode, "display")) {
							/* return if piAnswersMainPaneContent is not visible */
							return;
						}
						answersChart.resize(-1, height);
					}, 20);
				};
				registry.byId("piAnswersMainPane").on("resize", onResize);
				registry.byId("fullScreenContent").on("resize", onResize);
				//onResize();
			},
			
			show: function() {
				domStyle.set(answersChartNode, "display", "block");
			},
			
			hide: function() {
				domStyle.set(answersChartNode, "display", "none");
			},
			
			update: function(labels, values) {
				answersChart.addAxis("x", {
					labels: labels,
					dropLabels: false,
					maxLabelSize: 120,
					rotation: -25,
					trailingSymbol: "...",
					minorTicks: false
				});
				if (null == values) {
					values = [];
					for (var i = 0; i < labels.length; i++) {
						values.push(0);
					}
				}
				answersChart.addSeries("Answer count", theme.applyAnswerColors(values));
				answersChart.render();
			}
		};
	}
);
