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
			list: function(callback) {
				console.debug("API: session.list");
				request.get(apiPrefix + "?filter=visited").then(
					function(response) {
						console.debug(response);
						callback(response, true);
					},
					function(error) {
						console.error("API: session.list request failed.");
						callback(error, false);
					}
				);
			},
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
				return sessionStore.query({filter: "visited"});
			},
			getOwned: function() {
				return sessionStore.query({filter: "owned"});
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
				request.get(apiPrefix + "activeusercount").then(
						function(response) {
							console.debug(response);
							callback(response, true);
						},
						function(error) {
							console.error("API: session.getActiveUserCount request failed.");
							callback(error, false);
						}
					);
			}
		};
	}
);
