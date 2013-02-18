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
		"arsnova-api/session"
	],
	function(ready, on, dom, domConstruct, domStyle, registry, Dialog, Button, DropDownButton, arsAuth, arsSession) {
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
				
			},
			
			updateSessionListView = function(sessions) {
				sessions.forEach(function(session) {
					var sessionSelect = registry.byId("sessionSelect");
					sessionSelect.addOption({
						label: session.shortName,
						value: session.keyword
					});
					sessionSelect.onChange = function(value) {
						arsSession.setKey(value);
					};
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
