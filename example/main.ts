/// <reference path="../src/vue-binder.ts" />

namespace App {
    let vm: Vue.Binder;

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
                $("#model").text(JSON.stringify(vm.getModel(), null, 2));
            }
        }
    }

    const adherentFieldsNames = [
        "TypePersonne",
        "Nom",
        "Age",
        "NumeroPermisConduire",
        "RaisonSociale",
        "FormeJuridique",
    ];

    const handlers = {
        Adherent: (isAdherent: boolean | null, adherent?: any) => {
            modelExtension.AdherentInconnu = isAdherent === true && !adherent;
            modelExtension.ShowPersonne    = isAdherent === false || !!adherent;

            const fieldsSelector = adherentFieldsNames.map(name => `[name='${name}']`).join(", ");
            $(`input, select`).filter(fieldsSelector).prop("disabled", false); // Débloque d'abord tous les champs pour déclencher les événements "change"

            if (adherent) {
                // Remplissage des informations de l'adhérent trouvé
                // N.B. En ASP.NET MVC, en encapsulant la recherche dans un formulaire Ajax, on pourrait renvoyer directement la vue partielle avec ces infos.
                adherentFieldsNames.forEach(name => {
                    const value = adherent[name];
                    const $field = $(`input[name='${name}']`);
                    if ($field.prop("type") === "radio") {
                        $field.filter(`[value='${value}']`).click();
                    } else {
                        $field.val(value);
                        $field.change();
                    }
                });
            }

            $(`input, select`).filter(fieldsSelector).prop("disabled", isAdherent === true);
        },
        IsAdherent: (value: boolean | null) => {
            handlers.Adherent(value);
        },
        NumeroAdherent: (value: any) => {
            // Simule la recherche d'un adhérent en base
            let adherent: any = null;
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

    const modelExtension = {
        AdherentInconnu: false,
        ShowPersonne: false
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
            modelExtensionFactory: () => modelExtension
        });
        Logger.logModel();
    });
}