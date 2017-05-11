var Vue;
(function (Vue) {
    var defaultEnglishConverters = {
        boolean: {
            parse: function (expression) {
                return expression.match(/^(true|false)$/i)
                    ? JSON.parse(expression.toLowerCase())
                    : null;
            },
            format: function (value) {
                return typeof value === "boolean" ? value.toString() : "";
            }
        },
        date: {
            parse: function (expression) {
                var ms = Date.parse(expression);
                if (Number.isNaN(ms)) {
                    return null;
                }
                var result = new Date(ms);
                ms -= 60 * 1000 * result.getTimezoneOffset();
                return new Date(ms);
            },
            format: function (value) {
                return value ? value.toDateString() : "";
            }
        },
        number: {
            parse: function (expression) {
                var result = parseFloat(expression);
                return Number.isNaN(result) ? null : result;
            },
            format: function (value) {
                return value || value === 0 ? value.toString() : "";
            }
        }
    };
    var defaultFrenchConverters = {
        boolean: defaultEnglishConverters.boolean,
        date: {
            parse: function (expression) {
                var ms = NaN;
                var match = expression.match(/^(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.]((?:19|20)\d\d)$/);
                if (match) {
                    var utcExpression = match[3] + "-" + match[2] + "-" + match[1] + "T00:00:00.000Z";
                    ms = Date.parse(utcExpression);
                }
                return Number.isNaN(ms) ? null : new Date(ms);
            },
            format: function (value) {
                return value ? value.toLocaleDateString() : "";
            }
        },
        number: {
            parse: function (expression) {
                expression = expression.replace(",", ".").replace(" ", "");
                var result = parseFloat(expression);
                return Number.isNaN(result) ? null : result;
            },
            format: function (value) {
                return value || value === 0 ? value.toLocaleString("fr", { style: "decimal", useGrouping: false }) : "";
            }
        }
    };
    Vue.localeConverters = {
        en: defaultEnglishConverters,
        fr: defaultFrenchConverters
    };
})(Vue || (Vue = {}));
//# sourceMappingURL=converters.js.map