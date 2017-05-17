/// <reference path="datepicker.ts" />

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

        export function clearLogs() {
            $("#changes").empty();
        }

        export function logChanges(propName: string, propValue: any) {
            const prop: any = {};
            prop[propName] = propValue;
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
        Commentaire: () => {
            model.updateCommentRemainingLength();
        },
        IsAdherent: (value: boolean | null) => {
            $("#blocSaisiePersonne")
                .find("input, input-group-btn, select")
                .prop("disabled", value !== false);
            if (value) {
                handlers.NumeroAdherent(model.NumeroAdherent);
            }
        },
        NumeroAdherent: (value: string) => {
            model.searchByNumeroAdherent(value);
        }
    };

    $(() => {
        DateUtils.initDatePicker(".container .input-group.date");

        vm = new Vue.Binder({
            model: model,
            root: ".container",
            listener: (propName: string, propValue: any) => {
                Logger.logModel();
                Logger.logChanges(propName, propValue);

                const handler = handlers[propName];
                if (handler) {
                    handler(propValue);
                }
            },
            converters: $.extend(true, {},
                Vue.localeConverters.fr,
                { date: DateUtils.getDateConverter() }
            )
        });
        Logger.logModel();

        $("#btnClearLogs").click(() => { Logger.clearLogs(); });
        $("#Commentaire").attr("maxlength", model.CommentMaxLength);
    });
}