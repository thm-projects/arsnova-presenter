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
		localeList: "en,de",

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
		},

		staticHasFeatures: {
			/* These properties allow Closure compiler to remove unused code from Dojo Toolkit
			 * and further decrease file size of the build */
			"config-deferredInstrumentation": 0,
			"config-dojo-loader-catches": 0,
			"config-tlmSiblingOfDojo": 1,
			"dojo-amd-factory-scan": 0,
			"dojo-combo-api": 0,
			"dojo-config-api": 1,
			"dojo-config-require": 0,
			"dojo-debug-messages": 0,
			"dojo-dom-ready-api": 1,
			"dojo-firebug": 0,
			"dojo-guarantee-console": 0,
			"dojo-has-api": 1,
			"dojo-inject-api": 1,
			"dojo-loader": 0,
			"dojo-log-api": 0,
			"dojo-modulePaths": 0,
			"dojo-moduleUrl": 0,
			"dojo-publish-privates": 0,
			"dojo-requirejs-api": 0,
			"dojo-sniff": 0,
			"dojo-sync-loader": 0,
			"dojo-test-sniff": 0,
			"dojo-timeout-api": 0,
			"dojo-trace-api": 0,
			"dojo-undef-api": 0,
			"dojo-v1x-i18n-Api": 1,
			"dojo-xhr-factory": 0,
			"dom": 1,
			"extend-dojo": 1,
			"host-browser": 1
		}
	};
})();
