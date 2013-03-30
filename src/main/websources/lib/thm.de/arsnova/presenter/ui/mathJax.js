define(
	[
		"dojo/dom-construct",
		"dojo/request/script"
	],
	function(domConstruct, script) {
		"use strict";
		
		var
			self = null,
			/* [\s\S] instead of . used to support multi line statements */
			boxExpr = new RegExp("\\$\\$[\s\S]+?\\$\\$"),
			inlineExpr = new RegExp("\\\\(.+?\\\\)"),
			loaded = null
		;
		
		self = {
			/* public "methods" */
			onLoad: function(callback) {
				if (null == loaded && "undefined" == typeof MathJax) {
					var config = {
						skipStartupTypeset: true
					};
					/* document.head is not supported by IE < 9 */
					var head = document.getElementsByTagName("head")[0];
					var scriptNode = domConstruct.create("script", {type: "text/x-mathjax-config"}, head);
					scriptNode.text = "MathJax.Hub.Config(" + JSON.stringify(config) + ");";
					loaded = script.get("https://c328740.ssl.cf1.rackcdn.com/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML").then(function() {
						console.log("MathJax library loaded");
						callback();
					}, function(error) {
						console.error("MathJax library could not be loaded");
					});
				} else {
					loaded.then(callback);
				}
			},
			
			parse: function(elementNode) {
				if (!boxExpr.test(elementNode.innerHTML) && !inlineExpr.test(elementNode.innerHTML)) {
					return;
				}
				
				self.onLoad(function() {
					MathJax.Hub.Queue(["Typeset", MathJax.Hub, elementNode]);
				});
			}
		};
		
		return self;
	}
);
