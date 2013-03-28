define(
	[
		"dojo/dom",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dijit/registry",
		"dijit/form/Button",
		"dijit/Dialog",
		"version"
	],
	function(dom, domConstruct, domStyle, registry, Button, Dialog, version) {
		"use strict";
		
		var
			authService = null
		;
		
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
				domConstruct.create("img", {id: "loginLogo", src: "images/arsnova.png"}, document.body);
				var versionString = version.version;
				if (version.commitId) {
					versionString += " [" + version.commitId + "]";
				}
				var footerNode = domConstruct.create("div", {id: "loginFooter"}, document.body);
				footerNode.appendChild(document.createTextNode("ARSnova Presenter " + versionString));
				
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
