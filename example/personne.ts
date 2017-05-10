namespace App {
    export class Personne {
        IsAdherent          : boolean | null = null;
        NumeroAdherent      : string  | null = null;
        TypePersonne        : string  | null = null;
        Nom                 : string  | null = null;
        Age                 : number  | null = null;
        NumeroPermisConduire: string  | null = null;
        RaisonSociale       : string  | null = null;
        FormeJuridique      : string  | null = null;

        get IsAdherentInconnu() {
            return this.IsAdherent === true
                && this.NumeroAdherent.length > 0
                && this.TypePersonne === null;
        }

        get IsAdherentRenseigne() {
            return this.IsAdherent === true
                && this.TypePersonne !== null;
        }

        get ShowPersonne() {
            return this.IsAdherent === false
                || this.IsAdherentRenseigne;
        }

        searchByNumeroAdherent(numeroAdherent: string) {
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
        }
    }
}