/*
 * Copyright 2013 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
 *
 * This file is part of libarsnova-js.
 *
 * libarsnova-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/_base/config",
		"dojo/string",
		"dojo/request"
	],
	function(config, string, request) {
		"use strict";

		var
			self = null,
			apiPrefix = config.arsnovaApi.root + "auth/",
			loginError = false,
			loginType = null,
			username = null,

			checkLoginStatus = function() {
				request.get(apiPrefix, {sync: true, handleAs: "json"}).then(
					function(response) {
						if ("ldap" == response.type) {
							/* guest login */
							loginError = true;
						} else {
							loginType = response.type;
							username = response.username;
						}
					},
					function(error) {
						loginError = true;
					}
				);
			}
		;

		self = {
			init: function(loginHandler) {
				console.log("-- auth.init --");

				checkLoginStatus();
				if (true == loginError) {
					console.log("Auth: user is not logged in");
					if (null != loginType) {
						console.log("Auth: user will be redirected to login service");
						location.href = apiPrefix + "login?type=" + loginType + "&user=" + username;
					} else {
						console.log("Auth: user cannot be logged in automatically");
						loginHandler();
					}
				} else {
					console.log("Auth: user is already logged in (" + loginType + ")");
				}
			},

			getServices: function() {
				var
					successUrl = encodeURIComponent(location.pathname + location.search + location.hash),
					failureUrl = encodeURIComponent(location.pathname + location.search + "#!/auth/error")
				;

				return {
//					guest: {
//						title: "Guest login",
//						url: string.substitute(
//								"${prefix}login?type=guest&user=Guest&successurl=${success}&failureurl=${failure}",
//								{prefix: apiPrefix, success: successUrl, failure: failureUrl}
//							)
//					},

					thm: {
						title: "THM (CAS)",
						url: string.substitute(
								"${prefix}login?type=cas&successurl=${success}&failureurl=${failure}",
								{prefix: apiPrefix, success: successUrl, failure: failureUrl}
							)
					},

					google: {
						title: "Google",
						url: string.substitute(
								"${prefix}login?type=google&successurl=${success}&failureurl=${failure}",
								{prefix: apiPrefix, success: successUrl, failure: failureUrl}
							)
					},

					facebook: {
						title: "Facebook",
						url: string.substitute(
							"${prefix}login?type=facebook&successurl=${success}&failureurl=${failure}",
							{prefix: apiPrefix, success: successUrl, failure: failureUrl}
						)
					}
				};
			},
			logout: function() {
				location.href = apiPrefix + "logout";
			},

			isLoggedIn: function() {
				return !loginError;
			}
		};

		return self;
	}
);
