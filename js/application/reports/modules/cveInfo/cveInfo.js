define(
    ['jquery', 'underscore', 'backbone', 'crel', 'h5f', 'moment'],
    function ($, _, Backbone, crel, h5f, moment) {
        'use strict';
        var exports = {},
            tabNames = {
                '#main': {
                    name: 'MAIN',
                    keys: [
                        {name: 'cve_id', title: 'CVE ID:'},
                        {name: 'severity', title: 'CVE Severity:'},
                        {name: 'date_posted', title: 'CVE Published Date:'},
                        {name: 'date_modified', title: 'CVE Modified Date:'}
                    ]
                },
                '#cvssvector': {
                    name: 'CVSS Vector',
                    keys: [{name: 'vector', title: 'CVSS Vector:', cvssVector: [
                        {name: 'metric', value: 'value'}
                    ]
                    }]
                },
                '#classification': {
                    name: 'Classification',
                    keys: [
                        {name: 'impact_score', title: 'CVSS Impact Sub Score:'},
                        {name: 'exploit_score', title: 'CVSS Exploit Sub Score:'}
                    ]
                },
                '#references': {
                    name: 'References',
                    keys: [{name: 'references', title: 'CVE References:', references: [
                        {name: 'url', title: 'URL:'},
                        {name: 'source', title: 'Source:'},
                        {name: 'patch', title: 'Patch:'},
                        {name: 'advisory', title: 'Advisory:'},
                        {name: 'signature', title: 'Signature:'},
                        {name: 'id', title: 'ID:'}
                    ]
                    }]
                },
                '#description': {
                    name: 'Description',
                    keys: [{name: 'descriptions', title: 'CVE Description:', cveDescription: [
                        {name: 'description', title: 'Description:'},
                        {name: 'source', title: 'Source:'}
                    ]
                    }]
                },
                '#vulnerabilities': {
                    name: 'Vulnerabilities',
                    keys: [
                        {name: 'vulnerability_categories', title: 'Vulnerability Categories:'}
                    ]
                },
                '#cvssscore': {
                    name: 'CVSS Score',
                    keys: [
                        {name: 'score', title: 'CVSS Score:'},
                        {name: 'base_score', title: 'CVSS Base Score:'}
                    ]
                }
            };
        exports.name = 'cveInfo';
        exports.models = {
            Main: Backbone.Model.extend({
                defaults: {
                    defaultTab: '#main'
                }
            })
        };
        exports.views = {
            Main: Backbone.View.extend({
                tagName: 'div',
                className: ['hardwareInfo'].join(' '),
                initialize: function () {
                    if (_.isUndefined(this.model)) {
                        throw new Error('hardwareInfo view requires a hardwareInfo model');
                    }
                    var id = this.model.get('id'),
                        that = this;
                    this._currentTab = this.model.get('defaultTab');
                    this.cveModel = new (Backbone.Model.extend({
                        baseUrl: '/api/v1/vulnerability/cve/',
                        url: function () {
                            return this.baseUrl + id;
                        }
                    }))();
                    this.listenTo(this.cveModel, 'sync', this.renderTabs);
                },
                events: {
                    'click li a[data-toggle=tab]'   : 'changeTab'
                },
                beforeRender: $.noop,
                onRender: $.noop,
                render: function () {
                    if (this.beforeRender !== $.noop) { this.beforeRender(); }

                    var $el = this.$el;

                    if (this.cveModel.url) { this.cveModel.fetch(); }
                    if ($el.children().length === 0) {
                        $el.html(this.layout());
                    }
                    if (this.onRender !== $.noop) { this.onRender(); }
                    return this;
                },
                layout: function () {
                    var fragment = document.createDocumentFragment();
                    fragment.appendChild(
                        crel('div', {class: 'tabbable tabs-left'},
                            crel('ul', {class: 'nav nav-tabs'}),
                            crel('div', {class: 'tab-content'})
                        )
                    );
                    return fragment;
                },
                renderTabs: function(model) {
                    if (model.get('http_status_code') !== 200) {
                        throw new Error('API was not able to fetch data');
                    }
                    var selected,
                        $navTabs = this.$el.find('.nav-tabs'),
                        fragment = document.createDocumentFragment(),
                        that = this;
                    _.each(_.keys(tabNames), function (tabName) {
                        selected = (tabName === that._currentTab) ? 'active'  : '';
                        fragment.appendChild(
                            crel('li', {class: selected},
                                crel('a', {href: tabName, 'data-toggle': 'tab'}, tabNames[tabName].name))
                        );
                        if (selected) {
                            that.renderTab(tabName);
                        }
                    });
                    $navTabs.empty().append(fragment);
                    return this;
                },
                changeTab: function (event) {
                    event.preventDefault();
                    var href = $(event.currentTarget).attr('href');
                    this.renderTab(href);
                },
                formatDate: function (date) {
                    return date ? moment(date * 1000).format('L') : 'N/A';
                },
                renderTab: function (tab) {
                    var $content = this.$el.find('.tab-content'),
                        $dl = $(crel('table', {class: 'table cve-table'})),
                        data = this.cveModel.get('data'),
                        keys = tabNames[tab].keys;
                    $content.empty();
                    if (keys.length)
                    {
                        var that = this;
                        _.each(keys, function (object)
                        {
                            var content = data[object.name];
                            if (_.isUndefined(content))
                            {
                                return false;
                            }
                            else if (typeof content === 'string')
                            {
                                if(content === 'High')
                                {
                                    $dl.append(
                                        crel('tr', crel('th', object.title), crel('td', crel('span', {class: 'label label-important'}, data[object.name]) || 'N/A'))
                                    );
                                }
                                else  if(content === 'Medium')
                                {
                                    $dl.append(
                                        crel('tr', crel('th', object.title), crel('td', crel('span', {class: 'label label-warning'}, data[object.name]) || 'N/A'))
                                    );
                                }
                                else  if(content === 'Low')
                                {
                                    $dl.append(
                                        crel('tr', crel('th', object.title), crel('td', crel('span', {class: 'label label-primary'}, data[object.name]) || 'N/A'))
                                    );
                                }
                                else
                                {
                                    $dl.append(
                                        crel('tr', crel('th', object.title), crel('td', data[object.name] || 'N/A'))
                                    );
                                }
                            }
                            else if (content.length)
                            {
                                $dl.append(
                                    crel('tr', crel('th', object.title))
                                );
                                var innerContent;
                                _.each(content, function(innerObj) {
                                    if(object.hasOwnProperty('cvssVector'))
                                    {
                                        innerContent = object.cvssVector;
                                        _.each(innerContent, function (obj) {
                                            console.log(innerObj[obj]);
                                            $dl.append(
                                                crel('tr', crel('th', innerObj[obj.name] + ':'), crel('td', innerObj[obj.value] || 'N/A'))
                                            );
                                        });
                                    }
                                    else if(object.hasOwnProperty('references'))
                                    {
                                        innerContent = object.references;
                                        _.each(innerContent, function (obj) {
                                            if(obj.name !== 'source')
                                            {
                                                $dl.append(
                                                    crel('tr', crel('th', obj.title), crel('td', innerObj[obj.name]=== null ? 'N/A' : crel('a', {href: innerObj[obj.name]}, innerObj[obj.name])))
                                                );
                                            }
                                            else
                                            {
                                                $dl.append(
                                                    crel('tr', crel('th', obj.title), crel('td', innerObj[obj.name] || 'N/A'))
                                                );
                                            }
                                        });
                                    }
                                    else if(object.hasOwnProperty('cveDescription'))
                                    {
                                        innerContent = object.cveDescription;
                                        _.each(innerContent, function (obj) {
                                            $dl.append(
                                                crel('tr', crel('th', obj.title), crel('td', innerObj[obj.name] || 'N/A'))
                                            );
                                        });
                                    }
                                    else
                                    {
                                        $dl.append(
                                            crel('tr', crel('td', innerObj || 'N/A'))
                                        );
                                    }
                                });
                            }
                            else if(typeof content === "number")
                            {
                                $dl.append(
                                    crel('tr', crel('th', object.title), crel('td', that.formatDate(data[object.name])))
                                );
                            }
                            else
                            {
                                $dl.append(
                                    crel('tr', crel('th', object.title),  crel('td', 'No data to display'))
                                );
                            }
                        });
                    }
                    $content.append($dl);
                }
            })
        };
        return exports;
    }
);
