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
            show: "vue-show"
        },
        typeSeparator: ":",
        listener: function () { },
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
            $(this.options.root).on("change input", this.getSelector("model") + ":input", function (event) {
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
        Binder.prototype.getFieldConverter = function ($field) {
            var propType = this.getFieldData($field).type;
            return this.options.converters[propType] || {
                format: function (value) { return value; },
                parse: function (expression) { return expression; }
            };
        };
        Binder.prototype.getFieldData = function ($field) {
            var fieldData = {
                name: $field.data(this.options.keys.model),
                type: null
            };
            if (fieldData.name && fieldData.name.indexOf(this.options.typeSeparator) >= 0) {
                var parts = fieldData.name.split(this.options.typeSeparator).concat([""]);
                fieldData = {
                    name: parts[0],
                    type: parts[1]
                };
            }
            return {
                name: fieldData.name || $field.prop("name") || $field.prop("id"),
                type: fieldData.type || $field.prop("type") || "string"
            };
        };
        Binder.prototype.getFieldValueCore = function ($field) {
            if (!$field.is(":input")) {
                return $field.text();
            }
            switch ($field.prop("type")) {
                case "checkbox":
                    var value = $field.prop("checked");
                    return typeof value === "boolean" ? value : null;
                case "radio":
                    return $("input[type='radio'][name='" + $field.prop("name") + "']" + this.getSelector("model") + ":checked").val();
            }
            return $field.val();
        };
        Binder.prototype.getFieldValue = function ($field) {
            var propValue = this.getFieldValueCore($field);
            if (propValue === undefined) {
                return null;
            }
            var converter = this.getFieldConverter($field);
            return converter.parse(propValue);
        };
        Binder.prototype.readField = function ($field, withRefreshShow) {
            var propName = this.getFieldData($field).name;
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
            var $fields = $(this.options.root).find(this.getSelector("model"));
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
                if (typeof shown !== "boolean" && typeof shown !== "undefined" && shown !== null) {
                    throw VueError.createShowBindingInvalidExpression($element[0], expression);
                }
                $element.toggle(shown);
            });
        };
        Binder.prototype.setFieldValue = function (propName, propValue) {
            var $fields = $(this.options.root).find(this.getSelector("model"));
            var $field = $fields.filter(this.getSelector("model", propName) + ", [name='" + propName + "'], [id='" + propName + "']");
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
                    var converter = this.getFieldConverter($field);
                    var value = converter.format(propValue);
                    if ($field.is(":input")) {
                        $field.val(value);
                    }
                    else {
                        $field.text(value);
                    }
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
//# sourceMappingURL=binder.js.map