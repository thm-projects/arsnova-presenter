/* Dojo application profile for production */
var profile = (function () {
	"use strict";

	var depPath = "bower_components/";
	var versionFilePath = "target/tmp/dojo/version/";

	return {
		basePath: "./",
		action: "release",
		mini: true,
		layerOptimize: false,
		cssOptimize: "comments",
		selectorEngine: "lite",
		localeList: "en,de",

		defaultConfig: {
			async: true,
			baseUrl: "src",
			paths: {
				"dojo": "../lib/dojotoolkit.org/dojo",
				"dijit": "../lib/dojotoolkit.org/dijit",
				"dojox": "../lib/dojotoolkit.org/dojox",
				"dstore": "../lib/sitepen.com/dstore"
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
