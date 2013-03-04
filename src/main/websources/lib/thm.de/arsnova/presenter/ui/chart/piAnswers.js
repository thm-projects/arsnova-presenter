define(
	[
		"dojo/dom",
		"dijit/registry",
	 	"dojox/charting/Chart",
	 	"dojox/charting/themes/Claro",
	 	"dojox/charting/plot2d/Columns",
	 	"dojox/charting/axis2d/Default",
	 	"dgerhardt/common/fullscreen"
	],
	function(dom, registry, Chart, ChartTheme, Columns, AxisDefault, fullscreen) {
		"use strict";
		
		var answersChart = null;
		
		return {
			init: function() {
				console.log("-- Chart: piAnswers.init --");
				
				answersChart = new Chart("answersChart");
				answersChart.setTheme(ChartTheme);
				answersChart.addPlot("default", {
					type: Columns,
					gap: 3
				});
				answersChart.addAxis("x");
				answersChart.addAxis("y", {vertical: true, includeZero: true, minorTicks: false});
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
				answersChart.addAxis("x", {labels: labels, minorTicks: false});
				answersChart.addSeries("Answer count", values);
				answersChart.render();
			}
		};
	}
);
