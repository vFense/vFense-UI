define(
	['jquery', 'underscore'],
	function ($, _) {
		'use strict';
		var exports = {
			serializeForm: function ($form) {
				var output = {};
				var input = $form.serializeArray();
				$.each(input, function() {
					if (output[this.name] !== undefined) {
						if (!output[this.name].push) {
							output[this.name] = [output[this.name]];
						}
						output[this.name].push(this.value || '');
					} else {
						output[this.name] = this.value || '';
					}
				});
				return output;
			}
		};
		return exports;
	}
);
