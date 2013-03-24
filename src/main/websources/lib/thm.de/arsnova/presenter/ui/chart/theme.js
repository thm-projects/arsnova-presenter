define(
	[
	 	"dojo/_base/lang",
	 	"dojo/_base/array",
		"dojox/charting/Theme",
		"dojox/charting/themes/common",
		"dojox/charting/themes/gradientGenerator",
	 	"dojox/color",
	],
	function(lang, array, Theme, themes, gradGen, color) {
		"use strict";
		/* based on Claro charting theme */
	
		var
			g = Theme.generateGradient,
			defaultFill = {type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100},
			axisAndLabelColor = "#333",
			fillColors = {
				"answers": ["#1f59b3", "#43b3b3", "#b3b323", "#b327b3", "#b31d1d", "#b3591f"],
				"markCorrect": ["#43d943", "#000"],
				"feedback": ["#43d943", "#f2f224", "#e64000", "#000"]
			}
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
		
		themes.Arsnova.applyColors = function(values, theme, pale, highlightValues) {
			var colors = fillColors[theme];
			var fills = pale
				? gradGen.generateFills(colors, defaultFill, 80, 65)
				: gradGen.generateFills(colors, defaultFill, 55, 40)
			;
			var result = [];
			for (var i = 0; i < values.length; i++) {
				var strokeColor = color.fromHex(colors[
					highlightValues ? (array.indexOf(highlightValues, i) >= 0 ? 0 : 1) : i
				]);
				var hsl = strokeColor.toHsl();
				result.push({
					y: values[i],
					stroke: pale ? color.fromHsl(hsl.h, hsl.s, 35).toHex() :  color.fromHsl(hsl.h, hsl.s, 20).toHex(),
					fill: fills[highlightValues ? (array.indexOf(highlightValues, i) >= 0 ? 0 : 1) : i]
				});
			}
			
			return result;
		};
		
		return themes.Arsnova;
	}
);
