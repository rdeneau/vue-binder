var App;
(function (App) {
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
        function clearLogs() {
            $("#changes").empty();
        }
        Logger.clearLogs = clearLogs;
        function logChanges(propName, propValue) {
            var prop = {};
            prop[propName] = propValue;
            var time = new Date().toLocaleTimeString("fr-FR");
            $("#changes").append($("<li><code>[" + getCurrentTime() + "] " + JSON.stringify(prop, null, 2) + "</code></li>"));
        }
        Logger.logChanges = logChanges;
        function logModel() {
            if (App.vm) {
                $("#model").text(JSON.stringify(App.vm.modelCopy, null, 2));
            }
        }
        Logger.logModel = logModel;
    })(Logger || (Logger = {}));
    var model = new App.Personne();
    var handlers = {
        IsAdherent: function (value) {
            $("#blocSaisiePersonne")
                .find("input, input-group-btn, select")
                .prop("disabled", value !== false);
            if (value) {
                handlers.NumeroAdherent(model.NumeroAdherent);
            }
        },
        NumeroAdherent: function (value) {
            model.searchByNumeroAdherent(value);
        }
    };
    $(function () {
        $("#btnClearLogs").click(function () {
            Logger.clearLogs();
        });
        App.DateUtils.initDatePicker(".container .input-group.date");
        App.vm = new Vue.Binder({
            model: model,
            root: ".container",
            listener: function (propName, propValue) {
                Logger.logModel();
                Logger.logChanges(propName, propValue);
                var handler = handlers[propName];
                if (handler) {
                    handler(propValue);
                }
            },
            converters: $.extend(true, {}, Vue.localeConverters.fr, { date: App.DateUtils.getDateConverter() })
        });
        Logger.logModel();
    });
})(App || (App = {}));
//# sourceMappingURL=main.js.map