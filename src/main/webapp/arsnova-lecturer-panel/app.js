define(
	[
		"dojo/ready",
	 	"dojo/on",
	 	"dojo/when",
	 	"dojo/dom",
	 	"dojo/dom-construct",
	 	"dojo/dom-style",
	 	"dijit/registry",
	 	"dijit/Dialog",
	 	"dijit/form/Button",
	 	"dijit/form/DropDownButton",
	 	"dojox/charting/Chart",
	 	"dojox/charting/themes/Claro",
	 	"dojox/charting/plot2d/Columns",
	 	"dojox/charting/axis2d/Default",
		"arsnova-api/auth",
		"arsnova-api/session",
		"arsnova-api/lecturerquestion"
	],
	function(ready, on, when, dom, domConstruct, domStyle, registry, Dialog, Button, DropDownButton, Chart, ChartTheme, Columns, AxisDefault, arsAuth, arsSession, arsLQuestion) {
		"use strict";
		
		var
			answerChart = null,
			feedbackChart = null,
			lowResNode = null,
		
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
				}
				
				initCharts();
				
				/* prevent window scrolling (needed for IE) */
				on(window, "scroll", function(event) {
					scrollTo(0, 0);
					console.log("Prevented document scrolling");
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
				answerChart = new Chart("answerChart");
				answerChart.setTheme(ChartTheme);
				answerChart.addPlot("default", {
					type: Columns,
					gap: 3
				});
				answerChart.addAxis("y", {vertical: true, includeZero: true, minorTicks: false});
				answerChart.render();
				
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
						var panel = dom.byId("lecturerAnswersPanel");
						var height = panel.clientHeight - 16;
						answerChart.resize(-1, height);
						/* calculate a second time because of scrollbars */
						height = panel.clientHeight - 16;
						answerChart.resize(-1, height);
					}, 20);
				};
				registry.byId("lecturerAnswersPanel").on("resize", onResize);
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
				updateLQuestionListView(arsLQuestion.getAll());
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
					question.possibleAnswers.forEach(function(possibleAnswer, i) {
						labelReverseMapping[possibleAnswer.text] = i;
						labels.push({value: i + 1, text: possibleAnswer.text});
						values[i] = 0;
					});
					
					when(answers, function(answers) {
						answers.forEach(function(answer) {
							values[labelReverseMapping[answer.answerText]] = answer.answerCount;
						}, values);
						
						answerChart.addAxis("x", {labels: labels, minorTicks: false});
						answerChart.addSeries("Answer count", values);
						answerChart.render();
					});
				});
			},
			
			updateFeedbackView = function(feedback) {
				feedbackChart.addSeries("Feedback", [
 					{y: feedback[0], fill: "#00CC00"},
					{y: feedback[1], fill: "#EEEE00"},
					{y: feedback[2], fill: "red"},
					{y: feedback[3], fill: "gray"}
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
