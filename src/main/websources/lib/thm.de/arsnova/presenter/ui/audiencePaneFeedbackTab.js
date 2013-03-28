define(
	[
		"dojo/on",
		"dojo/dom",
		"dojo/dom-construct",
		"dijit/registry",
		"dgerhardt/dijit/layout/ContentPane",
		"dijit/MenuItem",
		"dgerhardt/common/fullscreen",
		"arsnova-presenter/ui/chart/audienceFeedback"
	],
	function(on, dom, domConstruct, registry, ContentPane, MenuItem, fullScreen, audienceFeedbackChart) {
		"use strict";
		
		var
			self = null,
			feedbackModel = null,
			
			/* Dijit */
			audienceFeedbackPane = null
		;
		
		self = {
			/* public "methods" */
			init: function(tabContainer, feedback) {
				feedbackModel = feedback;
				
				audienceFeedbackPane = new ContentPane({
					id: "audienceFeedbackPane",
					title: "Live Feedback"
				});
				tabContainer.addChild(audienceFeedbackPane);
			},
			
			startup: function() {
				var feedbackPaneContentNode = domConstruct.create("div", {id: "audienceFeedbackPaneContent"}, audienceFeedbackPane.domNode);
				audienceFeedbackChart.init(feedbackPaneContentNode);
				
				feedbackModel.onReceive(function(feedback) {
					var feedback0 = feedback[0];
					feedback[0] = feedback[1];
					feedback[1] = feedback0;
					self.updateFeedbackPanel(feedback);
				});
				
				/* add full screen menu items */
				var fullScreenMenu = registry.byId("fullScreenMenu");
				fullScreenMenu.addChild(new MenuItem({
					label: "Audience feedback",
					onClick: this.togglePresentMode
				}));
				
				/* handle events fired when full screen mode is canceled */
				fullScreen.onChange(function(event, isActive) {
					if (!isActive) {
						self.exitFullScreenMode();
						
						audienceFeedbackPane.resize();
					}
				});
			},
			
			updateFeedbackPanel: function(feedback) {
				audienceFeedbackChart.update(feedback);
			},
			
			togglePresentMode: function() {
				if (fullScreen.isActive()) {
					/* dom node rearrangement takes place in fullscreenchange event handler */
					fullScreen.exit();
				} else {
					fullScreen.request(dom.byId("fullScreenContainer"));
					domConstruct.create("header", {id: "audienceFeedbackTitle", innerHTML: "Audience feedback"}, "fullScreenHeader");
					domConstruct.place(dom.byId("audienceFeedbackPaneContent"), "fullScreenContent");
					
					registry.byId("fullScreenContainer").resize();
				}
			},
			
			exitFullScreenMode: function() {
				domConstruct.place(dom.byId("audienceFeedbackPaneContent"), audienceFeedbackPane.domNode);
				domConstruct.destroy("audienceFeedbackTitle");
			}
		};
		
		return self;
	}
);
