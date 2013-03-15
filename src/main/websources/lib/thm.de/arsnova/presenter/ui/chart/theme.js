define(
	[
	 	"dojo/_base/lang",
		"dojox/charting/Theme",
		"dojox/gfx/gradutils",
		"dojox/charting/themes/common"
	],
	function(lang, Theme, gradutils, themes) {
		"use strict";
		/* based on Claro charting theme */
	
		var
			g = Theme.generateGradient,
			defaultFill = {type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100},
			axisAndLabelColor = "#333";
		;
		
		themes.Arsnova = new Theme({
			chart: {
				fill: {
					type: "linear",
					x1: 0, x2: 0, y1: 0, y2: 100,
					colors: [
						{offset: 0, color: "#dbdbdb"},
						{offset: 1, color: "#efefef"}
					]
				},
				stroke: {color: "#b5bcc7"}
			},
			
			plotarea: {
				fill: {
					type: "linear",
					x1: 0, x2: 0, y1: 0, y2: 100,
					colors: [
						{offset: 0, color: "#dbdbdb"},
						{offset: 1, color: "#efefef"}
					]
				}
			},
			
			axis: {
				stroke: {
					color: axisAndLabelColor,
					width: 1
				},
				tick: {
					color: axisAndLabelColor,
					position: "center",
					font: "normal normal normal 9pt Verdana, Arial, sans-serif",
					fontColor: axisAndLabelColor
				}
			},
			
			series: {
				stroke: {width: 2.5, color: "#fff"},
				outline: null,
				font: "normal normal normal 7pt Verdana, Arial, sans-serif",
				fontColor: "#131313"
			},
			
			marker: {
				stroke: {width: 1.25, color: "#131313"},
				outline: {width: 1.25, color: "#131313"},
				font: "normal normal normal 8pt Verdana, Arial, sans-serif",
				fontColor: "#131313"
			},
			
			seriesThemes: [
				{fill: g(defaultFill, "#2a6ead", "#3a99f2")},
				{fill: g(defaultFill, "#613e04", "#996106")},
				{fill: g(defaultFill, "#0e3961", "#155896")},
				{fill: g(defaultFill, "#55aafa", "#3f7fba")},
				{fill: g(defaultFill, "#ad7b2a", "#db9b35")}
			],
			
			markerThemes: [
				{fill: "#2a6ead", stroke: {color: "#fff"}},
				{fill: "#613e04", stroke: {color: "#fff"}},
				{fill: "#0e3961", stroke: {color: "#fff"}},
				{fill: "#55aafa", stroke: {color: "#fff"}},
				{fill: "#ad7b2a", stroke: {color: "#fff"}}
			]
		});
		
		themes.Arsnova.applyFeedbackColors = function(values) {
			return [
				{y: values[0], stroke: "black", fill: g(defaultFill, "#43d943", "#25a625")},
				{y: values[1], stroke: "black", fill: g(defaultFill, "#f2f224", "#bfbf1d")},
				{y: values[2], stroke: "black", fill: g(defaultFill, "#e64000", "#b33200")},
				{y: values[3], stroke: "black", fill: g(defaultFill, "#aaa", "#777")}
			];
		};
		
		themes.Arsnova.applyAnswerColors = function(values) {
			var colors = [ /* color values based on ARSnova ST */
				["#1f59b3", "#164080"],
				["#43b3b3", "#308080"],
				["#b3b323", "#808019"],
				["#b327b3", "#801c80"],
				["#b31d1d", "#801515"],
				["#b3591f", "#804016"]
			];
			var result = [];
			for (var i = 0; i < values.length; i++) {
				result.push({y: values[i], stroke: "black", fill: g(defaultFill, colors[i][0], colors[i][1])});
			}
			return result;
		};
		
		return themes.Arsnova;
	}
);
