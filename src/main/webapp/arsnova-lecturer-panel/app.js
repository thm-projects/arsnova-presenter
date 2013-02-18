define(
	[
		"dojo/ready",
	 	"dojo/on",
	 	"dojo/dom",
	 	"dojo/dom-construct",
	 	"dojo/dom-style",
	 	"dijit/registry",
	 	"dijit/Dialog",
	 	"dijit/form/Button",
	 	"dijit/form/DropDownButton",
		"arsnova-api/auth",
		"arsnova-api/session",
		"arsnova-api/questionbylecturer"
	],
	function(ready, on, dom, domConstruct, domStyle, registry, Dialog, Button, DropDownButton, arsAuth, arsSession, arsQbl) {
		var
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
				
				new DropDownButton({
					label: "New",
					dropDown: registry.byId("newSessionDialog")
				}, "newSessionButton");
				
				registry.byId("sessionSelect").onChange = function(value) {
					arsSession.setKey(value);
				};
				
				if (arsAuth.isLoggedIn()) {
					registry.byId("createSessionButton").onClick = submitCreateSessionForm;
					registry.byId("logoutButton").onClick = arsAuth.logout;
					arsSession.watchKey(onSessionKeyChange);
					updateSessionListView(arsSession.getOwned());
				}
				
				dom.byId("appContainer").style.visibility = "visible";
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
				arsQbl.setSessionKey(value);
				updateQuestionListView(arsQbl.getAll());
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
			
			updateQuestionListView = function(questions) {
				var questionList = dom.byId("questionByLecturerList");
				questionList.innerHTML = "";
				questions.forEach(function(question) {
					console.debug(question);
					domConstruct.place(domConstruct.toDom("<p>" + question.subject + "</p>"), questionList);
				});
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
