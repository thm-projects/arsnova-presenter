define(
	[
		"dojo/_base/config",
		"dojo/string",
		"dojo/request"
	],
	function(config, string, request) {
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
				var
					successUrl = encodeURIComponent(location.pathname + location.search),
					failureUrl = encodeURIComponent(location.pathname + location.search + "#loginerror")
				;
				
				return {
					guest: {
						title: "Guest login",
						url: string.substitute(
								"${prefix}/doLogin?type=guest&user=Guest&successurl=${success}&failureurl=${failure}",
								{prefix: apiRoot, success: successUrl, failure: failureUrl}
							)
					},
					thm: {
						title: "THM (CAS)",
						url: string.substitute(
								"${prefix}/doLogin?type=cas&successurl=${success}&failureurl=${failure}",
								{prefix: apiRoot, success: successUrl, failure: failureUrl}
							)
					},
					google: {
						title: "Google",
						url: string.substitute(
								"${prefix}/doLogin?type=google&successurl=${success}&failureurl=${failure}",
								{prefix: apiRoot, success: successUrl, failure: failureUrl}
							)
					},
					facebook: {
						title: "Facebook",
						url: string.substitute(
							"${prefix}/doLogin?type=facebook&successurl=${success}&failureurl=${failure}",
							{prefix: apiRoot, success: successUrl, failure: failureUrl}
						)
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
