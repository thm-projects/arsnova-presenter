/* Dojo application profile for development */
var profile = (function () {
	"use strict";

	var libPath = "src/main/websources/lib/";
	var depPath = "bower_components/";
	var versionFilePath = "target/tmp/dojo/version/";

	return {
		basePath: "./",
		action: "release",
		mini: true,
		layerOptimize: false,
		selectorEngine: "lite",

		defaultConfig: {
			async: true,
			isDebug: true,
			baseUrl: "app/",
			paths: {
				"dojo": "../lib/dojotoolkit.org/dojo",
				"dijit": "../lib/dojotoolkit.org/dijit",
				"dojox": "../lib/dojotoolkit.org/dojox",
				"dstore": "../lib/sitepen.com/dstore",
				"dgerhardt": "../lib/dgerhardt.net",
				"arsnova-api": "../lib/thm.de/arsnova/api",
				"arsnova-presenter": "../lib/thm.de/arsnova/presenter"
			},
			gfxRenderer: "svg,silverlight,vml"
		},

		packages: [
			{
				name: "dojo",
				location: depPath + "dojo"
			},
			{
				name: "dijit",
				location: depPath + "dijit"
			},
			{
				name: "dojox",
				location: depPath + "dojox"
			},
			{
				name: "dstore",
				location: depPath + "dstore"
			},
			{
				name: "arsnova-api",
				location: depPath + "libarsnova-js/src"
			},
			{
				name: "dgerhardt",
				location: depPath + "dgerhardt-dojo"
			},
			{
				name: "version",
				location: versionFilePath,
				main: "version"
			}
		],

		layers: {
			"arsnova-presenter/presenter": {
				customBase: true, // do not add dojo/main automatically
				boot: true,
				include: [
					/* only include modules likely to be always used in presenter */
					"dojo/dojo", // Dojo loader
					"version"
				]
			}
		}
	};
})();
