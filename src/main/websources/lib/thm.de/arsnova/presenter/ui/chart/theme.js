/*
 * Copyright 2013 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
 *
 * This file is part of ARSnova Presenter.
 *
 * Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/_base/array",
		"dojox/charting/Theme",
		"dojox/charting/themes/common",
		"dojox/charting/themes/gradientGenerator",
		"dojox/color"
	],
	function (array, Theme, themes, gradGen, color) {
		"use strict";
		/* based on Claro charting theme */

		var
			self = null,
			g = Theme.generateGradient,
			defaultFill = {
				type: "linear",
				space: "shape",
				x1: 0,
				y1: 0,
				x2: 0,
				y2: 10
			},
			axisAndLabelColor = "#333",
			fillColors = {
				"answers": ["#1f59b3", "#43b3b3", "#b3b323", "#b327b3", "#b31d1d", "#b3591f", "#000"],
				"markCorrect": ["#43d943", "#000"],
				"feedback": ["#43d943", "#f2f224", "#e64000", "#000"]
			}
		;

		self = new Theme({
			chart: {
				fill: {
					type: "linear",
					x1: 0,
					x2: 0,
					y1: 0,
					y2: 100,
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
					x1: 0,
					x2: 0,
					y1: 0,
					y2: 100,
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
				},
				majorTick: {
					width:  1,
					length: 6,
					style: "Dot"
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

		/* public "methods" */
		/**
		 * @param values The data value for the diagram.
		 * @param theme The color theme for bars.
		 * @param pale Flags if pale colors are used.
		 * @param highlightValues Values to indexes contained in this array are highlighted in a special color. Anything else is displayed in a subtle color.
		 * @param subtleValues Values to indexes contained in this array are displayed in a subtle color.
		 */
		self.applyColors = function (values, theme, pale, highlightValues, subtleValues) {
			var colors = fillColors[theme];
			var fills = pale
				? gradGen.generateFills(colors, defaultFill, 80, 65)
				: gradGen.generateFills(colors, defaultFill, 55, 40)
			;
			var result = [];
			for (var i = 0; i < values.length; i++) {
				var colorIndex = highlightValues ? (array.indexOf(highlightValues, i) >= 0 ? 0 : 1) : i;

				/* use last color of a theme if index of current value is in subtleValues */
				if (subtleValues && array.indexOf(subtleValues, i) >= 0) {
					colorIndex = colors.length - 1;
				}

				var strokeColor = color.fromHex(colors[colorIndex]);
				var hsl = strokeColor.toHsl();
				result.push({
					y: values[i],
					stroke: pale ? color.fromHsl(hsl.h, hsl.s, 35).toHex() :  color.fromHsl(hsl.h, hsl.s, 20).toHex(),
					fill: fills[colorIndex]
				});
			}

			return result;
		};

		themes.Arsnova = self;

		return self;
	}
);
