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
            this.NumeroAdherent = "";
            this.TypePersonne = TypePersonne.NonRenseigne;
            this.Nom = "";
            this.Age = "";
            this.NumeroPermisConduire = "";
            this.RaisonSociale = "";
            this.FormeJuridique = "";
            this.DateCreation = "";
            this.Commentaire = "";
            this.CommentMaxLength = 0;
            this.CommentRemainingLength = 0;
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
                    this.RaisonSociale = "";
                    this.FormeJuridique = "";
                    this.DateCreation = "";
                    break;
                case "2":
                    this.TypePersonne = TypePersonne.PersonneMorale;
                    this.RaisonSociale = "Microsoft";
                    this.FormeJuridique = "SA";
                    this.DateCreation = new Date(Date.parse("1975-04-04T00:00:00.000Z"));
                    this.Nom = "";
                    this.Age = "";
                    this.NumeroPermisConduire = "";
                    break;
                default:
                    this.TypePersonne = TypePersonne.NonRenseigne;
                    this.RaisonSociale = "";
                    this.FormeJuridique = "";
                    this.DateCreation = "";
                    this.Nom = "";
                    this.Age = "";
                    this.NumeroPermisConduire = "";
                    break;
            }
        };
        Personne.prototype.updateCommentRemainingLength = function () {
            this.CommentRemainingLength = this.CommentMaxLength - (this.Commentaire || "").length;
        };
        return Personne;
    }());
    App.Personne = Personne;
})(App || (App = {}));
//# sourceMappingURL=personne.js.map