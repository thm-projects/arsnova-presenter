/*
 * This file is part of ARSnova Presenter.
 * Copyright 2013-2014 Daniel Gerhardt <code@dgerhardt.net>
 *
 * ARSnova Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Presenter is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/dom-construct",
		"dojo/request/script"
	],
	function (domConstruct, script) {
		"use strict";

		var
			self = null,
			/* [\s\S] instead of . used to support multi line statements */
			boxExpr = /\$\$[\s\S]+?\$\$/,
			inlineExpr = /\(.+?\)/,
			loaded = null
		;

		self = {
			/* public "methods" */
			onLoad: function (callback) {
				if (!loaded && !MathJax) {
					var config = {
						skipStartupTypeset: true
					};
					/* document.head is not supported by IE < 9 */
					var head = document.getElementsByTagName("head")[0];
					var scriptNode = domConstruct.create("script", {type: "text/x-mathjax-config"}, head);
					scriptNode.text = "MathJax.Hub.Config(" + JSON.stringify(config) + ");";
					loaded = script.get("lib/mathjax.org/mathjax/MathJax.js?config=TeX-AMS_HTML,Safe").then(function () {
						console.log("MathJax library loaded");
						callback();
					}, function (error) {
						console.error("MathJax library could not be loaded");
					});
				} else {
					loaded.then(callback);
				}
			},

			parse: function (elementNode) {
				if (!boxExpr.test(elementNode.innerHTML) && !inlineExpr.test(elementNode.innerHTML)) {
					return;
				}

				self.onLoad(function () {
					MathJax.Hub.Queue(["Typeset", MathJax.Hub, elementNode]);
				});
			}
		};

		return self;
	}
);
