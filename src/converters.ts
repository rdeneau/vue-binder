namespace Vue {
    export interface Converter<T> {
        parse: (expression: string) => T;
        format: (value: T) => string;
    }

    export interface Converters {
        boolean?: Converter<boolean>;
        date   ?: Converter<Date>;
        number ?: Converter<number>;
    }

    const defaultEnglishConverters: Converters = {
        boolean: {
            parse: expression => {
                return expression.match(/^(true|false)$/i)
                                ? JSON.parse(expression.toLowerCase())
                                : null;
            },
            format: value => {
                return typeof value === "boolean" ? value.toString() : "";
            }
        },
        date: {
            parse: expression => {
                let ms = Date.parse(expression);
                if (Number.isNaN(ms)) {
                    return null;
                }
                const result = new Date(ms);
                ms -= 60*1000 * result.getTimezoneOffset();
                return new Date(ms); // UTC date @ 00:00
            },
            format: value => {
                return value ? value.toDateString() : "";
            }
        },
        number: {
            parse: expression => {
                const result = parseFloat(expression);
                return Number.isNaN(result) ? null : result;
            },
            format: value => {
                return value || value === 0 ? value.toString() : "";
            }
        }
    };

    const defaultFrenchConverters: Converters = {
        boolean: defaultEnglishConverters.boolean,
        date: {
            parse: expression => {
                let ms: number = NaN;
                const match = expression.match(/^(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.]((?:19|20)\d\d)$/); // "dd/MM/yyyy"
                if (match) {
                    const utcExpression = `${match[3]}-${match[2]}-${match[1]}T00:00:00.000Z`;
                    ms = Date.parse(utcExpression);
                }
                return Number.isNaN(ms) ? null : new Date(ms);
            },
            format: value => {
                return value ? value.toLocaleDateString() : "";
            }
        },
        number: {
            parse: expression => {
                expression = expression.replace(",", ".").replace(" ", "");
                const result = parseFloat(expression);
                return Number.isNaN(result) ? null : result;
            },
            format: value => {
                return value || value === 0 ? value.toLocaleString("fr", { style: "decimal", useGrouping: false }) : "";
            }
        }
    };

    export const localeConverters = {
        en: defaultEnglishConverters,
        fr: defaultFrenchConverters
    };
}