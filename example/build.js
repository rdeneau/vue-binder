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
var App;
(function (App) {
    var vm;
    var Logger;
    (function (Logger) {
        var dateFormatter = new Intl.DateTimeFormat("fr-FR", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        function getCurrentTime() {
            var now = new Date();
            var hms = dateFormatter.format(now);
            var ms = (now.getMilliseconds() / 1000).toPrecision(3).substr(2, 3);
            return hms + "." + ms;
        }
        function logChanges(propName, propValue) {
            var prop = {};
            prop[propName] = propValue;
            var time = new Date().toLocaleTimeString("fr-FR");
            $("#changes").append($("<li><code>[" + getCurrentTime() + "] " + JSON.stringify(prop, null, 2) + "</code></li>"));
        }
        Logger.logChanges = logChanges;
        function logModel() {
            if (vm) {
                $("#model").text(JSON.stringify(vm.getModel(), null, 2));
            }
        }
        Logger.logModel = logModel;
    })(Logger || (Logger = {}));
    var adherentFieldsNames = [
        "TypePersonne",
        "Nom",
        "Age",
        "NumeroPermisConduire",
        "RaisonSociale",
        "FormeJuridique",
    ];
    var handlers = {
        Adherent: function (isAdherent, adherent) {
            modelExtension.AdherentInconnu = isAdherent === true && !adherent;
            modelExtension.ShowPersonne = isAdherent === false || !!adherent;
            var fieldsSelector = adherentFieldsNames.map(function (name) { return "[name='" + name + "']"; }).join(", ");
            $("input, select").filter(fieldsSelector).prop("disabled", false);
            if (adherent) {
                adherentFieldsNames.forEach(function (name) {
                    var value = adherent[name];
                    var $field = $("input[name='" + name + "']");
                    if ($field.prop("type") === "radio") {
                        $field.filter("[value='" + value + "']").click();
                    }
                    else {
                        $field.val(value);
                        $field.change();
                    }
                });
            }
            $("input, select").filter(fieldsSelector).prop("disabled", isAdherent === true);
        },
        IsAdherent: function (value) {
            handlers.Adherent(value);
        },
        NumeroAdherent: function (value) {
            var adherent = null;
            switch (value) {
                case "1":
                    return handlers.Adherent(true, {
                        TypePersonne: "PersonnePhysique",
                        Nom: "Raymond Devos",
                        Age: 80,
                        NumeroPermisConduire: "X 112233"
                    });
                case "2":
                    return handlers.Adherent(true, {
                        TypePersonne: "PersonneMorale",
                        RaisonSociale: "Lu Dong",
                        FormeJuridique: "EURL"
                    });
            }
            handlers.Adherent(true, null);
        }
    };
    var modelExtension = {
        AdherentInconnu: false,
        ShowPersonne: false
    };
    $(function () {
        vm = new Vue.Binder({
            root: ".container",
            listener: function (propName, propValue) {
                Logger.logModel();
                Logger.logChanges(propName, propValue);
                var handler = handlers[propName];
                if (handler) {
                    handler(propValue);
                }
            },
            modelExtensionFactory: function () { return modelExtension; }
        });
        Logger.logModel();
    });
})(App || (App = {}));
//# sourceMappingURL=build.js.map