var Vue;
(function (Vue) {
    var defaultOptions = {
        keys: {
            model: "vue-model",
            show: "vue-show"
        },
        listener: function (propName, propValue) { },
        modelExtensionFactory: function () { return ({}); },
        root: "body"
    };
    var Binder = (function () {
        function Binder(options) {
            var _this = this;
            this.model = {};
            this.options = $.extend(true, defaultOptions, options);
            $(this.options.root).on("change input", this.fieldsSelector, function (event) {
                var $field = $(event.currentTarget);
                _this.readField($field, true);
            });
            this.refresh();
        }
        Binder.prototype.getModel = function () {
            var modelCopy = JSON.parse(JSON.stringify(this.model));
            return $.extend({}, this.options.modelExtensionFactory(), modelCopy);
        };
        Binder.prototype.getSelector = function (key) {
            return "[data-" + this.options.keys[key] + "]";
        };
        Object.defineProperty(Binder.prototype, "fieldsSelector", {
            get: function () {
                var _this = this;
                return ["input", "select"]
                    .map(function (tag) { return "" + tag + _this.getSelector("model"); })
                    .join(", ");
            },
            enumerable: true,
            configurable: true
        });
        Binder.prototype.getFieldValueCore = function ($field) {
            switch ($field.prop("type")) {
                case "checkbox":
                    return $field.prop("checked");
                case "radio":
                    return $("input[type='radio'][name='" + $field.prop("name") + "']" + this.getSelector("model") + ":checked").val();
                case "number":
                    return parseFloat($field.val());
            }
            return $field.val();
        };
        Binder.prototype.getFieldValue = function ($field) {
            var propValue = this.getFieldValueCore($field);
            if (propValue === undefined) {
                return null;
            }
            if ($field.is("input[type='radio'], select") &&
                typeof propValue === "string" &&
                propValue.match(/^(true|false)$/i)) {
                return JSON.parse(propValue.toLowerCase());
            }
            return propValue;
        };
        Binder.prototype.readField = function ($field, withRefreshShow) {
            var propName = $field.data(this.options.keys.model)
                || $field.prop("name");
            var propValue = this.getFieldValue($field);
            if (this.updateModelProperty(propName, propValue)) {
                this.options.listener(propName, propValue);
                if (withRefreshShow) {
                    this.refreshShow();
                }
            }
        };
        Binder.prototype.refresh = function () {
            var _this = this;
            $(this.options.root).find(this.fieldsSelector).each(function (_, elem) {
                _this.readField($(elem), false);
            });
            this.refreshShow();
        };
        Binder.prototype.refreshShow = function () {
            var _this = this;
            $(this.options.root).find(this.getSelector("show")).each(function (_, elem) {
                var $element = $(elem);
                var expression = $element.data(_this.options.keys.show);
                var model = _this.getModel();
                var shown = eval(expression);
                $element.toggle(shown);
            });
        };
        Binder.prototype.updateModelProperty = function (propName, propValue) {
            var hasChanged = this.model[propName] !== propValue;
            if (hasChanged) {
                this.model[propName] = propValue;
            }
            return hasChanged;
        };
        return Binder;
    }());
    Vue.Binder = Binder;
})(Vue || (Vue = {}));
//# sourceMappingURL=vue-binder.js.map