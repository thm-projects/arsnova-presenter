define(
	[
		"dojo/_base/declare",
		"dojo/Evented",
		"dijit/layout/ContentPane"
	],
	function(declare, Evented, ContentPane) {
		return declare("ArsContentPane", [Evented, ContentPane], {
			constructor: function() {
				this.inherited(arguments);
			},
			
			resize: function() {
				this.inherited(arguments);
				this.emit("resize", {
					bubbles: false,
					cancelable: false,
					w: this.w,
					h: this.h
				});
			}
		});
	}
);
