define(
	[
		"dojo/dom",
		"dijit/registry",
	 	"dojox/charting/Chart",
	 	"dojox/charting/themes/Claro",
	 	"dojox/charting/plot2d/Columns",
	 	"dojox/charting/axis2d/Default"
	],
	function(dom, registry, Chart, ChartTheme, Columns, AxisDefault) {
		"use strict";
		
		var feedbackChart = null;
		
		return {
			init: function() {
				console.log("-- Chart: audienceFeedback.init --");
				
				feedbackChart = new Chart("feedbackChart");
				feedbackChart.setTheme(ChartTheme);
				feedbackChart.addPlot("default", {
					type: Columns,
					gap: 3
				});
				
				var labels = [
					{value: 1, text: "I can follow."},
					{value: 2, text: "Faster, please!"},
					{value: 3, text: "Too fast!"},
					{value: 4, text: "You have lost me."}
				];
				var data = [0, 0, 0, 0];
				
				feedbackChart.addAxis("x", {labels: labels, minorTicks: false});
				feedbackChart.addAxis("y", {vertical: true, includeZero: true, minorTicks: false});
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
						var panel = dom.byId("audienceFeedbackPanel");
						var height = panel.clientHeight - 16;
						feedbackChart.resize(-1, height);
					}, 20);
				};
				registry.byId("audienceFeedbackPanel").on("resize", onResize);
				onResize();
			},
			
			update: function(feedback) {
				feedbackChart.addSeries("Feedback", [
					{y: feedback[0], stroke: "black", fill: "#00CC00"},
					{y: feedback[1], stroke: "black", fill: "#EEEE00"},
					{y: feedback[2], stroke: "black", fill: "red"},
					{y: feedback[3], stroke: "black", fill: "gray"}
				]);
			}
		};
	}
);
