var App;
(function (App) {
    var DateUtils;
    (function (DateUtils) {
        var dateFormat = "";
        var hasLocale = false;
        function getDateConverter() {
            initLocale();
            return {
                parse: function (expression) {
                    return expression && expression.length === dateFormat.length
                        ? moment(expression, dateFormat).toDate()
                        : null;
                },
                format: function (value) {
                    return value ? moment(value).format(dateFormat) : "";
                }
            };
        }
        DateUtils.getDateConverter = getDateConverter;
        function initDatePicker(selector) {
            initLocale();
            $(selector).datetimepicker({
                format: dateFormat,
                allowInputToggle: true,
                showClear: true,
                showClose: true,
                showTodayButton: true,
                icons: {
                    time: "fa fa-clock-o",
                    date: "fa fa-calendar",
                    up: "fa fa-arrow-up",
                    down: "fa fa-arrow-down",
                    previous: "fa fa-arrow-left",
                    next: "fa fa-arrow-right",
                    today: "fa fa-crosshairs",
                    clear: "fa fa-trash-o",
                    close: "fa fa-close"
                },
                tooltips: {
                    today: "Aujourd’hui",
                    clear: "Effacer la date",
                    close: "Fermer la popin",
                    selectMonth: "Choisir le mois",
                    prevMonth: "Mois précédent",
                    nextMonth: "Mois suivant",
                    selectYear: "Choisir l’année",
                    prevYear: "Année précédente",
                    nextYear: "Année suivante",
                    selectDecade: "Choisir la décade",
                    prevDecade: "Décade précédente",
                    nextDecade: "Décade suivante",
                    prevCentury: "Siècle précédent",
                    nextCentury: "Siècle suivant"
                }
            });
        }
        DateUtils.initDatePicker = initDatePicker;
        function initLocale() {
            if (hasLocale) {
                return;
            }
            moment.locale("fr");
            hasLocale = true;
            dateFormat = moment.localeData().longDateFormat("L");
        }
    })(DateUtils = App.DateUtils || (App.DateUtils = {}));
})(App || (App = {}));
//# sourceMappingURL=datepicker.js.map