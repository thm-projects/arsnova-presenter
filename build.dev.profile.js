/* Dojo application profile for development */
var profile = (function () {
	"use strict";

	var libPath = "src/main/websources/lib/";
	var depPath = "bower_components/";
	var versionFilePath = "build/tmp/version/";

	return {
		basePath: "./",
		action: "release",
		mini: true,
		layerOptimize: false,
		selectorEngine: "lite",

		defaultConfig: {
			async: true,
			isDebug: true,
			baseUrl: "./",
			paths: {
				"dojo": "lib/dojo",
				"dijit": "lib/dijit",
				"dojox": "lib/dojox",
				"dmodel": "lib/dmodel",
				"dstore": "lib/dstore",
				"dgerhardt": "lib/dgerhardt-dojo",
				"libarsnova": "lib/libarsnova-js/src",
				"arsnova-presenter": "lib/arsnova-presenter"
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
				name: "dmodel",
				location: depPath + "dmodel"
			},
			{
				name: "rql",
				location: depPath + "rql"
			},
			{
				name: "libarsnova",
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
