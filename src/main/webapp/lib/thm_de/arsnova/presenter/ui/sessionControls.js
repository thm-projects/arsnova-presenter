define(
	[
		"dijit/registry",
		"dijit/form/DropDownButton"
	],
	function(registry, DropDownButton) {
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
			},
			
			updateSessionSelect: function(sessions) {
				var sessionSelect = registry.byId("sessionSelect");
				sessions.forEach(function(session) {
					sessionSelect.addOption({
						label: session.shortName,
						value: session.keyword
					});
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
				dom.byId("activeUserCount").innerHTML = sessionModel.getActiveUserCount();
			}
		};
	}
);
