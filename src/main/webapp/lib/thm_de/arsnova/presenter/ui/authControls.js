define(
	[
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/form/Button"
	],
	function(dom, domConstruct, domStyle, registry, Button) {
		"use strict";
		
		var authService = null;
		
		return {
			init: function(auth) {
				console.log("-- UI: authControls.init --");
				
				authService = auth;
				
				registry.byId("logoutButton").onClick = authService.logout;
			},
			
			showLoginDialog: function() {
				var services = authService.getServices();
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
			}
		};
	}
);
