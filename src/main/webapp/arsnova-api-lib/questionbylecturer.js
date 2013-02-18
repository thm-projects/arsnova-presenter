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
			apiPrefix = config.arsnovaApi.root + "/question/bylecturer/",
			
			Question = declare([Stateful], {
				sessionKey: null,
				id: null
			});
		
			question = new Question({
				sessionKey: null,
				id: null
			}),

			questionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "_id"
			}),
			questionMemory = new MemoryStore({
				idProperty: "_id"
			}),
			questionStore = CacheStore(questionJsonRest, questionMemory)
		;
			
		return {
			watchId: function(callback) {
				question("id", callback);
			},
			setSessionKey: function(key) {
				question.set("sessionKey", key);
			},
			setId: function(id) {
				question.set("id", id);
			},
			getStore: function() {
				return questionStore;
			},
			getAll: function() {
				return questionStore.query({
					sessionkey: question.get("sessionKey")
				});
			},
			getUnanswered: function() {
				return questionStore.query({
					sessionkey: question.get("sessionKey"),
					filter: "unanswered"
				});
			}
		};
	}
);
