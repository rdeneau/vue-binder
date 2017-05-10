/// <reference path="../src/vue-binder.ts" />

namespace App {
    export let vm: Vue.Binder;

    namespace Logger {
        const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
            hour12: false,
            hour  : "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        function getCurrentTime() {
            const now = new Date();
            const hms = dateFormatter.format(now);
            const ms  = (now.getMilliseconds() / 1000).toPrecision(3).substr(2, 3);
            return `${hms}.${ms}`;
        }

        export function logChanges(propName: string, propValue: any) {
            const prop: any = {};
            prop[propName] = propValue;
            const time = new Date().toLocaleTimeString("fr-FR", )
            $("#changes").append($(`<li><code>[${getCurrentTime()}] ${JSON.stringify(prop, null, 2)}</code></li>`));
        }

        export function logModel() {
            if (vm) {
                $("#model").text(JSON.stringify(vm.modelCopy, null, 2));
            }
        }
    }

    class Personne {
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

        get IsAdherentNonRenseigne() {
            return this.IsAdherent === true &&
                ( !this.NumeroAdherent
                || this.TypePersonne === null );
        }

        get ShowPersonne() {
            return this.IsAdherent === false
                || !this.IsAdherentNonRenseigne;
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

    const model = new Personne();
    const handlers = {
        IsAdherent: (value: boolean | null) => {
            $("#blocSaisiePersonne")
                .find("input, select, input-group-btn")
                .prop("disabled", value !== false);
            if (value) {
                model.NumeroAdherent = "";
            }
        },
        NumeroAdherent: (value: string | null) => {
            model.searchByNumeroAdherent(value);
        }
    };

    $(() => {
        vm = new Vue.Binder({
            root: ".container",
            listener: (propName: string, propValue: any) => {
                Logger.logModel();
                Logger.logChanges(propName, propValue);

                const handler = handlers[propName];
                if (handler) {
                    handler(propValue);
                }
            },
            model: model
        });
        Logger.logModel();
    });
}