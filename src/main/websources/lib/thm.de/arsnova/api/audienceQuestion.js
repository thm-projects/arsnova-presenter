define(
	[
		"dojo/_base/config",
		"dojo/_base/declare",
		"dojo/string",
		"dojo/Stateful",
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache",
		"arsnova-api/session",
		"arsnova-api/socket"
	],
	function(config, declare, string, Stateful, JsonRestStore, MemoryStore, CacheStore, sessionModel, socket) {
		"use strict";
		
		var
			apiPrefix = config.arsnovaApi.root + "audiencequestion/",
			
			questionJsonRest = null,
			questionMemory = null,
			questionStore = null
		;
		
		sessionModel.watchKey(function(name, oldValue, value) {
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
			getStore: function() {
				return questionStore;
			},
			
			getAll: function() {
				return questionStore.query({
					sessionkey: sessionModel.getKey()
				});
			},
			
			get: function(id) {
				var question = questionStore.get(id);
				if (null == question.text) {
					/* force reloading of question */
					questionMemory.remove(id);
					question = questionStore.get(id);
				}
				
				return question;
			}
		};
	}
);
