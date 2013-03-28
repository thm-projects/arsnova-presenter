define(
	[
		"arsnova-api/socket"
	],
	function(socket) {
		"use strict";
		
		var
			self = null
		;
		
		self = {
			onReceive: function(callback) {
				socket.on("feedbackData", callback);
			}
		};
		
		return self;
	}
);