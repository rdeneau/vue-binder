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
    var Personne = (function () {
        function Personne() {
            this.IsAdherent = null;
            this.NumeroAdherent = null;
            this.TypePersonne = null;
            this.Nom = null;
            this.Age = null;
            this.NumeroPermisConduire = null;
            this.RaisonSociale = null;
            this.FormeJuridique = null;
        }
        Object.defineProperty(Personne.prototype, "IsAdherentInconnu", {
            get: function () {
                return this.IsAdherent === true
                    && this.NumeroAdherent.length > 0
                    && this.TypePersonne === null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Personne.prototype, "IsAdherentNonRenseigne", {
            get: function () {
                return this.IsAdherent === true &&
                    (!this.NumeroAdherent
                        || this.TypePersonne === null);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Personne.prototype, "ShowPersonne", {
            get: function () {
                return this.IsAdherent === false
                    || !this.IsAdherentNonRenseigne;
            },
            enumerable: true,
            configurable: true
        });
        Personne.prototype.searchByNumeroAdherent = function (numeroAdherent) {
            switch (numeroAdherent) {
                case "1":
                    this.TypePersonne = "PersonnePhysique";
                    this.Nom = "Raymond Devos";
                    this.Age = 80;
                    this.NumeroPermisConduire = "110234";
                    this.RaisonSociale = null;
                    this.FormeJuridique = null;
                    break;
                case "2":
                    this.TypePersonne = "PersonneMorale";
                    this.RaisonSociale = "Microsoft";
                    this.FormeJuridique = "SA";
                    this.Nom = null;
                    this.Age = null;
                    this.NumeroPermisConduire = null;
                    break;
                default:
                    this.TypePersonne = null;
                    this.RaisonSociale = null;
                    this.FormeJuridique = null;
                    this.Nom = null;
                    this.Age = null;
                    this.NumeroPermisConduire = null;
                    break;
            }
        };
        return Personne;
    }());
    var model = new Personne();
    var handlers = {
        IsAdherent: function (value) {
            $("#blocSaisiePersonne")
                .find("input, select, input-group-btn")
                .prop("disabled", value !== false);
            if (value) {
                model.NumeroAdherent = "";
            }
        },
        NumeroAdherent: function (value) {
            model.searchByNumeroAdherent(value);
        }
    };
    $(function () {
        App.vm = new Vue.Binder({
            root: ".container",
            listener: function (propName, propValue) {
                Logger.logModel();
                Logger.logChanges(propName, propValue);
                var handler = handlers[propName];
                if (handler) {
                    handler(propValue);
                }
            },
            model: model
        });
        Logger.logModel();
    });
})(App || (App = {}));
//# sourceMappingURL=main.js.map