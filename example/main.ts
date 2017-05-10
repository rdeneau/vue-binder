/// <reference path="../src/vue-binder.ts" />
/// <reference path="personne.ts" />

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