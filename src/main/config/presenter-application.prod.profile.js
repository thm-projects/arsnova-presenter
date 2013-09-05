/* Dojo application profile for production */
var profile = (function () {
	"use strict";

	var libPath = "src/main/websources/lib/";
	var dojoPath = "vendor/dojotoolkit.org/";
	var versionFilePath = "target/tmp/dojo/version/";

	return {
		basePath: "../../..",
		action: "release",
		mini: true,
		//optimize: "shrinksafe", // causes problems
		layerOptimize: "closure",
		cssOptimize: "comments",
		selectorEngine: "lite",

		defaultConfig: {
			async: true,
			baseUrl: "app/",
			paths: {
				"dojo": "../lib/dojotoolkit.org/dojo",
				"dijit": "../lib/dojotoolkit.org/dijit",
				"dojox": "../lib/dojotoolkit.org/dojox"
			},
			gfxRenderer: "svg,silverlight,vml"
		},

		packages: [
			{
				name: "dojo",
				location: dojoPath + "dojo"
			},
			{
				name: "dijit",
				location: dojoPath + "dijit"
			},
			{
				name: "dojox",
				location: dojoPath + "dojox"
			},
			{
				name: "arsnova-presenter",
				location: libPath + "thm.de/arsnova/presenter"
			},
			{
				name: "arsnova-api",
				location: "vendor/thm.de/arsnova/libarsnova-js/src/main/websources/lib/thm.de/arsnova/api"
			},
			{
				name: "dgerhardt",
				location: "vendor/dgerhardt.net/dgerhardt-dojo"
			},
			{
				name: "version",
				location: versionFilePath,
				main: "version"
			}
		],

		layers: {
			"app/presenter": {
				customBase: true, // do not add dojo/main automatically
				boot: true,
				include: [
					"dojo/dojo", // Dojo loader
					"dojox/gfx/svg",
					"dojox/gfx/path",

					"arsnova-presenter/controller",
					"version"
				]
			}
		}
	};
})();
