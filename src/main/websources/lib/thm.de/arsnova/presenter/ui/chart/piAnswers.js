define(
	[
		"dojo/dom",
		"dijit/registry",
	 	"dojox/charting/Chart",
	 	"dojox/charting/plot2d/Columns",
	 	"dojox/charting/axis2d/Default",
	 	"dgerhardt/common/fullscreen",
	 	"dojo/fx/easing",
	 	"./theme"
	],
	function(dom, registry, Chart, Columns, AxisDefault, fullscreen, easing, theme) {
		"use strict";
		
		var answersChart = null;
		
		return {
			init: function() {
				console.log("-- Chart: piAnswers.init --");
				
				answersChart = new Chart("answersChart");
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
						var panel = fullscreen.isActive() ? dom.byId("fullscreenContent") : dom.byId("answersChartPanel");
						var height = panel.clientHeight - 16;
						answersChart.resize(-1, height);
					}, 20);
				};
				registry.byId("answersChartPanel").on("resize", onResize);
				//onResize();
			},
			
			update: function(labels, values) {
				answersChart.addAxis("x", {
					labels: labels,
					dropLabels: false,
					maxLabelSize: 100,
					rotation: -30,
					trailingSymbol: "...",
					minorTicks: false
				});
				answersChart.addSeries("Answer count", theme.applyAnswerColors(values));
				answersChart.render();
			}
		};
	}
);
