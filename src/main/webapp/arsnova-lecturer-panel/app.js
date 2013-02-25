define(
	[
		"dojo/ready",
	 	"dojo/on",
	 	"dojo/when",
	 	"dojo/dom",
	 	"dojo/dom-construct",
	 	"dojo/dom-class",
	 	"dojo/dom-style",
	 	"dijit/registry",
	 	"dijit/Dialog",
	 	"dijit/form/Button",
	 	"dijit/form/DropDownButton",
	 	"dojox/charting/Chart",
	 	"dojox/charting/themes/Claro",
	 	"dojox/charting/plot2d/Columns",
	 	"dojox/charting/axis2d/Default",
	 	"common/fullscreen",
		"arsnova-api/auth",
		"arsnova-api/session",
		"arsnova-api/lecturerquestion",
		"arsnova-api/audiencequestion"
	],
	function(ready, on, when, dom, domConstruct, domClass, domStyle, registry, Dialog, Button, DropDownButton, Chart, ChartTheme, Columns, AxisDefault, fullscreen, arsAuth, arsSession, arsLQuestion, arsAQuestion) {
		"use strict";
		
		var
			answersChart = null,
			feedbackChart = null,
			lowResNode = null,
			fullscreenNode = null,
		
			startup = function() {
				console.log("-- startup --");
				
				arsAuth.init(function() {
					/* user is not logged in an can not be logged in automatically */
					ready(showLoginDialog);
				});
				ready(initUi);
			},
		
			initUi = function() {
				console.log("-- initUi --");
				
				var appContainer = dom.byId("appContainer");
				fullscreenNode = dom.byId("fullscreenContainer");
				
				new DropDownButton({
					label: "New",
					dropDown: registry.byId("newSessionDialog")
				}, "newSessionButton");
				
				var sessionSelect = registry.byId("sessionSelect");
				sessionSelect.maxHeight = 200;
				sessionSelect.onChange = function(value) {
					arsSession.setKey(value);
				};
				
				if (arsAuth.isLoggedIn()) {
					registry.byId("createSessionButton").onClick = submitCreateSessionForm;
					registry.byId("logoutButton").onClick = arsAuth.logout;
					arsSession.watchKey(onSessionKeyChange);
					arsLQuestion.watchId(onLQuestionIdChange);
					updateSessionListView(arsSession.getOwned());
					on(registry.byId("nextLecturerQuestionButton"), "click", function(event) {
						arsLQuestion.next();
					});
					on(registry.byId("prevLecturerQuestionButton"), "click", function(event) {
						arsLQuestion.prev();
					});
					on(registry.byId("answersPanelFullscreenButton"), "click", function(event) {
						if (fullscreen.isSupported()) {
							if (fullscreen.isActive()) {
								/* dom node rearrangement takes place in fullscreenchange event handler */
								domStyle.set(fullscreenNode, "display", "none");
								fullscreen.exit();
							} else {
								fullscreen.request(fullscreenNode);
								domStyle.set(fullscreenNode, "display", "block");
								domConstruct.place(dom.byId("answersControlPanelContent"), dom.byId("fullscreenControl"));
								domConstruct.place(dom.byId("answersChartPanelContent"), dom.byId("fullscreenContent"));
							}
						} else {
							console.log("Fullscreen mode not supported");
						}
					});
				}
				
				initCharts();
				
				/* prevent window scrolling (needed for IE) */
				on(window, "scroll", function(event) {
					scrollTo(0, 0);
					console.log("Prevented document scrolling");
				});
				
				fullscreen.onChange(function(event, isActive) {
					if (isActive) {
						console.log("Fullscreen mode enabled");
					} else {
						console.log("Fullscreen mode disabled");
						domConstruct.place(dom.byId("answersControlPanelContent"), dom.byId("answersControlPanel"));
						domConstruct.place(dom.byId("answersChartPanelContent"), dom.byId("answersChartPanel"));
					}
				});
				
				var lowResNode = dom.byId("lowResolution");
				var resizeLog = "";
				var resizeLogTimeout = null;
				lowResNode.style.visibility = "hidden";
				domConstruct.place(lowResNode, document.body);
				var windowOnResize = function(event) {
					if (screen.availWidth < 780 || screen.availHeight < 460) {
						resizeLog = "Small resolution detected: " + screen.availWidth + "x" + screen.availHeight;
						dom.byId("lowResolutionMessage").innerHTML = "This application cannot be run because the resolution requirements are not met. ARSnova Lecturer Panel is optimized for notebook, tablet and desktop devices.";
						appContainer.style.visibility = "hidden";
						lowResNode.style.visibility = "visible";
					} else if (document.body.clientWidth < 780 || document.body.clientHeight < 460) {
						resizeLog = "Small window detected: " + document.body.clientWidth + "x" + document.body.clientHeight;
						dom.byId("lowResolutionMessage").innerHTML = "This application cannot be run because the resolution requirements are not met. Please increase the size of your browser's window.";
						appContainer.style.visibility = "hidden";
						lowResNode.style.visibility = "visible";
					} else {
						resizeLog = "Acceptable client size detected: " + document.body.clientWidth + "x" + document.body.clientHeight;
						lowResNode.style.visibility = "hidden";
						appContainer.style.visibility = "visible";
					}
					if (resizeLogTimeout) {
						clearTimeout(resizeLogTimeout);
					}
					resizeLogTimeout = setTimeout(function() {
						console.log(resizeLog);
					}, 500);
				};
				on(window, "resize", windowOnResize);
				windowOnResize();
			},
			
			initCharts = function() {
				answersChart = new Chart("answersChart");
				answersChart.setTheme(ChartTheme);
				answersChart.addPlot("default", {
					type: Columns,
					gap: 3
				});
				answersChart.addAxis("x");
				answersChart.addAxis("y", {vertical: true, includeZero: true, minorTicks: false});
				answersChart.render();
				
				feedbackChart = new Chart("feedbackChart");
				feedbackChart.setTheme(ChartTheme);
				feedbackChart.addPlot("default", {
					type: Columns,
					gap: 3
				});
				var labels = [
					{value: 1, text: "I can follow."},
					{value: 2, text: "Faster, please!"},
					{value: 3, text: "Too fast!"},
					{value: 4, text: "You have lost me."}
				];
				var data = [0, 0, 0, 0];
				feedbackChart.addAxis("x", {labels: labels, minorTicks: false});
				feedbackChart.addAxis("y", {vertical: true, includeZero: true, minorTicks: false});
				feedbackChart.addSeries("Feedback", data);
				feedbackChart.render();
				/* TODO: remove test data */
				updateFeedbackView([5, 2, 1, 2]);
				
				var onResize = null, apResizeTimeout = null, fpResizeTimeout = null;
				
				onResize = function(event) {
					if (apResizeTimeout) {
						clearTimeout(apResizeTimeout);
					}
					apResizeTimeout = setTimeout(function() {
						if ("hidden" == appContainer.style.visibility) {
							return;
						}
						var panel = dom.byId("answersChartPanel");
						var height = panel.clientHeight - 16;
						answersChart.resize(-1, height);
						/* calculate a second time because of scrollbars */
						height = panel.clientHeight - 16;
						answersChart.resize(-1, height);
					}, 20);
				};
				registry.byId("answersChartPanel").on("resize", onResize);
				//onResize();
				
				onResize = function(event) {
					if (fpResizeTimeout) {
						clearTimeout(fpResizeTimeout);
					}
					fpResizeTimeout = setTimeout(function() {
						if ("hidden" == appContainer.style.visibility) {
							return;
						}
						var panel = dom.byId("audienceFeedbackPanel");
						var height = panel.clientHeight - 16;
						feedbackChart.resize(-1, height);
						/* calculate a second time because of scrollbars */
						height = panel.clientHeight - 16;
						feedbackChart.resize(-1, height);
					}, 20);
				};
				registry.byId("audienceFeedbackPanel").on("resize", onResize);
				onResize();
			},
			
			toggleFullscreen = function(element) {
			},
			
			showLoginDialog = function() {
				var services = arsAuth.getServices();
				ready(function() {
					for (var service in services) {
						var domButton = domConstruct.place("<button type='button'>" + service + "</button>", "loginServiceButtons");
						new Button({
							label: services[service].title,
							onClick: function(url) {
								/* a function has to be returned because of the closure */
								return function() {
									location.href = url + "&referer=" + encodeURIComponent(location.href);
								};
							}(services[service].url)
						}, domButton);
					}
					var dlg = registry.byId("loginDialog");
					dlg.onCancel = function() {
						console.debug("Cancel action is disabled");
					};
					domStyle.set(dlg.closeButtonNode, "display", "none");
					dlg.show();
				});
			},
			
			onSessionKeyChange = function(name, oldValue, value) {
				dom.byId("activeUserCount").innerHTML = arsSession.getActiveUserCount();
				arsLQuestion.setSessionKey(value);
				arsAQuestion.setSessionKey(value);
				var lQuestions = arsLQuestion.getAll();
				var aQuestions = arsAQuestion.getAll();
				updateLQuestionListView(lQuestions);
				updateAQuestionListView(aQuestions);
				when(lQuestions, function(questions) {
					arsLQuestion.setId(questions[0]._id);
				});
			},
			
			onLQuestionIdChange = function(name, oldValue, value) {
				updateLQuestionAnswersView(arsLQuestion.get(), arsLQuestion.getAnswers());
			},
			
			updateSessionListView = function(sessions) {
				var sessionSelect = registry.byId("sessionSelect");
				sessions.forEach(function(session) {
					sessionSelect.addOption({
						label: session.shortName,
						value: session.keyword
					});
				});
			},
			
			updateLQuestionListView = function(questions) {
				var questionList = dom.byId("lecturerQuestionList");
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
								arsLQuestion.setId(question._id);
								registry.byId("lecturerTabs").selectChild(registry.byId("lecturerAnswersPanel"));
							});
							domConstruct.place(questionNode, categoryNode);
						});
					}
				});
			},
			
			updateLQuestionAnswersView = function(question, answers) {
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
						
						answersChart.addAxis("x", {labels: labels, minorTicks: false});
						answersChart.addSeries("Answer count", values);
						answersChart.render();
					});
				});
			},
			
			updateAQuestionListView = function(questions) {
				var questionListNode = dom.byId("audienceQuestionList");
				questionListNode.innerHTML = "";
				when(questions, function(questions) {
					questions.forEach(function(question) {
						var questionNode = domConstruct.toDom("<div class='question'><p class='subject'>" + question.subject + "</p></div>");
						if (!question.read) {
							domClass.add(questionNode, "unread");
						}
						on(questionNode, "click", function(event) {
							readAQuestion(question._id, questionNode);
						});
						domConstruct.place(questionNode, questionListNode);
					});
				});
			},
			
			readAQuestion = function(questionId, questionNode) {
				var question = arsAQuestion.get(questionId);
				if (domClass.contains(questionNode, "opened")) {
					domConstruct.destroy(questionNode.children[1]);
					domClass.remove(questionNode, "opened");
					return;
				}
				when(question, function(question) {
					console.debug(question);
					domClass.remove(questionNode, "unread");
					domClass.add(questionNode, "opened");
					domConstruct.place("<p>" + question.text + "</p>", questionNode);
				});
			},
			
			updateFeedbackView = function(feedback) {
				feedbackChart.addSeries("Feedback", [
 					{y: feedback[0], stroke: "black", fill: "#00CC00"},
					{y: feedback[1], stroke: "black", fill: "#EEEE00"},
					{y: feedback[2], stroke: "black", fill: "red"},
					{y: feedback[3], stroke: "black", fill: "gray"}
				]);
			},
			
			submitCreateSessionForm = function() {
				var
					shortName = registry.byId("sessionNameField").value,
					description = registry.byId("sessionDescField").value
				;
				
				if (arsSession.createSession(shortName, description)) {
					registry.byId("newSessionDialog").close();
				};
			}
		;
	
		return {
			init: function() {
				console.log("-- init --");
				
				startup();
			}
		};
	}
);
