/*
 * Copyright 2013 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
 * 
 * This file is part of libarsnova-js.
 * 
 * libarsnova-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/_base/config",
		"dojo/_base/declare",
		"dojo/string",
		"dojo/when",
		"dojo/Stateful",
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache",
		"arsnova-api/session",
		"arsnova-api/socket"
	],
	function(config, declare, string, when, Stateful, JsonRestStore, MemoryStore, CacheStore, sessionModel, socket) {
		"use strict";
		
		var
			self = null,
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
			questionSortIndex = null,

			ftAnswerJsonRest = null,
			ftAnswerMemory = null,
			ftAnswerStore = null,

			answerCountJsonRest = [],
			answerCountMemory = [],
			answerCountStore = []
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
			ftAnswerJsonRest = new JsonRestStore({
				target: string.substitute(answerPath, {questionId: value}),
				idProperty: "_id"
			});
			ftAnswerMemory = new MemoryStore({
				idProperty: "_id"
			});
			ftAnswerStore = CacheStore(ftAnswerJsonRest, ftAnswerMemory);
			
			/* remove cached answers */
			answerCountStore = [];
		});
		
		socket.on("lecQuestionAvail", function(lecturerQuestionId) {
			
		});
		
		socket.on("answersTolecQuestionAvail", function(lecturerQuestionId) {
			
		});
			
		self = {
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
				
				var questions = questionStore.query({
					sessionkey: sessionModel.getKey()
				});
				questions.then(function() {
					buildQuestionSortIndex();
					self.setId(questionSortIndex[0]);
				});
				
				return questions;
			},
			
			get: function(questionId) {
				if (null == questionId) {
					if (null == (questionId = self.getId())) {
						return null;
					}
				}
				
				return questionStore.get(questionId);
			},
			
			update: function(question) {
				return questionStore.put(question, {
					id: question._id,
					overwrite: true
				});
			},
			
			next: function() {
				if (0 == self.getCount()) {
					console.log("No questions available");
					
					return;
				}
				
				var nextQuestionIndex = null;
				for (var i = 0; i < questionSortIndex.length; i++) {
					if (self.getId() == questionSortIndex[i]) {
						nextQuestionIndex = questionSortIndex.length - 1 == i ? 0 : i + 1;
						
						break;
					}
				}
				
				var nextQuestionId = questionSortIndex[nextQuestionIndex];
				
				if (null != nextQuestionId) {
					self.setId(nextQuestionId);
				}
			},
			
			prev: function() {
				if (0 == self.getCount()) {
					console.log("No questions available");
					
					return;
				}
				
				var prevQuestionIndex = null;
				for (var i = questionSortIndex.length - 1; i >= 0 ; i--) {
					if (self.getId() == questionSortIndex[i]) {
						prevQuestionIndex = 0 == i ? questionSortIndex.length - 1 : i - 1;
						
						break;
					}
				}
				
				var prevQuestionId = questionSortIndex[prevQuestionIndex];
				
				if (null != prevQuestionId) {
					self.setId(prevQuestionId);
				}
			},
			
			first: function() {
				if (0 == self.getCount()) {
					console.log("No questions available");
					
					return;
				}
				
				var firstQuestionId = questionSortIndex[0];
				
				if (null != firstQuestionId) {
					self.setId(firstQuestionId);
				}
			},
			
			last: function() {
				if (0 == self.getCount()) {
					console.log("No questions available");
					
					return;
				}
				
				var lastQuestionId = questionSortIndex[questionSortIndex.length - 1];
				
				if (null != lastQuestionId) {
					self.setId(lastQuestionId);
				}
			},
			
			getPosition: function() {
				if (0 == self.getCount()) {
					return -1;
				}
				
				for (var i = 0; i < questionSortIndex.length; i++) {
					if (self.getId() == questionSortIndex[i]) {
						return i;
					}
				}
				
				return -1;
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
			
			getAnswers: function(piRound, refresh) {
				if (null == self.getId()) {
					console.log("No question selected");
					
					return null;
				}
				
				return when(self.get(), function(question) {
					if ("freetext" == question.questionType) {
						if (!refresh && ftAnswerMemory.data.length > 0) {
							return ftAnswerMemory.query();
						}
						
						return ftAnswerStore.query();
					}
					
					if (null == piRound || piRound < 1 || piRound > 2) {
						piRound = question.piRound;
					}
					
					if (refresh || !answerCountStore[piRound]) {
						answerCountJsonRest[piRound] = new JsonRestStore({
							target: string.substitute(answerPath, {questionId: question._id}),
							idProperty: "answerText"
						});
						answerCountMemory[piRound] = new MemoryStore({
							idProperty: "answerText"
						});
						answerCountStore[piRound] = new CacheStore(answerCountJsonRest[piRound], answerCountMemory[piRound]);

						return answerCountStore[piRound].query({piround: piRound});
					}

					return answerCountMemory[piRound].query();
				});
			},
			
			removeAnswer: function(id) {
				if (null == self.getId()) {
					console.log("No question selected");
					
					return null;
				}
				answerStore.remove(id);
			},
			
			updateLocks: function(questionId, lockQuestion, lockStats, lockCorrect) {
				var question = self.get(questionId);
				
				return when(question, function(question) {
					question.active = !lockQuestion;
					question.showStatistic = !lockStats;
					question.showAnswer = !lockCorrect;
					
					return self.update(question);
				});
			},
			
			startSecondPiRound: function(questionId) {
				var question = self.get(questionId);
				return when(question, function(question) {
					question.piRound = 2;
					return self.update(question);
				});
			},
			
			onAnswersAvailable: function(callback) {
				socket.on("answersToLecQuestionAvail", callback);
			}
		};
		
		var buildQuestionSortIndex = function() {
			questionSortIndex = [];
			for (var questionId in questionMemory.index) {
				//var question = self.get(questionId);
				/* Use question.number as soon as the property is set
				 * by the ARSnova clients. Currently it is always 0. */
				questionSortIndex.push(questionId);
			}
		};
		
		return self;
	}
);
