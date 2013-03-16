define(
	[
		"dojo/_base/declare",
		"dojo/Evented",
		"dijit/layout/ContentPane"
	],
	function(declare, Evented, ContentPane) {
		//"use strict";
		
		return declare("ContentPane", [ContentPane, Evented], {
			constructor: function() {
				this.inherited(arguments);
			},
			
			resize: function() {
				this.inherited(arguments);
				this.emit("resize", {
					bubbles: false,
					cancelable: false,
					w: arguments[0].w,
					h: arguments[0].h
				});
			}
		});
	}
);
