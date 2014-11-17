define(
    ['jquery', 'underscore', 'backbone', 'app', 'crel', 'h5f', 'text!templates/modals/admin/users.html', 'select2'],
    function ($, _, Backbone, app, crel, h5f, myTemplate) {
        'use strict';
        var exports = {
            Collection: Backbone.Collection.extend({
                baseUrl: 'api/v1/users',
                params: {},
                parse: function (response) {
                    return response.data;
                },
                url: function () {
                    return this.baseUrl + '?' + $.param(this.params);
                }
            }),
            GroupCollection: Backbone.Collection.extend({
                baseUrl: 'api/v1/groups',
                filter: '',
                url: function () {
                    return this.baseUrl + this.filter;
                }
            }),
            View: Backbone.View.extend({
                initialize: function () {
                    this.template = myTemplate;
                    this.user = app.user.toJSON();
                    this.collection = new exports.Collection();
                    this.collection.params = {};
                    this.listenTo(this.collection, 'sync', this.render);
                    this.collection.fetch();

                    this.groupCollection = new exports.GroupCollection();
                    this.listenTo(this.groupCollection, 'sync', this.render);
                    this.groupCollection.fetch();

                    this.groupCollection.filter = '?all_customers=True';
                    this.groupCollection.fetch();

                    $.ajaxSetup({traditional: true});
                    return this;
                },
                events: {
                    'click button[name=toggleDisable]'  :   'toggleDisable',
                    'click button[name=toggleAcl]'      :   'toggleAclAccordion',
                    'click button[name=toggleDelete]'   :   'confirmDelete',
                    'change input[name=groupSelect]'    :   'toggle',
                    'change input[name=customerSelect]' :   'toggle',
                    'change input[name=groups]'         :   'retrieveGroups',
                    'change select[name=customers]'     :   'retrieveCustomers',
                    'click button[name=deleteUser]'     :   'deleteUser',
                    'click #cancelNewUser'              :   'displayAddUser',
                    'click #submitUser'                 :   'verifyForm',
                    'click #addUser'                    :   'displayAddUser',
                    'change #customerContext'           :   'changeCustomerContext',
                    'submit form'                       :   'submit'
                },
                toggleDisable: function(event) {
                    var toggleUser = $(event.currentTarget),
                        icon = toggleUser.find('i'),
                        $alert = this.$el.find('div.alert'),
                        username = icon.hasClass('icon-ban-circle') ? toggleUser.parents('.accordion-heading').find('button[name=toggleAcl]').find('span').text() : toggleUser.parents('.accordion-heading').find('.pull-left').find('strong').text(),
                        params = {
                            enabled: 'toggle'
                        };
                    $.ajax({
                        type: 'PUT',
                        url: 'api/v1/user/' + username,
                        data: JSON.stringify(params),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(response) {
                            if(response.vfense_status_code === 13001)
                            {
                                if(icon.hasClass('icon-ban-circle'))
                                {
                                    if(toggleUser.parents('.accordion-heading').siblings('.accordion-body').hasClass('in'))
                                    {
                                        toggleUser.parents('.accordion-heading').siblings('.accordion-body').collapse('toggle');
                                        toggleUser.parents('.accordion-heading').find('.pull-left').empty().append(crel('strong', username));
                                    }
                                    else
                                    {
                                        toggleUser.parents('.accordion-heading').find('.pull-left').empty().append(crel('strong', username));
                                    }
                                    icon.removeClass('icon-ban-circle').addClass('icon-ok-circle');
                                    toggleUser.attr('title', 'Enable User');
                                }
                                else
                                {
                                    icon.removeClass('icon-ok-circle').addClass('icon-ban-circle');
                                    toggleUser.attr('title', 'Disable User');
                                    toggleUser.parents('.accordion-heading').find('.pull-left').empty()
                                        .append(
                                            crel('button', {name: 'toggleAcl', class: 'btn btn-link noPadding'},
                                                crel('i', {class: 'icon-circle-arrow-down'}, ' '),
                                                crel('span', username)
                                            )
                                    );
                                }
                            }
                            else
                            {
                                $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                            }
                        }
                    });
                    return this;
                },
                retrieveGroups: function(event) {
                    this.groupsArray = event.val;
                    return this;
                },
                retrieveCustomers: function(event) {
                    this.customersArray = event.val;
                    return this;
                },
                changeCustomerContext: function (event) {
                    this.collection.params.view_context = this.user.current_view = event.val;
                    this.collection.fetch();
                    return this;
                },
                toggleAclAccordion: function (event) {
                    var $href = $(event.currentTarget),
                        $icon = $href.find('i'),
                        $accordionParent = $href.parents('.accordion-group'),
                        $accordionBody = $accordionParent.find('.accordion-body').first();
                    $icon.toggleClass('icon-circle-arrow-down icon-circle-arrow-up');
                    $accordionBody.unbind().collapse('toggle');
                    $accordionBody.on('hidden', function (event) {
                        event.stopPropagation();
                    });
                    return this;
                },
                displayAddUser: function (event) {
                    event.preventDefault();
                    var $addUserDiv = this.$('#newUserDiv');
                    $addUserDiv.toggle();
                    return this;
                },
                confirmDelete: function (event) {
                    var $parentDiv = $(event.currentTarget).parent();
                    $parentDiv.children().toggle();
                    return this;
                },
                deleteUser: function (event) {
                    var $deleteButton = $(event.currentTarget),
                        $userRow = $deleteButton.parents('.item'),
                        $alert = this.$el.find('div.alert'),
                        user = $deleteButton.val();
                    $.ajax({
                        type: 'DELETE',
                        url: '/api/v1/user/' + user,
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(response){
                            if (response.vfense_status_code) {
                                $userRow.remove();
                                $alert.removeClass('alert-error').addClass('alert-success').show().find('span').html(response.message);
                            } else {
                                $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                            }
                        }
                    });
                    return this;
                },
                verifyForm: function (event) {
                    var form = document.getElementById('newUserDiv');
                    if (form.checkValidity()) {
                        this.submitNewUser(event);
                    }
                    return this;
                },
                submitNewUser: function (event) {
                    event.preventDefault();
                    var fullName = this.$el.find('#fullname').val(),
                        email = this.$el.find('#email').val(),
                        username = this.$el.find('#username').val(),
                        password = this.$el.find('#password').val(),
                        group = this.$el.find('input[name=groups]').select2('data'),
                        customers = this.$el.find('select[name=customers]').select2('data'),
                        $alert = this.$('#newUserDiv').find('.help-online'),
                        params = {
                            fullname: fullName,
                            email: email,
                            username: username,
                            password: password,
                            customer_context: this.customerContext
                        },
                        that = this;

                    params.group_ids = this.groupsArray;
                    params.customer_names = this.customersArray;

                    var fullNameRegExp = /^[A-Za-z0-9 -_]+$/,
                        userNameRegExp = /^[A-Za-z0-9-_]+$/,
                        passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*[+=\\\/<>,:;\{\}'"])(?!.*\s).{8,}$/,
                        emailRegExp = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if(!_.isEmpty(fullName))
                    {
                        if(!fullNameRegExp.test(fullName))
                        {
                            that.$el.find('#fullname').parents('.control-group').addClass('error');
                            that.$el.find('#fullname').siblings('.help-block').html('Full Name should have alphanumeric characters only.').show();
                            return false;
                        }
                        else
                        {
                            that.$el.find('#fullname').parents('.control-group').removeClass('error');
                            that.$el.find('#fullname').siblings('.help-block').empty().hide();
                        }
                    }

                    if(!_.isEmpty(email))
                    {
                        if(!emailRegExp.test(email))
                        {
                            that.$el.find('#email').parents('.control-group').addClass('error');
                            that.$el.find('#email').siblings('.help-block').html('Invalid Email-ID format.').show();
                            return false;
                        }
                        else
                        {
                            that.$el.find('#email').parents('.control-group').removeClass('error');
                            that.$el.find('#email').siblings('.help-block').empty().hide();
                        }
                    }

                    if(!$.trim(username))
                    {
                        that.$el.find('#username').parents('.control-group').addClass('error');
                        that.$el.find('#username').siblings('.help-block').html('Username should not be empty.').show();
                        return false;
                    }
                    else if(!userNameRegExp.test(username))
                    {
                        that.$el.find('#username').parents('.control-group').addClass('error');
                        that.$el.find('#username').siblings('.help-block').html('Username should have alphanumeric characters only.').show();
                        return false;
                    }
                    else
                    {
                        that.$el.find('#username').parents('.control-group').removeClass('error');
                        that.$el.find('#username').siblings('.help-block').empty().hide();
                    }

                    if(!$.trim(password))
                    {
                        that.$el.find('#password').parents('.control-group').addClass('error');
                        that.$el.find('#password').siblings('.help-block').html('Password should not be empty.').show();
                        return false;
                    }
                    else if(!passwordRegExp.test(password))
                    {
                        that.$el.find('#password').parents('.control-group').addClass('error');
                        that.$el.find('#password').siblings('.help-block').html('Password must have at least 1 Lowercase, 1 Uppercase, 1 Numeric,'  + '<br>' + '1 Special Character excluding +=<>,"{}\/:;' + ' and minimum 8 characters.').show();
                        return false;
                    }
                    else
                    {
                        that.$el.find('#password').parents('.control-group').removeClass('error');
                        that.$el.find('#password').siblings('.help-block').empty().hide();
                    }

                    if(group.length === 0)
                    {
                        that.$el.find('input[name=groups]').parents('.control-group').addClass('error');
                        that.$el.find('input[name=groups]').siblings('.help-block').html('At least one Group must be selected.').show();
                        return false;
                    }
                    else
                    {
                        that.$el.find('input[name=groups]').parents('.control-group').removeClass('error');
                        that.$el.find('input[name=groups]').siblings('.help-block').empty().hide();
                    }

                    $.ajax({
                        type: 'POST',
                        url: '/api/v1/users',
                        data: JSON.stringify(params),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(response) {
                            if (response.vfense_status_code) {
                                that.collection.fetch();
                            } else {
                                $alert.removeClass('alert-success').addClass('alert-error').html(response.message).show();
                            }
                        }
                    }).error(function (e) { window.console.log(e.statusText); });
                    return this;
                },
                toggle: function (event) {
                    var $input = $(event.currentTarget),
                        username = $input.data('user'),
                        currentCustomer = $input.data('customer'),
                        groupId = $input.data('id'),
                        url =  'api/v1/user/' + username,
                        $alert = this.$el.find('div.alert'),
                        params,
                        users = [],
                        groups = [];
                    users.push(username);
                    groups.push(groupId);
                    params = {
                        customer_context: currentCustomer,
                        group_ids: groups,
                        action: event.added ? 'add' : 'delete'
                    };
                    $.ajax({
                        type: 'POST',
                        url: url,
                        data: JSON.stringify(params),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function(response) {
                            if (response.vfense_status_code) {
                                $alert.hide();
                            } else {
                                $alert.removeClass('alert-success').addClass('alert-error').show().find('span').html(response.message);
                            }
                        }
                    }).error(function (e) { window.console.log(e.responseText); });
                    return this;
                },
                beforeRender: $.noop,
                onRender: function () {
                    var $groups = this.$('input[name=groups]'),
                        $customers = this.$('select[name=customers]'),
                        $select = this.$el.find('input[name=groupSelect], input[name=customerSelect]'),
                        groups = this.groupCollection.toJSON()[0].data,
                        that = this;

                    $groups.select2({
                        width: '100%',
                        multiple: true,
                        initSelection: function (element, callback) {
                            var data = JSON.parse(element.val()),
                                results = [];
                            _.each(data, function (object) {
                                results.push({id: object.id, text: object.group_name});
                            });
                            callback(results);
                        },
                        ajax: {
                            url: function () {
                                return $groups.data('url');
                            },
                            data: function () {
                                return {
                                    customer_context: that.customerContext
                                };
                            },
                            results: function (data) {
                                var results = [];
                                if (data.vfense_status_code === 1001) {
                                    _.each(data.data, function (object) {
                                        results.push({id: object.id, text: object.group_name});
                                    });
                                    return {results: results, more: false, context: results};
                                }
                            }
                        }
                    });

                    $customers.select2({width: '100%'});

                    _.each($select, function(select) {
                        if($(select).data('user') === 'admin')
                        {
                            $(select).on('select2-opening', function(event){
                                event.preventDefault();
                            });

                            $(select).select2({
                                width: '100%',
                                multiple: true,
                                initSelection: function (element, callback) {
                                    var data = JSON.parse(element.val()),
                                        results = [];
                                    _.each(data, function (object) {
                                        results.push({locked: true, id: object.group_id || object.customer_name, text: object.group_name ? object.group_name : object.customer_name});
                                    });
                                    callback(results);
                                },
                                ajax: {
                                    url: function () {
                                        return $(select).data('url');
                                    },
                                    data: function () {
                                        if(select.name === 'groupSelect')
                                        {
                                            return {
                                                customer_context: $(select).data('customer')
                                            };
                                        }
                                        else
                                        {
                                            return {

                                            };
                                        }
                                    },
                                    results: function (data) {
                                        var results = [];
                                        if (data.vfense_status_code === 1001) {
                                            _.each(data.data, function (object) {
                                                results.push({id: object.group_id || object.customer_name, text: object.group_name ? object.group_name : object.customer_name});
                                            });
                                            return {results: results, more: false, context: results};
                                        }
                                    }
                                }
                            });
                        }
                        else
                        {
                            $(select).select2({
                                width: '100%',
                                multiple: true,
                                initSelection: function (element, callback) {
                                    var data = JSON.parse(element.val()),
                                        results = [];
                                    _.each(data, function (object) {
                                        if(object.group_id)
                                        {
                                            _.each(groups, function (group) {
                                                if(object.group_id === group.id)
                                                {
                                                    if(_.indexOf(group.permissions, 'administrator') !== -1)
                                                    {
                                                        results.push({locked: true, id: object.group_id, text: object.group_name});
                                                    }
                                                    else
                                                    {
                                                        results.push({id: object.group_id, text: object.group_name});
                                                    }
                                                }
                                            });
                                        }
                                        else
                                        {
                                            results.push({id: object.customer_name, text: object.customer_name});
                                        }
                                    });
                                    callback(results);
                                },
                                ajax: {
                                    url: function () {
                                        return $(select).data('url');
                                    },
                                    data: function () {
                                        if(select.name === 'groupSelect')
                                        {
                                            return {
                                                customer_context: $(select).data('customer')
                                            };
                                        }
                                        else
                                        {
                                            return {

                                            };
                                        }
                                    },
                                    results: function (data) {
                                        var results = [];
                                        if (data.vfense_status_code === 1001) {
                                            _.each(data.data, function (object) {
                                                results.push({id: object.id || object.customer_name, text: object.group_name ? object.group_name : object.customer_name});
                                            });
                                            return {results: results, more: false, context: results};
                                        }
                                    }
                                }
                            });
                        }
                    });
                    return this;
                },
                render: function () {
                    if (this.beforeRender !== $.noop) { this.beforeRender(); }

                    var template = _.template(this.template),
                        data = this.collection.toJSON(),
                        groups = this.groupCollection.toJSON()[0],
                        customers = this.user.views,
                        payload;
                    if (data && groups) {
                        payload = {
                            data: data,
                            groups: groups.data,
                            customers: customers,
                            currentCustomer: this.user.current_view,
                            viewHelpers: {
                                getOptions: function (options, selected) {
                                    var select = crel('select'), attributes;
                                    selected = selected || false;
                                    if (options.length) {
                                        _.each(options, function (option) {
                                            if (_.isUndefined(option.administrator) || option.administrator) {
                                                if(option.group_name)
                                                {
                                                    attributes = {value: option.id};
                                                    if (selected && option.group_name === selected) {attributes.selected = selected;}
                                                    select.appendChild(crel('option', attributes, option.group_name));
                                                }
                                                else if(option.customer_name)
                                                {
                                                    attributes = {value: option.id || option.customer_name};
                                                    if (selected && option.customer_name === selected) {attributes.selected = selected;}
                                                    select.appendChild(crel('option', attributes, option.customer_name));
                                                }
                                            }
                                        });
                                    }
                                    return select.innerHTML;
                                },
                                renderDeleteButton: function (user) {
                                    var fragment;
                                    if (user.user_name !== 'admin') {
                                        fragment = crel('div');
                                        fragment.appendChild(
                                            crel('button', {title: 'Disable User', class: 'btn btn-link right-margin noPadding', name: 'toggleDisable'},
                                                crel('i', {class: 'icon-ban-circle'})
                                            )
                                        );
                                        fragment.appendChild(
                                            crel('button', {title: 'Delete User', class: 'btn btn-link noPadding', name: 'toggleDelete'},
                                                crel('i', {class: 'icon-remove', style: 'color: red'})
                                            )
                                        );
                                        return fragment.innerHTML;
                                    }
                                },
                                renderUserLink: function (user) {
                                    var fragment = crel('div');
                                    fragment.appendChild(
                                        crel('button', {name: 'toggleAcl', class: 'btn btn-link noPadding'},
                                            crel('i', {class: 'icon-circle-arrow-down'}, ' '),
                                            crel('span', user.user_name)
                                        )
                                    );
                                    /*if (user.user_name !== 'admin') {
                                     fragment.appendChild(
                                     crel('button', {name: 'toggleAcl', class: 'btn btn-link noPadding'},
                                     crel('i', {class: 'icon-circle-arrow-down'}, ' '),
                                     crel('span', user.user_name)
                                     )
                                     );
                                     } else {
                                     fragment.appendChild(
                                     crel('strong', user.user_name)
                                     );
                                     }*/
                                    return fragment.innerHTML;
                                }
                            }
                        };
                        console.log('payload: ', payload);
                        this.$el.empty().html(template(payload));

                        if (this.onRender !== $.noop) { this.onRender(); }
                    }
                    return this;
                }
            })
        };
        return exports;
    }
);
