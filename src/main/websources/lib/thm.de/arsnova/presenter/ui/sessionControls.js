define(
	[
		"dojo/when",
		"dojo/dom",
		"dojo/dom-construct",
		"dijit/registry",
		"dijit/form/DropDownButton",
		"dijit/form/Select"
	],
	function(when, dom, domConstruct, registry, DropDownButton, Select) {
		"use strict";
		
		var
			sessionModel = null,
			sessionSelect = null
		;
		
		return {
			init: function(session) {
				console.log("-- UI: sessionControls.init --");
				
				sessionModel = session;

				/* Session info */
				var sessionInfoNode = domConstruct.create("div", {id: "sessionInfo"}, "headerPane");
				domConstruct.create("header", {id: "sessionTitle", innerHTML: "ARSnova Presenter"}, sessionInfoNode);
				domConstruct.create("span", {id: "activeUserCount", innerHTML: "-"}, sessionInfoNode);
				/* Session controls */
				var sessionPanelNode = domConstruct.create("div", {id: "sessionPanel"}, "headerPane");
				domConstruct.create("label", {"for": "sessionSelect", innerHTML: "Session"}, sessionPanelNode);
				domConstruct.create("select", {id: "sessionSelect"}, sessionPanelNode);
				domConstruct.create("span", {id: "sessionKeyword", innerHTML: "Keyword"}, sessionPanelNode);
				(sessionSelect = new Select({
					options: [{label: "Select a session", value: "", selected: true, disabled: true}],
					maxHeight: 200,
					onChange: function(value) {
						sessionModel.setKey(value);
					}
				}, "sessionSelect")).startup();
				
				/* button is destroyed on creation since it is not needed
				 * until editing features are available */
//				new DropDownButton({
//					label: "New",
//					dropDown: registry.byId("newSessionDialog")
//				}, "newSessionButton");
//				registry.byId("createSessionButton").onClick = this.submitCreateSessionForm;

				this.updateSessionSelect(sessionModel.getOwned());
				sessionModel.watchKey(this.onKeyChange);
				sessionModel.watchActiveUserCount(function(name, oldValue, value) {
					dom.byId("activeUserCount").innerHTML = value;
				});
			},
			
			startup: function() {},
			
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
					dom.byId("sessionTitle").innerHTML = session.name;
					var keyword = session.keyword.substr(0, 2)
						+ " " + session.keyword.substr(2, 2)
						+ " " + session.keyword.substr(4, 2)
						+ " " + session.keyword.substr(6, 2)
					;
					dom.byId("sessionKeyword").innerHTML = keyword;
				});
			}
		};
	}
);
