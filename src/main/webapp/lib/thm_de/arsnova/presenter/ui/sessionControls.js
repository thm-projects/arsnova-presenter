define(
	[
		"dojo/when",
		"dojo/dom",
		"dijit/registry",
		"dijit/form/DropDownButton"
	],
	function(when, dom, registry, DropDownButton) {
		"use strict";
		
		var
			sessionModel = null,
			sessionSelect = null
		;
		
		return {
			init: function(session) {
				console.log("-- UI: sessionControls.init --");
				
				sessionModel = session;
				
				new DropDownButton({
					label: "New",
					dropDown: registry.byId("newSessionDialog")
				}, "newSessionButton");
				
				sessionSelect = registry.byId("sessionSelect");
				sessionSelect.maxHeight = 200;
				sessionSelect.onChange = function(value) {
					sessionModel.setKey(value);
				};
				
				registry.byId("createSessionButton").onClick = this.submitCreateSessionForm;
				this.updateSessionSelect(sessionModel.getOwned());
				sessionModel.watchKey(this.onKeyChange);
			},
			
			updateSessionSelect: function(sessions) {
				when(sessions, function(sessions) {
					sessions.forEach(function(session) {
						sessionSelect.addOption({
							label: session.shortName,
							value: session.keyword
						});
					});
					console.log("UI: session list updated");
					
					var key = sessionModel.getKey();
					if (key) {
						sessionSelect.set("value", key);
					}
				});
			},
			
			submitCreateSessionForm: function() {
				var
					shortName = registry.byId("sessionNameField").value,
					description = registry.byId("sessionDescField").value
				;
				
				if (sessionModel.createSession(shortName, description)) {
					registry.byId("newSessionDialog").close();
				};
			},
			
			onKeyChange: function(name, oldValue, value) {
				sessionSelect.set("value", value);
				when(sessionModel.getCurrent(), function(session) {
					document.title = session.shortName + " - ARSnova Presenter";
				});
				dom.byId("activeUserCount").innerHTML = sessionModel.getActiveUserCount();
			}
		};
	}
);
