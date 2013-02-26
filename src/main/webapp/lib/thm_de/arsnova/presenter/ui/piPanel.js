define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/ui/chart/piAnswers"
	],
	function(on, when, dom, domConstruct, domStyle, registry, fullscreen, piAnswersChart) {
		"use strict";
		
		var
			self = null,
			lecturerQuestionModel = null,
			fullscreenNode = null
		;
		
		return {
			init: function(lecturerQuestion) {
				console.log("-- UI: piPanel.init --");
				
				self = this;
				lecturerQuestionModel = lecturerQuestion;
				fullscreenNode = dom.byId("fullscreenContainer");
				
				on(registry.byId("nextPiQuestionButton"), "click", function(event) {
					lecturerQuestionModel.next();
				});
				
				on(registry.byId("prevPiQuestionButton"), "click", function(event) {
					lecturerQuestionModel.prev();
				});
				
				on(registry.byId("answersPanelFullscreenButton"), "click", function(event) {
					if (fullscreen.isSupported()) {
						if (fullscreen.isActive()) {
							/* dom node rearrangement takes place in fullscreenchange event handler */
							fullscreen.exit();
						} else {
							fullscreen.request(fullscreenNode);
							domConstruct.place(dom.byId("answersControlPanelContent"), dom.byId("fullscreenControl"));
							domConstruct.place(dom.byId("answersChartPanelContent"), dom.byId("fullscreenContent"));
						}
					} else {
						console.log("Fullscreen mode not supported");
					}
				});
				
				fullscreen.onChange(function(event, isActive) {
					if (!isActive) {
						domConstruct.place(dom.byId("answersControlPanelContent"), dom.byId("answersControlPanel"));
						domConstruct.place(dom.byId("answersChartPanelContent"), dom.byId("answersChartPanel"));
					}
				});
				
				lecturerQuestionModel.watchId(this.onLecturerQuestionIdChange);
				
				piAnswersChart.init();
			},
			
			updateQuestionsPanel: function(questions) {
				var questionList = dom.byId("piQuestionList");
				questionList.innerHTML = "";
				when(questions, function(questions) {
					/* group questions by category */
					var categories = {};
					questions.forEach(function(question) {
						if (!categories[question.subject]) {
							categories[question.subject] = [];
						}
						categories[question.subject].push(question);
					});
					
					for (var category in categories) {
						var categoryNode = domConstruct.toDom("<div class='questionCategory'><header>" + category + "</header></div>");
						domConstruct.place(categoryNode, questionList);
						categories[category].forEach(function(question) {
							var questionNode = domConstruct.toDom("<p class='question'>" + question.text + "</p>");
							on(questionNode, "click", function(event) {
								lecturerQuestionModel.setId(question._id);
								registry.byId("piTabs").selectChild(registry.byId("piAnswersPanel"));
							});
							domConstruct.place(questionNode, categoryNode);
						});
					}
				});
			},
			
			updateAnswersPanel: function(question, answers) {
				var labelReverseMapping = {};
				var labels = [];
				var values = [];
				
				/* transform the label and answer count data into arrays usable by dojox/charting */
				when(question, function(question) {
					dom.byId("answersQuestionSubject").innerHTML = question.subject;
					dom.byId("answersQuestionText").innerHTML = question.text;
					
					question.possibleAnswers.forEach(function(possibleAnswer, i) {
						labelReverseMapping[possibleAnswer.text] = i;
						labels.push({value: i + 1, text: possibleAnswer.text});
						values[i] = {y: 0, stroke: "black"};
					});
					
					when(answers, function(answers) {
						var totalAnswerCount = 0;
						answers.forEach(function(answer) {
							totalAnswerCount += answer.answerCount;
							values[labelReverseMapping[answer.answerText]] = {y: answer.answerCount, stroke: "black"};
						}, values);
						dom.byId("answerCount").innerHTML = totalAnswerCount;
						
						piAnswersChart.update(labels, values);
					});
				});
			},
			
			onLecturerQuestionIdChange: function(name, oldValue, value) {
				self.updateAnswersPanel(lecturerQuestionModel.get(), lecturerQuestionModel.getAnswers());
			},
		};
	}
);
