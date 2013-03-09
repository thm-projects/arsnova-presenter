define(
	[
		"arsnova-api/socket"
	],
	function(socket) {
		"use strict";
		
		return {
			onReceive: function(callback) {
				socket.on("feedbackData", callback);
			}
		};
	}
);