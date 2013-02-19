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
		var
			apiPrefix = config.arsnovaApi.root + "/session/",
			
			Session = declare([Stateful], {
				key: null
			}),
			
			session = new Session({
				key: null
			});

			sessionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "_id"
			}),
			sessionMemory = new MemoryStore({
				idProperty: "_id"
			}),
			sessionStore = CacheStore(sessionJsonRest, sessionMemory)
		;
			
		session.watch("key", function(name, oldValue, value) {
			console.log("Session key changed: " + value);
		});
		
		return {
			watchKey: function(callback) {
				session.watch("key", callback);
			},
			
			setKey: function(value) {
				session.set("key", value);
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
						session.set(key, response._id);
						return true;
					},
					function(error) {
						return false;
					}
				);
			},
			
			getActiveUserCount: function() {
				var count = "-";
				request.get(apiPrefix + session.get("key") + "/activeusercount", {sync: true}).then(
					function(response) {
						count = response;
						console.debug("Count: " + count);
					},
					function(error) {
						console.error("API: session.getActiveUserCount request failed.");
					}
				);
				
				return count;
			},
			
			signalOnline: function() {
				request.post(apiPrefix + session.get("key") + "/online").then(
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
