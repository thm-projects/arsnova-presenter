define(
	[
		"dojo/dom",
		"dojo/dom-construct",
		"dijit/registry",
	 	"dojox/charting/Chart",
	 	"dojox/charting/plot2d/Columns",
	 	"dojox/charting/axis2d/Default",
	 	"dojo/fx/easing",
	 	"./theme"
	],
	function(dom, domConstruct, registry, Chart, Columns, AxisDefault, easing, theme) {
		"use strict";
		
		var
			self = null,
			
			/* DOM */
			feedbackChartNode = null,
			
			/* dojox.charting */
			feedbackChart = null
		;
		
		self = {
			/* public "methods" */
			init: function(parentNode) {
				console.log("-- Chart: audienceFeedback.init --");

				feedbackChartNode = domConstruct.create("div", {id: "audienceFeedbackChart"}, parentNode);
				feedbackChart = new Chart(feedbackChartNode);
				feedbackChart.setTheme(theme);
				feedbackChart.addPlot("default", {
					type: Columns,
					gap: 5,
					maxBarSize: 180,
					animate: {duration: 500, easing: easing.expoOut}
				});
				
				var labels = [
					{value: 1, text: "I can follow you."},
					{value: 2, text: "Faster, please!"},
					{value: 3, text: "Too fast!"},
					{value: 4, text: "You have lost me."}
				];
				var data = [0, 0, 0, 0];
				
				feedbackChart.addAxis("x", {
					labels: labels,
					dropLabels: false,
					maxLabelSize: 120,
					rotation: -25,
					trailingSymbol: "...",
					minorTicks: false
				});
				feedbackChart.addAxis("y", {
					vertical: true,
					includeZero: true,
					natural: true
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
						if (height < 1) {
							/* return if audienceFeedbackPaneContent is not visible */
							return;
						}
						feedbackChart.resize(-1, height);
					}, 20);
				};
				registry.byId("audienceFeedbackPane").on("resize", onResize);
				registry.byId("fullScreenContent").on("resize", onResize);
				onResize();
			},
			
			update: function(feedback) {
				feedbackChart.updateSeries("Feedback", theme.applyColors(feedback, "feedback"));
				feedbackChart.render();
			}
		};
		
		return self;
	}
);
