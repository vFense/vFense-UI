define(
    ['jquery', 'underscore', 'backbone', 'app', 'crel', 'modals/panel'],
    function ($, _, Backbone, app, crel, Panel) {
        'use strict';
        var viewOptions = ['id', 'url', 'name', 'type', 'redirect', 'data', 'customers'], exports = {};
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
                    this.setHeaderHTML(this.renderDeleteHeader())
                        .setContentHTML(this.renderDeleteContent());
                   /* if (this.onRenderDeleteContent !== $.noop)
                    {
                        this.onRenderDeleteContent();
                    }*/
                    return this;
                },
                events: function () {
                    return _.extend({
                        'click .close'      :   'close',
                        'keyup input'       :   'toggleDeleteDisable'
//                        'change #userSelect2'   :   'toggle'
                    }, _.result(Panel.View.prototype, 'events'));
                },
                renderDeleteHeader: function () {
                    return crel('div', {class: 'row-fluid'},
                        crel('h4', {class: 'pull-left'}, 'Are you ABSOLUTELY sure?'),
                        crel('button', {type: 'button', class: 'close pull-right noMargin', 'aria-hidden': 'true'},
                            crel('i', {class: 'icon-remove'})
                        )
                    );
                },
                renderDeleteContent: function () {
                    return crel('div', {class: 'customerRemovalDiv'},
                        crel('label', {for: 'deleteAllAgents'}, 'type ',
                            crel('strong', 'yes'), ' to delete all agents'
                        ),
                        crel('input', {type: 'text', id: 'deleteAllAgents', required: 'required', style: 'width: 97%'}),
                        crel('span', {class: 'help-online'})
                    );
                },
                /*toggle: function (event) {
                    var $input = $(event.currentTarget),
                        customername = $input.data('customer'),
                        username = event.added ? event.added.text : event.removed.text,
                        groupId = $input.data('id'),
                        url = 'api/v1/customer/' + customername,
                        $alert = this.$el.find('div.alert'),
                        params,
                        users = [],
                        groups = [];
                    users.push(username);
                    groups.push(groupId);
                    params = {
                        usernames: users,//event.added ? event.added.text : event.removed.text,
                        action: event.added ? 'add' : 'delete'
                    };
                    $.ajax({
                        type: 'POST',
                        url: url,
                        data: JSON.stringify(params),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(response) {
                            if (response.rv_status_code) {
                                $alert.hide();
                            } else {
                                $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                            }
                        }
                    }).error(function (e) { window.console.log(e.responseText); });
                    return this;
                },
                onRenderDeleteContent: function () {
                    var $userSelect2 = this.$el.find('#userSelect2'),
                        that = this;
                        $userSelect2.select2({
                            width: '100%',
                            multiple: true,
                            initSelection: function (element, callback) {
                                var data = JSON.parse(element.val()),
                                    results = [];

                                _.each(data, function (object) {
                                    results.push({id: object.id || object.user_name, text: object.group_name ? object.group_name : object.user_name});
                                });
                                callback(results);
                            },
                            ajax: {
                                url: function () {
                                    return $userSelect2.data('url');
                                },
                                data: function () {
                                    return {
                                        customer_name: that.customerContext
                                    };
                                },
                                results: function (data) {
                                    var results = [];
                                    if (data.rv_status_code === 1001) {
                                        _.each(data.data, function (object) {
                                            results.push({id: object.id || object.user_name, text: object.group_name ? object.group_name : object.user_name});
                                        });
                                        return {results: results, more: false, context: results};
                                    }
                                }
                            }
                        });
                    return this;
                },
                getUserName: function() {
                    var username,
                        that = this;
                    _.each(this.data, function(customerData) {
                       username = customerData.users[0].user_name;
                    });
                    return username;
                },
                getUsers: function() {
                    var users,
                        that = this;
                    _.each(this.data, function(customerData) {
                        users = JSON.stringify(customerData.users);
                    });
                    return users;
                },*/
                getCustomers: function() {
                    var optionFragment = document.createDocumentFragment(),
                        that = this;
                    _.each(this.customers, function(customer) {
                        if(customer.customer_name !== that.name)
                        {
                            optionFragment.appendChild(crel('option', {value: customer.customer_name}, customer.customer_name));
                        }
                    });
                    return optionFragment;
                },
                confirm: function () {
                    var $button = this.$('button.btn-danger'),
                        $message = this.$('span.help-online'),
                        that = this,
                        params = {
                            view_names: [that.name]
                        };
                    if (!$button.hasClass('disabled')) {
                        $.ajax({
                            url: that.url,
                            data: JSON.stringify(params),
                            type: 'DELETE',
                            contentType: 'application/json',
                            success: function (response) {
                                that.cancel();
                                if (that.redirect === document.location.hash) {
                                    document.location.reload();
                                } else if (that.redirect) {
                                    document.location.hash = that.redirect;
                                }
                            },
                            error: function (response) {
                                $message.addClass('alert-error').html(response.responseText);
                            }
                        });
                    }
                    return this;
                },
                toggleDeleteDisable: function (event) {
                    var $input = $(event.currentTarget),
                        $button = this.$('button.btn-danger'),
                        value = $input.val();
                    if (value === 'yes') {
                        $button.removeClass('disabled');
                    } else {
                        if (!$button.hasClass('disabled')) {
                            $button.addClass('disabled');
                        }
                    }
                },
                span: '6',
                buttons: [
                    {
                        text: 'Delete Customer',
                        action: 'confirm',
                        style: 'width: 100%',
                        className: 'btn-danger disabled'
                    }
                ]
            })
        });
        return exports;
    }
);
