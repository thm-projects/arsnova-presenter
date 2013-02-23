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
		"use strict";
		
		var
			apiPrefix = config.arsnovaApi.root + "/lecturerquestion/",
			answerPath = apiPrefix + "${questionId}/answer/",
			
			QuestionState = declare([Stateful], {
				sessionKey: null,
				id: null
			}),
		
			questionState = new QuestionState({
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
		
		questionState.watch("sessionKey", function(name, oldValue, value) {
			questionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "_id"
			});
			questionMemory = new MemoryStore({
				idProperty: "_id"
			});
			questionStore = CacheStore(questionJsonRest, questionMemory);
		});
		
		questionState.watch("id", function(name, oldValue, value) {
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
				questionState.watch("id", callback);
			},
			setSessionKey: function(key) {
				questionState.set("sessionKey", key);
			},
			setId: function(id) {
				questionState.set("id", id);
			},
			getStore: function() {
				return questionStore;
			},
			getAll: function() {
				return questionStore.query({
					sessionkey: questionState.get("sessionKey")
				});
			},
			get: function() {
				return questionStore.get(questionState.get("id"));
			},
			getUnanswered: function() {
				return questionStore.query({
					sessionkey: questionState.get("sessionKey"),
					filter: "unanswered"
				});
			},
			getAnswers: function() {
				return answerStore.query({
					sessionkey: questionState.get("sessionKey")
				});
			}
		};
	}
);
