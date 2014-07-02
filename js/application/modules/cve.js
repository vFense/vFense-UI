define(
    ['jquery', 'underscore', 'backbone', 'app', 'reports/report'],
    function ($, _, Backbone, app, reports) {
        'use strict';
        var exports = {
                View: app.createChild(reports.View)
            },
            template = function (params) {
                return {
                    rows: [
                        {
                            rowHeight: 6,
                            columns: [
                                {
                                    moduleName: 'reports/modules/cveInfo/cveInfo',
                                    moduleJSON: {
                                        id: params.id
                                    },
                                    moduleSpan: 12
                                }
                            ]
                        }
                    ]
                };
            };

        _.extend(exports.View.prototype, {
            template: template
        });

        return exports;
    }
);