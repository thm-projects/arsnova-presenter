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
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Cache",
		"arsnova-api/session",
		"arsnova-api/socket"
	],
	function(config, JsonRestStore, MemoryStore, CacheStore, sessionModel, socket) {
		"use strict";

		var
			self = null,
			apiPrefix = config.arsnovaApi.root + "audiencequestion/",

			questionJsonRest = null,
			questionMemory = null,
			questionStore = null
		;

		sessionModel.watchKey(function(name, oldValue, value) {
			questionJsonRest = new JsonRestStore({
				target: apiPrefix,
				idProperty: "_id"
			});
			questionMemory = new MemoryStore({
				idProperty: "_id"
			});
			questionStore = CacheStore(questionJsonRest, questionMemory);
		});

		self = {
			getStore: function() {
				return questionStore;
			},

			getAll: function() {
				return questionStore.query({
					sessionkey: sessionModel.getKey()
				});
			},

			get: function(id) {
				var question = questionStore.get(id);
				if (null === question.text) {
					/* force reloading of question */
					questionMemory.remove(id);
					question = questionStore.get(id);
				}

				return question;
			},

			remove: function(id) {
				questionStore.remove(id);
			},

			onQuestionAvailable: function(callback) {
				socket.on("audQuestionAvail", callback);
			}
		};

		return self;
	}
);
