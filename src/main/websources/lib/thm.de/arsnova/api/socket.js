define(
	[
		"dojo/_base/config",
		"dojo/when",
		"dojo/request"
	],
	function(config, when, request) {
		"use strict";
		
		var socketApiPrefix = config.arsnovaApi.root + "socket/";
		var socketUrl = request.get(socketApiPrefix + "url");
		var socket = null;
		var callbacks = [];
		
		return {
			connect: function() {
				var self = this;
				
				if (!io || socket) {
					return;
				}
				socket = when(socketUrl, function(socketUrl) {
					var socketConn = io.connect(socketUrl);
					socketConn.on("connect", function() {
						console.log("Socket.IO: connected");
						request.post(socketApiPrefix + "assign", {
							headers: {"Content-Type": "application/json"},
							data: JSON.stringify({session: socketConn.socket.sessionid})
						}).then(function() {
							console.log("Socket.IO: sessionid " + socketConn.socket.sessionid + " assigned to user");
						});

						for (var i = 0; i < callbacks.length; i++) {
							self.on(callbacks[i][0], callbacks[i][1]);
						}
						callbacks = [];
					});
					socketConn.on("disconnect", function() {
						console.log("Socket.IO: disconnected");
					});
					
					return socketConn;
				});
			},
			
			on: function(eventName, callback) {
				if (!socket) {
					callbacks.push([eventName, callback]);
					return;
				}
				when(socket, function(socket) {
					console.log("Socket.IO: added listener for " + eventName + " events");
					socket.on(eventName, function(data) {
						console.debug("Socket.IO: " + eventName + " received");
						callback(data);
					});
				});
			},
			
			emit: function(eventName, data) {
				if (!socket) {
					return;
				}
				when(socket, function(socket) {
					console.debug("Socket.IO: " + eventName + " emitted");
					socket.emit(eventName, data);
				});
			}
		};
	}
);
