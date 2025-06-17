odoo.define('valeo_enterprise_suite.dashboard', function (require) {
    "use strict";

    var AbstractAction = require('web.AbstractAction');
    var core = require('web.core');
    var QWeb = core.qweb;
    var _t = core._t;

    var ValeoDashboard = AbstractAction.extend({
        template: 'ValeoDashboardMain',
        events: {
            'click .valeo-dashboard-tile': '_onTileClick',
        },

        init: function(parent, action) {
            this._super.apply(this, arguments);
            this.action = action;
        },

        start: function() {
            return this._super.apply(this, arguments).then(this._loadDashboardData.bind(this));
        },

        _loadDashboardData: function() {
            var self = this;
            return this._rpc({
                route: '/valeo_enterprise_suite/dashboard_data',
            }).then(function(result) {
                self.$el.empty();
                self.$el.append(QWeb.render('ValeoDashboardContent', {
                    widget: self,
                    data: result
                }));
            });
        },

        _onTileClick: function(ev) {
            var $target = $(ev.currentTarget);
            var actionId = $target.data('action-id');
            if (actionId) {
                this.do_action(actionId);
            }
        },
    });

    core.action_registry.add('valeo_dashboard', ValeoDashboard);

    return ValeoDashboard;
}); 