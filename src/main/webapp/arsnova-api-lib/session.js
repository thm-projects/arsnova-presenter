define(
	[
		"dojo/_base/config",
		"dojo/_base/declare",
		"dojo/Stateful",
		"dojo/request",
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache"
	],
	function(config, declare, Stateful, request, JsonRestStore, MemoryStore, CacheStore) {
		"use strict";
		
		var
			apiPrefix = config.arsnovaApi.root + "/session/",
			
			SessionState = declare([Stateful], {
				key: null
			}),
			
			sessionState = new SessionState({
				key: null
			}),

			sessionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "_id"
			}),
			sessionMemory = new MemoryStore({
				idProperty: "_id"
			}),
			sessionStore = CacheStore(sessionJsonRest, sessionMemory)
		;
			
		sessionState.watch("key", function(name, oldValue, value) {
			console.log("Session key changed: " + value);
		});
		
		return {
			watchKey: function(callback) {
				sessionState.watch("key", callback);
			},
			
			setKey: function(value) {
				sessionState.set("key", value);
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
			
			getActiveUserCount: function() {
				var count = "-";
				request.get(apiPrefix + sessionState.get("key") + "/activeusercount", {sync: true}).then(
					function(response) {
						count = response;
					},
					function(error) {
						console.error("API: session.getActiveUserCount request failed.");
					}
				);
				
				return count;
			},
			
			signalOnline: function() {
				request.post(apiPrefix + sessionState.get("key") + "/online").then(
					function(response) {
						/* nothing to do */
					},
					function(error) {
						console.error("API: session.signalOnline request failed.");
					}
				);
			}
		};
	}
);
