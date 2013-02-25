define(
	[
		"dojo/on"
	],
	function(on) {
		"use strict";
		
		var mode = null;
		if (document.documentElement.requestFullscreen) {
			mode = "w3c";
		} else if (document.documentElement.webkitRequestFullscreen) {
			mode = "webkit";
		} else if (document.documentElement.mozRequestFullScreen) {
			mode = "moz";
		} else if (document.documentElement.msRequestFullscreen) {
			mode = "ms";
		}
		console.debug("Fullscreen support: " + (null != mode ? mode : "none"));
		
		return {
			isSupported: function() {
				return null != mode;
			},
			
			isActive: function() {
				if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
					return true;
				}
				
				return false;
			},
			
			request: function(element) {
				if (null == element) {
					element = document.documentElement;
				}
				
				switch (mode) {
				case "w3c":
					element.requestFullscreen();
					break;
				case "webkit":
					element.webkitRequestFullScreen();
					break;
				case "moz":
					element.mozRequestFullScreen();
					break;
				case "ms":
					element.msRequestFullscreen();
					break;
				default:
					return false;
				}
				
				return true;
			},
			
			exit: function() {
				switch (mode) {
				case "w3c":
					document.exitFullscreen();
					break;
				case "webkit":
					document.webkitCancelFullScreen();
					break;
				case "moz":
					document.mozCancelFullScreen();
					break;
				case "ms":
					document.msCancelFullscreen();
					break;
				default:
					return false;
				}
				
				return true;
			},
			
			toggle: function(element) {
				return this.isActive() ? this.exit() : this.request(element);
			},
			
			onChange: function(listener) {
				var isActive = this.isActive;
				
				switch (mode) {
				case "w3c":
					on(document, "fullscreenchange", function(event) {
						listener(event, isActive());
					});
					break;
				case "webkit":
					on(document, "webkitfullscreenchange", function(event) {
						listener(event, isActive());
					});
					break;
				case "moz":
					on(document, "mozfullscreenchange", function(event) {
						listener(event, isActive());
					});
					break;
				case "ms":
					on(document, "msfullscreenchange", function(event) {
						listener(event, isActive());
					});
					break;
				default:
					return false;
				}
				
				return true;
			}
		};
	}
);
