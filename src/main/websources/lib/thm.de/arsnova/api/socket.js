define(
	[
		"dojo/_base/config",
		"dojo/when",
		"dojo/request"
	],
	function(config, when, request) {
		"use strict";
		
		var
			self = null,
			socketApiPrefix = config.arsnovaApi.root + "socket/",
			socketUrl = request.get(socketApiPrefix + "url"),
			socket = null,
			firstConnect = true,
			callbacks = [],
			reconnectListeners = []
		;
		
		self = {
			connect: function() {
				if (!io || socket) {
					return;
				}
				socket = when(socketUrl, function(socketUrl) {
					var socketConn = io.connect(socketUrl);
					socketConn.on("connect", function() {
						if (!firstConnect) {
							return;
						}
						firstConnect = false;
						console.log("Socket.IO: connected");
						self.assign();

						for (var i = 0; i < callbacks.length; i++) {
							self.on(callbacks[i][0], callbacks[i][1]);
						}
						callbacks = [];
					});
					socketConn.on("disconnect", function() {
						console.log("Socket.IO: disconnected");
					});
					socketConn.on("reconnect", function() {
						console.log("Socket.IO: reconnected");
						when(self.assign(), function() {
							for (var i = 0; i < reconnectListeners.length; i++) {
								reconnectListeners[i]();
							}
						});
					});
					
					return socketConn;
				});
			},
			
			assign: function() {
				return when(socket, function(socket) {
					return request.post(socketApiPrefix + "assign", {
						headers: {"Content-Type": "application/json"},
						data: JSON.stringify({session: socket.socket.sessionid})
					}).then(function() {
						console.log("Socket.IO: sessionid " + socket.socket.sessionid + " assigned to user");
					});
				});
			},
			
			onReconnect: function(listener) {
				reconnectListeners.push(listener);
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
		
		return self;
	}
);
