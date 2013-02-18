define(
	[
		"dojo/_base/config",
		"dojo/request"
	],
	function(config, request) {
		var
			apiRoot = config.arsnovaApi.root,
			loginError = false,
			loginType = null,
			username = null,
			
			checkLoginStatus = function() {
				request.get(apiRoot + "/whoami", {sync: true}).then(
					function(response) {
						loginType = response.type;
						username = response.username;
					},
					function(error) {
						loginError = true;
					}
				);
			}
		;
		
		return {
			init: function(loginHandler) {
				checkLoginStatus();
				if (true == loginError) {
					console.log("Auth: user is not logged in");
					if (null != loginType) {
						console.log("Auth: user will be redirected to login service");
						location.href = apiRoot + "doLogin?type=" + loginType + "&user=" + username;
					} else {
						console.log("Auth: user cannot be logged in automatically");
						loginHandler();
					}
				} else {
					console.log("Auth: user is already logged in");
				}
			},
			getServices: function() {
				return {
					guest: {
						title: "Guest login",
						url: apiRoot + "/doLogin?type=guest&user=Guest"
					},
					thm: {
						title: "THM (CAS)",
						url: apiRoot + "/doLogin?type=cas"
					},
					google: {
						title: "Google",
						url: apiRoot + "/doLogin?type=google"
					},
					facebook: {
						title: "Facebook",
						url: apiRoot + "/doLogin?type=facebook"
					}
				};
			},
			logout: function() {
				location.href = apiRoot + "/logout";
			},
			isLoggedIn: function() {
				return !loginError;
			}
		};
	}
);
