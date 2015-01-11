/*
 * This file is part of ARSnova Presenter.
 * Copyright 2013-2015 Daniel Gerhardt <code@dgerhardt.net>
 *
 * ARSnova Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Presenter is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/_base/declare",
		"dojo/Stateful"
	],
	function (declare, Stateful) {
		"use strict";

		var AppState = declare(Stateful, {
			mode: null,
			fullscreen: false,
			sessionId: null,
			questionId: null,

			_sessionIdSetter: function (value) {
				this.sessionId = value;
				this.set("questionId", null);
			}
		});

		return new AppState();
	}
);
