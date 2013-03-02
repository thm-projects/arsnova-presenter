/* Dojo application profile */
var profile = (function() {
	var libPath = "src/main/webapp/lib/";
	var dojoPath = "vendor/dojotoolkit.org/";
	var versionFilePath = "target/tmp/dojo/version/";
	
	return {
		basePath: "../../..",
		action: "release",
		//layerOptimize: "closure",
		cssOptimize: "comments",
		
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
				boot: true,
				include: [
					"dojo/main", // Dojo loader
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
					"dojo/dom-class",
					"dojo/dom-geometry",
					"dojo/dom-style",
					"dojo/store/JsonRest",
					"dojo/store/Memory",
					"dojo/store/Cache",
					"dojo/parser",
					"dijit/registry",
					"dijit/layout/BorderContainer",
					"dijit/layout/TabContainer",
					"dijit/layout/ContentPane",
					"dijit/Dialog",
					"dijit/TooltipDialog",
					"dijit/form/Button",
					"dijit/form/TextBox",
					"dijit/form/Select",
					"dijit/form/DropDownButton",
					"dojox/charting/Chart",
					"dojox/charting/themes/Claro",
					"dojox/charting/plot2d/Columns",
					"dojox/charting/axis2d/Default",
					"dgerhardt/dijit/layout/ContentPane",
					"dgerhardt/common/fullscreen",
					"arsnova-presenter/controller",
					"arsnova-presenter/ui/main",
					"arsnova-presenter/ui/authControls",
					"arsnova-presenter/ui/sessionControls",
					"arsnova-presenter/ui/piPanel",
					"arsnova-presenter/ui/audiencePanel",
					"arsnova-presenter/ui/chart/piAnswers",
					"arsnova-presenter/ui/chart/audienceFeedback",
					"arsnova-api/auth",
					"arsnova-api/session",
					"arsnova-api/lecturerQuestion",
					"arsnova-api/audienceQuestion",
					"version"
				]
			}
		}
	};
})();
