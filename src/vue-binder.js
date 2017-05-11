var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Vue;
(function (Vue) {
    var defaultOptions = {
        converters: Vue.localeConverters.en,
        keys: {
            model: "vue-model",
            show: "vue-show",
            type: "vue-type"
        },
        listener: function (propName, propValue) { },
        model: {},
        root: "body"
    };
    var VueError = (function (_super) {
        __extends(VueError, _super);
        function VueError(element, name, message) {
            var _this = _super.call(this, message) || this;
            _this.element = element;
            _this.name = "VueError:" + name;
            return _this;
        }
        VueError.createModelBindingNameMissing = function (element) {
            return new VueError(element, "ModelBinding:NameMissing", "Missing name for the vue-model binding");
        };
        VueError.createShowBindingInvalidExpression = function (element, expression) {
            return new VueError(element, "ShowBinding:InvalidExpression", "Invalid expression '" + expression + "' in data-vue-show attribute: expecting boolean");
        };
        return VueError;
    }(Error));
    var Binder = (function () {
        function Binder(options) {
            var _this = this;
            this.options = $.extend(true, defaultOptions, options);
            this.model = this.options.model;
            $(this.options.root).on("change input", this.fieldsSelector, function (event) {
                var $field = $(event.currentTarget);
                _this.readField($field, true);
            });
            this.refresh();
        }
        Object.defineProperty(Binder.prototype, "modelCopy", {
            get: function () {
                return $.extend(true, {}, this.model);
            },
            enumerable: true,
            configurable: true
        });
        Binder.prototype.getSelector = function (key, value) {
            value = value ? "='" + value + "'" : "";
            return "[data-" + this.options.keys[key] + value + "]";
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
                    var value = $field.prop("checked");
                    return typeof value === "boolean" ? value : null;
                case "radio":
                    return $("input[type='radio'][name='" + $field.prop("name") + "']" + this.getSelector("model") + ":checked").val();
            }
            return $field.val();
        };
        Binder.prototype.getFieldType = function ($field) {
            return $field.data(this.options.keys.type)
                || $field.prop("type");
        };
        Binder.prototype.getFieldValue = function ($field) {
            var propValue = this.getFieldValueCore($field);
            if (propValue === undefined) {
                return null;
            }
            var type = this.getFieldType($field);
            var converter = this.options.converters[type] || {};
            var parse = converter.parse || (function (val) { return val; });
            return parse(propValue);
        };
        Binder.prototype.readField = function ($field, withRefreshShow) {
            var propName = $field.data(this.options.keys.model)
                || $field.prop("name")
                || $field.prop("id");
            if (!propName) {
                throw VueError.createModelBindingNameMissing($field[0]);
            }
            var propValue = this.getFieldValue($field);
            if (!this.updateModelProperty(propName, propValue)) {
                return;
            }
            this.options.listener(propName, propValue);
            if (withRefreshShow) {
                this.refreshShow();
            }
        };
        Binder.prototype.refresh = function () {
            var _this = this;
            var $fields = $(this.options.root).find(this.fieldsSelector);
            $fields.each(function (_, elem) {
                var $field = $(elem);
                if ($field.is(":radio")) {
                    var name_1 = $field.prop("name");
                    var $radios = $fields.filter("[name='" + name_1 + "']");
                    var $radio = $radios.filter(":checked");
                    if ($radio.length === 0) {
                        $radio = $radios.first();
                    }
                    if ($field.filter($radio).length === 0) {
                        return;
                    }
                    $field = $radios;
                }
                _this.readField($field, false);
            });
            this.refreshShow();
        };
        Binder.prototype.refreshShow = function () {
            var _this = this;
            $(this.options.root).find(this.getSelector("show")).each(function (_, elem) {
                var $element = $(elem);
                var expression = $element.data(_this.options.keys.show);
                var model = _this.modelCopy;
                var shown = eval(expression);
                if (typeof shown !== "boolean") {
                    throw VueError.createShowBindingInvalidExpression($element[0], expression);
                }
                $element.toggle(shown);
            });
        };
        Binder.prototype.setFieldValue = function (propName, propValue) {
            var $fields = $(this.options.root).find(this.fieldsSelector);
            var $field = $fields.filter(this.getSelector("model", propName) + ", [name='" + propName + "']");
            if (propValue === this.getFieldValue($field)) {
                return;
            }
            switch ($field.prop("type")) {
                case "checkbox":
                    $field.prop("checked", !!propValue);
                    break;
                case "radio":
                    $field.filter("[value='" + propValue + "']")
                        .prop("checked", true);
                    break;
                default:
                    var type = this.getFieldType($field);
                    var converter = this.options.converters[type] || {};
                    var format = converter.format || (function (val) { return val; });
                    $field.val(format(propValue));
            }
            this.options.listener(propName, propValue);
        };
        Binder.prototype.updateModelProperty = function (propName, propValue) {
            var _this = this;
            var parent = this.model;
            var names = propName.split(".");
            for (var i = 0; i < names.length - 1; i++) {
                var nextparent = parent[names[i]];
                if (typeof nextparent !== "object" || nextparent === null) {
                    nextparent = parent[names[i]] = {};
                }
                parent = nextparent;
            }
            propName = names[names.length - 1];
            var propInfo = Object.getOwnPropertyDescriptor(parent, propName);
            if (!propInfo || !propInfo.get) {
                delete parent[propName];
                Object.defineProperty(parent, propName, {
                    configurable: false,
                    enumerable: true,
                    get: function () { return propValue; },
                    set: function (val) {
                        propValue = val;
                        _this.setFieldValue(propName, propValue);
                    }
                });
                return true;
            }
            var hasChanged = parent[propName] !== propValue;
            if (hasChanged) {
                parent[propName] = propValue;
            }
            return hasChanged;
        };
        return Binder;
    }());
    Vue.Binder = Binder;
})(Vue || (Vue = {}));
//# sourceMappingURL=vue-binder.js.map