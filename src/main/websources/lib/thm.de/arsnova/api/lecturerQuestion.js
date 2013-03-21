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
			apiPrefix = config.arsnovaApi.root + "lecturerquestion/",
			answerPath = apiPrefix + "${questionId}/answer/",
			
			QuestionState = declare([Stateful], {
				id: null
			}),
		
			questionState = new QuestionState({
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
		
		sessionModel.watchKey(function(name, oldValue, value) {
			questionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "_id"
			});
			questionMemory = new MemoryStore({
				idProperty: "_id"
			});
			questionStore = CacheStore(questionJsonRest, questionMemory);
			questionState.set("id", null);
		});
		
		questionState.watch("id", function(name, oldValue, value) {
			if (null == value) {
				return;
			}
			
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
		
		socket.on("lecQuestionAvail", function(lecturerQuestionId) {
			
		});
		
		socket.on("answersTolecQuestionAvail", function(lecturerQuestionId) {
			
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
			
			getStore: function() {
				return questionStore;
			},
			
			getAll: function() {
				if (null == questionStore) {
					console.log("No session selected");
					
					return null;
				}
				
				return questionStore.query({
					sessionkey: sessionModel.getKey()
				});
			},
			
			get: function(questionId) {
				if (null == questionId) {
					if (null == this.getId()) {
						return null;
					}
					questionId = questionState.get("id");
				}
				
				return questionStore.get(questionId);
			},
			
			update: function(question) {
				questionStore.put(question, {
					id: question._id,
					overwrite: true
				});
			},
			
			next: function() {
				if (0 == this.getCount()) {
					console.log("No questions available");
					
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
				if (0 == this.getCount()) {
					console.log("No questions available");
					
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
			
			first: function() {
				if (0 == this.getCount()) {
					console.log("No questions available");
					
					return;
				}
				
				var index = questionMemory.index;
				var firstQuestionId = null;
				var firstQuestionIndex = Number.MAX_VALUE;
				
				for (var questionId in index) {
					if (index[questionId] < firstQuestionIndex) {
						firstQuestionIndex = index[questionId];
						firstQuestionId = questionId;
					}
				};
				if (null != firstQuestionId) {
					this.setId(firstQuestionId);
				}
			},
			
			last: function() {
				if (0 == this.getCount()) {
					console.log("No questions available");
					
					return;
				}
				
				var index = questionMemory.index;
				var lastQuestionId = null;
				var lastQuestionIndex = -1;
				
				for (var questionId in index) {
					if (index[questionId] > lastQuestionIndex) {
						lastQuestionIndex = index[questionId];
						lastQuestionId = questionId;
					}
				};
				if (null != lastQuestionId) {
					this.setId(lastQuestionId);
				}
			},
			
			getPosition: function() {
				if (0 == this.getCount()) {
					return -1;
				}
				
				return questionMemory.index[questionState.get("id")];
			},
			
			getCount: function() {
				if (null == questionMemory) {
					return 0;
				}
				
				return questionMemory.data.length;
			},
			
			getUnanswered: function() {
				if (null == questionStore) {
					console.log("No session selected");
					
					return null;
				}
				
				return questionStore.query({
					sessionkey: questionState.get("sessionKey"),
					filter: "unanswered"
				});
			},
			
			getAnswers: function() {
				if (null == answerStore) {
					console.log("No question selected");
					
					return null;
				}
				
				return answerStore.query();
			},
			
			removeAnswer: function(id) {
				if (null == answerStore) {
					console.log("No question selected");
					
					return null;
				}
				answerStore.remove(id);
			},
			
			startSecondPiRound: function(questionId) {
				var question = this.get(questionId);
				question.piRound = 2;
				this.update(question);
			}
		};
	}
);
