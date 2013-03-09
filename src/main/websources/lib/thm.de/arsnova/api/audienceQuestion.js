define(
	[
		"dojo/_base/config",
		"dojo/_base/declare",
		"dojo/string",
		"dojo/Stateful",
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache",
		"arsnova-api/socket"
	],
	function(config, declare, string, Stateful, JsonRestStore, MemoryStore, CacheStore, socket) {
		"use strict";
		
		var
			apiPrefix = config.arsnovaApi.root + "audiencequestion/",
			
			QuestionState = declare([Stateful], {
				sessionKey: null
			}),
		
			questionState = new QuestionState({
				sessionKey: null
			}),

			questionJsonRest = null,
			questionMemory = null,
			questionStore = null
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
		
		socket.on("audQuestionAvail", function(audienceQuestionId) {
			
		});
		
		return {
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
			
			get: function(id) {
				var question = questionStore.get(id);
				if (null == question.text) {
					questionMemory.remove(id);
					question = questionStore.get(id);
				}
				
				return question;
			}
		};
	}
);
