var profile = (function () {
	"use strict";

	return {
		resourceTags: {
			amd: function (filename, mid) {
				return !(/\/config\.js$/).test(filename) &&
					(/\.js$/).test(filename)
				;
			},

			copyOnly: function (filename, mid) {
				return (/\/config\.js$/).test(filename);
			}
		}
	};
}());
