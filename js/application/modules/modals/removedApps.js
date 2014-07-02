define(
    ['jquery', 'underscore', 'backbone', 'crel', 'modals/panel'],
    function ($, _, Backbone, crel, Panel) {
        'use strict';
        var viewOptions = ['id', 'agentName', 'tags', 'type'], exports = {};
        _.extend(exports, {
            View: Panel.View.extend({
                id: '',
                type: '',
                data: {},
                initialize: function (options) {
                    if (_.isObject(options)) {
                        _.extend(this, _.pick(options, viewOptions));
                    }
                    Panel.View.prototype.initialize.call(this);
                    this.setHeaderHTML(this.renderAppHeader());
                    this.setContentHTML(this.renderRemovedApps());
                    return this;
                },
                events: function () {
                    return _.extend({
                        'click .close': 'close',
                        'click a': 'hideModal'
                    }, _.result(Panel.View.prototype, 'events'));
                },
                hideModal: function(event) {
                    event.stopPropagation();
                    this.hide();
                    return this;
                },
                renderAppHeader: function() {
                    return crel('h4', 'Removed Apps');
                },
                renderRemovedApps: function () {
                    var fragment = crel('div', {class: 'list'}),
                        items = crel('div', {class: 'items row-fluid'});
                    _.each(this.removedApps, function (app) {
                        $(items).append(crel('div', {class: 'item'},
                            crel('span', {class: 'span12'}, app)
                        ));
                    });
                    fragment.appendChild(items);
                    return fragment;
                }
            })
        });
        return exports;
    }
);