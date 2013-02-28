define(
	[
		"dojo/_base/config",
		"dojo/_base/declare",
		"dojo/string",
		"dojo/Stateful",
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache"
	],
	function(config, declare, string, Stateful, JsonRestStore, MemoryStore, CacheStore) {
		"use strict";
		
		var
			apiPrefix = config.arsnovaApi.root + "lecturerquestion/",
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
			getId: function(id) {
				return questionState.get("id");
			},
			setId: function(id) {
				if (questionState.get("id") != id) {
					questionState.set("id", id);
				}
			},
			setSessionKey: function(key) {
				if (questionState.get("key") != key) {
					questionState.set("sessionKey", key);
				}
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
			next: function() {
				if (null == questionState.get("sessionKey")) {
					console.log("No session selected");
					return;
				}
				var index = questionMemory.index;
				var firstQuestionId = null;
				var nextQuestionId = null;
				var nextQuestionIndex = index[questionState.get("id")] + 1;
				
				for (var questionId in index) {
					if (index[questionId] == nextQuestionIndex) {
						nextQuestionId = questionId;
						break;
					}
					if (0 == index[questionId]) {
						firstQuestionId = questionId;
					}
				}
				
				if (null == nextQuestionId) {
					nextQuestionId = firstQuestionId;
				}
				if (null != nextQuestionId) {
					this.setId(nextQuestionId);
				}
			},
			prev: function() {
				if (null == questionState.get("sessionKey")) {
					console.log("No session selected");
					return;
				}
				var index = questionMemory.index;
				var lastQuestionId = null;
				var lastQuestionIndex = null;
				var prevQuestionId = null;
				var prevQuestionIndex = index[questionState.get("id")] - 1;
				
				for (var questionId in index) {
					if (index[questionId] == prevQuestionIndex) {
						prevQuestionId = questionId;
						break;
					}
					if (lastQuestionIndex < index[questionId]) {
						lastQuestionIndex = index[questionId];
						lastQuestionId = questionId;
					}
				};
				
				if (null == prevQuestionId) {
					prevQuestionId = lastQuestionId;
				}
				if (null != prevQuestionId) {
					this.setId(prevQuestionId);
				}
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
