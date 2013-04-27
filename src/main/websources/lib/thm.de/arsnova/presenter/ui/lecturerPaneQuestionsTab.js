/*
 * Copyright 2013 Daniel Gerhardt <anp-dev@z.dgerhardt.net> <daniel.gerhardt@mni.thm.de>
 * 
 * This file is part of ARSnova Presenter.
 * 
 * Presenter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(
	[
		"dojo/on",
		"dojo/when",
		"dojo/dom-construct",
		"dgerhardt/dijit/layout/ContentPane",
		"arsnova-presenter/ui/mathJax",
		"arsnova-presenter/ui/lecturerPaneAnswersTab"
	],
	function(on, when, domConstruct, ContentPane, mathJax, answersTab) {
		"use strict";
		
		var
			self = null,
			model = null,
			
			/* DOM */
			questionListNode = null,
			
			/* Dijit */
			tabContainer = null,
			questionsPane = null
		;
		
		self = {
			/* public "methods" */
			init: function(_tabContainer, lecturerQuestionModel) {
				tabContainer = _tabContainer;
				model = lecturerQuestionModel;

				questionsPane = new ContentPane({
					id: "piQuestionsPane",
					title: "Questions"
				});
				tabContainer.addChild(questionsPane);
			},
			
			startup: function() {
				questionListNode = domConstruct.create("div", {id: "piQuestionList"}, questionsPane.domNode);
			},
			
			update: function(questions) {
				domConstruct.empty(questionListNode);
				
				if (null == questions) {
					return;
				}
				
				when(questions, function(questions) {
					/* group questions by category */
					var categories = {};
					questions.forEach(function(question) {
						if (!categories[question.subject]) {
							categories[question.subject] = [];
						}
						categories[question.subject].push(question);
					});
					
					for (var category in categories) {
						var categoryNode = domConstruct.create("div", {"class": "questionCategory"}, questionListNode);
						var categoryHeaderNode = domConstruct.create("header", null, categoryNode);
						categoryHeaderNode.appendChild(document.createTextNode(category));
						categories[category].forEach(function(question) {
							var questionNode = domConstruct.create("p", {"class": "question"}, categoryNode);
							questionNode.appendChild(document.createTextNode(question.text));
							mathJax.parse(questionNode);
							on(questionNode, "click", function(event) {
								model.setId(question._id);
								answersTab.selectTab();
							});
						});
					}
				});
			}
		};
		
		return self;
	}
);
