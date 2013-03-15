define(
	[
		"dojo/dom",
		"dijit/registry",
	 	"dojox/charting/Chart",
	 	"dojox/charting/plot2d/Columns",
	 	"dojox/charting/axis2d/Default",
	 	"dojo/fx/easing",
	 	"./theme"
	],
	function(dom, registry, Chart, Columns, AxisDefault, easing, theme) {
		"use strict";
		
		var feedbackChart = null;
		
		return {
			init: function() {
				console.log("-- Chart: audienceFeedback.init --");
				
				feedbackChart = new Chart("audienceFeedbackChart");
				feedbackChart.setTheme(theme);
				feedbackChart.addPlot("default", {
					type: Columns,
					gap: 3,
					animate: {duration: 500, easing: easing.expoOut}
				});
				
				var labels = [
					{value: 1, text: "I can follow."},
					{value: 2, text: "Faster, please!"},
					{value: 3, text: "Too fast!"},
					{value: 4, text: "You have lost me."}
				];
				var data = [0, 0, 0, 0];
				
				feedbackChart.addAxis("x", {
					labels: labels,
					dropLabels: false,
					maxLabelSize: 100,
					rotation: -30,
					trailingSymbol: "...",
					minorTicks: false
				});
				feedbackChart.addAxis("y", {
					vertical: true,
					includeZero: true,
					minorTicks: false
				});
				feedbackChart.addSeries("Feedback", data);
				feedbackChart.render();

				var resizeTimeout = null;
				var onResize = function(event) {
					if (resizeTimeout) {
						clearTimeout(resizeTimeout);
					}
					resizeTimeout = setTimeout(function() {
						if ("hidden" == appContainer.style.visibility) {
							return;
						}
						var panel = dom.byId("audienceFeedbackPaneContent");
						var height = panel.clientHeight;
						feedbackChart.resize(-1, height);
					}, 20);
				};
				registry.byId("audienceFeedbackPane").on("resize", onResize);
				onResize();
			},
			
			update: function(feedback) {
				feedbackChart.updateSeries("Feedback", theme.applyFeedbackColors(feedback));
				feedbackChart.render();
			}
		};
	}
);
