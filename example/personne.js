var App;
(function (App) {
    var TypePersonne;
    (function (TypePersonne) {
        TypePersonne[TypePersonne["NonRenseigne"] = 0] = "NonRenseigne";
        TypePersonne[TypePersonne["PersonnePhysique"] = 1] = "PersonnePhysique";
        TypePersonne[TypePersonne["PersonneMorale"] = 2] = "PersonneMorale";
    })(TypePersonne = App.TypePersonne || (App.TypePersonne = {}));
    var Personne = (function () {
        function Personne() {
            this.IsAdherent = null;
            this.NumeroAdherent = null;
            this.TypePersonne = TypePersonne.NonRenseigne;
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
        Object.defineProperty(Personne.prototype, "IsAdherentRenseigne", {
            get: function () {
                return this.IsAdherent === true
                    && this.TypePersonne !== TypePersonne.NonRenseigne;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Personne.prototype, "ShowPersonne", {
            get: function () {
                return this.IsAdherent === false
                    || this.IsAdherentRenseigne;
            },
            enumerable: true,
            configurable: true
        });
        Personne.prototype.searchByNumeroAdherent = function (numeroAdherent) {
            switch (numeroAdherent) {
                case "1":
                    this.TypePersonne = TypePersonne.PersonnePhysique;
                    this.Nom = "Raymond Devos";
                    this.Age = 80;
                    this.NumeroPermisConduire = "110234";
                    this.RaisonSociale = null;
                    this.FormeJuridique = null;
                    break;
                case "2":
                    this.TypePersonne = TypePersonne.PersonneMorale;
                    this.RaisonSociale = "Microsoft";
                    this.FormeJuridique = "SA";
                    this.Nom = null;
                    this.Age = null;
                    this.NumeroPermisConduire = null;
                    break;
                default:
                    this.TypePersonne = TypePersonne.NonRenseigne;
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
    App.Personne = Personne;
})(App || (App = {}));
//# sourceMappingURL=personne.js.map