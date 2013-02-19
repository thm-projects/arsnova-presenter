define(
	[
		"dojo/_base/config",
		"dojo/_base/declare",
		"dojo/string",
		"dojo/Stateful",
		"dojo/request",
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache"
	],
	function(config, declare, string, Stateful, request, JsonRestStore, MemoryStore, CacheStore) {
		var
			apiPrefix = config.arsnovaApi.root + "/lecturerquestion/",
			answerPath = apiPrefix + "${questionId}/answer/",
			
			Question = declare([Stateful], {
				sessionKey: null,
				id: null
			});
		
			question = new Question({
				sessionKey: null,
				id: null
			}),

			questionJsonRest = null,
			questionMemory = null,
			questionStore = null,

			answerJsonRest = new JsonRestStore({
				target: answerPath,
				idProperty: "_id"
			}),
			answerMemory = new MemoryStore({
				idProperty: "_id"
			}),
			answerStore = CacheStore(answerJsonRest, answerMemory)
		;
		
		question.watch("sessionKey", function(name, oldValue, value) {
			questionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "_id"
			});
			questionMemory = new MemoryStore({
				idProperty: "_id"
			});
			questionStore = CacheStore(questionJsonRest, questionMemory);
		});
		
		question.watch("id", function(name, oldValue, value) {
			console.log("Question id changed: " + value);
			answerJsonRest = new JsonRestStore({
				target: string.substitute(answerPath, {questionId: value}),
				idProperty: "_id"
			});
			answerMemory = new MemoryStore({
				idProperty: "_id"
			});
			answerStore = CacheStore(answerJsonRest, answerMemory);
		});
			
		return {
			watchId: function(callback) {
				question.watch("id", callback);
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
			},
			getAnswers: function() {
				return answerStore.query({
					sessionkey: question.get("sessionKey")
				});
			}
		};
	}
);
