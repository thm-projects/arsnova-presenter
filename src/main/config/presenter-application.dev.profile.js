/* Dojo application profile for development */
var profile = (function() {
	var libPath = "src/main/websources/lib/";
	var dojoPath = "vendor/dojotoolkit.org/";
	var versionFilePath = "target/tmp/dojo/version/";
	
	return {
		basePath: "../../..",
		action: "release",
		mini: true,
		layerOptimize: "shrinksafe.keepLines",
		
		defaultConfig: {
			async: true,
			isDebug: true,
			baseUrl: "app/",
			modulePaths: {
				"dojo": "../lib/dojotoolkit.org/dojo",
				"dijit": "../lib/dojotoolkit.org/dijit",
				"dojox": "../lib/dojotoolkit.org/dojox",
				"dgerhardt": "../lib/dgerhardt.net",
				"arsnova-presenter": "../lib/thm.de/arsnova/presenter",
				"arsnova-api": "../lib/thm.de/arsnova/api"
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
				location: libPath + "thm.de/arsnova/api"
			},
			{
				name: "dgerhardt",
				location: libPath + "dgerhardt.net"
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
					"dojo/selector/acme", // this module is always needed
					
					"dojo/_base/config",
					"dojo/_base/declare",
					"dojo/ready",
					"dojo/string",
					"dojo/on",
					"dojo/when",
					"dojo/router",
					"dojo/Stateful",
					"dojo/dom",
					"dojo/dom-construct",
					"dojo/store/JsonRest",
					"dojo/store/Memory",
					"dojo/store/Cache",
					
					"dijit/_base",
					"dijit/registry",
					"dijit/layout/BorderContainer",
					"dijit/layout/TabContainer",
					"dijit/layout/ContentPane",
					
					"dojox/charting/Chart",
					
					"version"
				]
			}
		}
	};
})();
