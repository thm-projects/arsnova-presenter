define(
	[
		"dojo/_base/config",
		"dojo/_base/declare",
		"dojo/Stateful",
		"dojo/request",
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache",
		"arsnova-api/socket"
	],
	function(config, declare, Stateful, request, JsonRestStore, MemoryStore, CacheStore, socket) {
		"use strict";
		
		var
			apiPrefix = config.arsnovaApi.root + "session/",
			
			SessionState = declare([Stateful], {
				key: null,
				activeUserCount: "-"
			}),
			
			sessionState = new SessionState({
				key: null,
				activeUserCount: "-"
			}),

			sessionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "keyword"
			}),
			sessionMemory = new MemoryStore({
				idProperty: "keyword"
			}),
			sessionStore = CacheStore(sessionJsonRest, sessionMemory)
		;
			
		sessionState.watch("key", function(name, oldValue, value) {
			console.log("Session key changed: " + value);
			socket.emit("setSession", {keyword: value});
		});
		
		socket.on("activeUserCountData", function(activeUserCount) {
			sessionState.set("activeUserCount", activeUserCount);
		});
		
		return {
			watchKey: function(callback) {
				sessionState.watch("key", callback);
			},
			
			getKey: function() {
				return sessionState.get("key");
			},
			
			setKey: function(value) {
				if (sessionState.get("key") != value) {
					sessionState.set("key", value);
				}
			},
			
			getCurrent: function() {
				return sessionStore.get(sessionState.get("key"));
			},
			
			getStore: function() {
				return sessionStore;
			},
			
			getVisited: function() {
				return sessionStore.query({visitedonly: true});
			},
			
			getOwned: function() {
				return sessionStore.query({ownedonly: true});
			},
			
			createSession: function(shortName, description) {
				sessionStore.put({
					name: description,
					shortName: shortName
				}).then(
					function(response) {
						console.log("Session created: " + response._id);
						sessionState.set(key, response._id);
						return true;
					},
					function(error) {
						return false;
					}
				);
			},
			
			watchActiveUserCount: function(callback) {
				sessionState.watch("activeUserCount", callback);
			}
		};
	}
);
