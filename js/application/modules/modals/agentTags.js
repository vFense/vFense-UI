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
                    this.setHeaderHTML(this.renderAgentHeader());
                    this.setContentHTML(this.renderAgentTags());
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
                renderAgentHeader: function() {
                    return crel('h4', 'Tags for Agent ',
                        crel('em', this.agentName)
                    );
                },
                renderAgentTags: function () {
                    var fragment = crel('div', {class: 'list'}),
                        items = crel('div', {class: 'items row-fluid'});
                    _.each(this.tags, function (tag) {
                        $(items).append(crel('div', {class: 'item'},
                            crel('a', {href: '#tags/' + tag.tag_id},
                                crel('span', {class: 'span12'}, tag.tag_name)
                            )
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