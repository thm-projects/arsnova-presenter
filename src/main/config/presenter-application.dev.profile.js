/* Dojo application profile for development */
var profile = (function () {
	"use strict";

	var libPath = "src/main/websources/lib/";
	var dojoPath = "vendor/dojotoolkit.org/";
	var versionFilePath = "target/tmp/dojo/version/";

	return {
		basePath: "../../..",
		action: "release",
		mini: true,
		layerOptimize: "closure",
		selectorEngine: "lite",

		defaultConfig: {
			async: true,
			isDebug: true,
			baseUrl: "app/",
			paths: {
				"dojo": "../lib/dojotoolkit.org/dojo",
				"dijit": "../lib/dojotoolkit.org/dijit",
				"dojox": "../lib/dojotoolkit.org/dojox",
				"dgerhardt": "../lib/dgerhardt.net",
				"arsnova-api": "../lib/thm.de/arsnova/api",
				"arsnova-presenter": "../lib/thm.de/arsnova/presenter"
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
					/* only include modules likely to be always used in presenter */
					"dojo/dojo", // Dojo loader
					"version"
				]
			}
		}
	};
})();
