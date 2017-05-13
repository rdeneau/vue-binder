namespace App {
    export enum TypePersonne {
        NonRenseigne,
        PersonnePhysique,
        PersonneMorale
    }

    export class Personne {
        IsAdherent            : boolean | null = null;
        NumeroAdherent                         = "";
        TypePersonne          : TypePersonne   = TypePersonne.NonRenseigne;
        Nom                                    = "";
        Age                   : number | ""    = "";
        NumeroPermisConduire                   = "";
        RaisonSociale                          = "";
        FormeJuridique                         = "";
        DateCreation          : Date | ""      = "";
        Commentaire                            = "";
        CommentMaxLength                       = 0;
        CommentRemainingLength                 = 0;

        get IsAdherentInconnu() {
            return this.IsAdherent === true
                && this.NumeroAdherent.length > 0
                && this.TypePersonne === null;
        }

        get IsAdherentRenseigne() {
            return this.IsAdherent === true
                && this.TypePersonne !== TypePersonne.NonRenseigne;
        }

        get ShowPersonne() {
            return this.IsAdherent === false
                || this.IsAdherentRenseigne;
        }

        searchByNumeroAdherent(numeroAdherent: string) {
            switch (numeroAdherent) {
                case "1":
                    this.TypePersonne         = TypePersonne.PersonnePhysique;
                    this.Nom                  = "Raymond Devos";
                    this.Age                  = 80;
                    this.NumeroPermisConduire = "110234";
                    this.RaisonSociale        = "";
                    this.FormeJuridique       = "";
                    this.DateCreation         = "";
                    break;

                case "2":
                    this.TypePersonne         = TypePersonne.PersonneMorale;
                    this.RaisonSociale        = "Microsoft";
                    this.FormeJuridique       = "SA";
                    this.DateCreation         = new Date(Date.parse("1975-04-04T00:00:00.000Z"));
                    this.Nom                  = "";
                    this.Age                  = "";
                    this.NumeroPermisConduire = "";
                    break;

                default: 
                    this.TypePersonne         = TypePersonne.NonRenseigne;
                    this.RaisonSociale        = "";
                    this.FormeJuridique       = "";
                    this.DateCreation         = "";
                    this.Nom                  = "";
                    this.Age                  = "";
                    this.NumeroPermisConduire = "";
                    break;
            }
        }

        updateCommentRemainingLength() {
            this.CommentRemainingLength = this.CommentMaxLength - (this.Commentaire || "").length;
        }
    }
}