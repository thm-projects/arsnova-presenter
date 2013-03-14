define(
	[
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/form/Button",
		"dijit/Dialog"
	],
	function(dom, domConstruct, domStyle, registry, Button, Dialog) {
		"use strict";
		
		var authService = null;
		
		return {
			init: function(auth) {
				console.log("-- UI: authControls.init --");
				
				authService = auth;
			},
			
			startup: function() {
				domConstruct.create("button", {id: "logoutButton", type: "button"}, "exitPanel");
				new Button({label: "Logout"}, "logoutButton").startup();
				registry.byId("logoutButton").onClick = authService.logout;
			},
			
			showLoginDialog: function() {
				var loginDialogContent = domConstruct.create("div");
				domConstruct.create("div", {innerHTML: "Please choose a service to login with:"}, loginDialogContent);
				var loginDialog = new Dialog({
					title: "Login",
					content: loginDialogContent,
					onCancel: function() {
						console.debug("Cancel action is disabled");
					}
				});
				var services = authService.getServices();
				for (var service in services) {
					new Button({
						label: services[service].title,
						onClick: function(url) {
							/* a function has to be returned because of the closure */
							return function() {
								location.href = url + "&referer=" + encodeURIComponent(location.href);
							};
						}(services[service].url)
					}).placeAt(loginDialogContent);
				}
				domStyle.set(loginDialog.closeButtonNode, "display", "none");
				loginDialog.show();
			}
		};
	}
);
