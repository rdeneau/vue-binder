namespace Vue {
    export interface Keys {
        model: string;
        show: string;
    }

    export interface Options {
        converters?: Converters;
        keys?: Keys;
        typeSeparator?: string;
        listener?: (propName: string, propValue: any) => void;
        model: any;
        root?: string;
    }

    const defaultOptions: Options = {
        converters: localeConverters.en,
        keys: {
            model: "vue-model",
            show : "vue-show"
        },
        typeSeparator: ":",
        listener: () => {},
        model: {},
        root: "body"
    };

    class VueError extends Error {
        constructor(public element: HTMLElement, name: string, message: string) {
            super(message);
            this.name = `VueError:${name}`;
        }

        static createModelBindingNameMissing(element: HTMLElement) {
            return new VueError(element,
                                "ModelBinding:NameMissing",
                                "Missing name for the vue-model binding");
        }

        static createShowBindingInvalidExpression(element: HTMLElement, expression: string) {
            return new VueError(element,
                                "ShowBinding:InvalidExpression",
                                `Invalid expression '${expression}' in data-vue-show attribute: expecting boolean`);
        }
    }

    interface FieldData {
        name: string;
        type: string;
    }

    export class Binder {
        private model: any;
        private options: Options;

        constructor(options: Options) {
            this.options = $.extend(true, defaultOptions, options);
            this.model = this.options.model;

            $(this.options.root).on("change input", `${this.getSelector("model")}:input`, event => {
                const $field = $(event.currentTarget);
                this.readField($field, true);
            });

            this.refresh();
        }

        get modelCopy() {
            return $.extend(true, {}, this.model);
        }

        private getSelector(key: string, value?: string) {
            value = value ? `='${value}'` : "";
            return `[data-${this.options.keys[key]}${value}]`;
        }

        private getFieldConverter($field: JQuery): Converter<any> {
            const propType = this.getFieldData($field).type;
            return this.options.converters[propType] || {
                format: (value: any) => value as string,
                parse : (expression: string) => expression
            };
        }

        private getFieldData($field: JQuery): FieldData {
            let fieldData: FieldData = {
                name: $field.data(this.options.keys.model),
                type: null
            };
            if (fieldData.name && fieldData.name.indexOf(this.options.typeSeparator) >= 0) {
                const parts = fieldData.name.split(this.options.typeSeparator).concat([""]);
                fieldData = {
                    name: parts[0],
                    type: parts[1]
                };
            }
            return {
                name: fieldData.name || $field.prop("name") || $field.prop("id"),
                type: fieldData.type || $field.prop("type") || "string"
            };
        }

        private getFieldValueCore($field: JQuery) {
            if (!$field.is(":input")) {
                return $field.text();
            }
            switch ($field.prop("type")) {
                case "checkbox":
                    const value = $field.prop("checked");
                    return typeof value === "boolean" ? value : null;
                case "radio":
                    return $(`input[type='radio'][name='${$field.prop("name")}']${this.getSelector("model")}:checked`).val();
            }
            return $field.val();
        }

        private getFieldValue($field: JQuery) {
            const propValue = this.getFieldValueCore($field);
            if (propValue === undefined) {
                return null;
            }

            const converter = this.getFieldConverter($field);
            return converter.parse(propValue);
        }

        private readField($field: JQuery, withRefreshShow: boolean) {
            const propName = this.getFieldData($field).name;
            if (!propName) {
                throw VueError.createModelBindingNameMissing($field[0]);
            }

            const propValue = this.getFieldValue($field);
            if (!this.updateModelProperty(propName, propValue)) {
                return;
            }

            this.options.listener(propName, propValue);
            if (withRefreshShow) {
                this.refreshShow();
            }
        }

        refresh() {
            const $fields = $(this.options.root).find(this.getSelector("model"));
            $fields.each((_, elem) => {
                let $field = $(elem);
                if ($field.is(":radio")) {
                    // Traitement des boutons radio en groupe
                    // S'applique à celui qui est coché sinon au 1er du groupe
                    const name = $field.prop("name");
                    const $radios = $fields.filter(`[name='${name}']`);
                    // ReSharper disable once CssBrowserCompatibility
                    let $radio = $radios.filter(":checked");
                    if ($radio.length === 0) {
                        $radio = $radios.first();
                    }
                    if ($field.filter($radio).length === 0) {
                        return;
                    }
                    $field = $radios;
                }
                this.readField($field, false);
            });
            this.refreshShow();
        }

        private refreshShow() {
            $(this.options.root).find(this.getSelector("show")).each((_, elem) => {
                const $element = $(elem);
                const expression = $element.data(this.options.keys.show) as string;
                // ReSharper disable once UnusedLocals // `model` can be used in the expression
                const model = this.modelCopy;
                const shown = eval(expression);
                if (typeof shown !== "boolean" && typeof shown !== "undefined" && shown !== null) {
                    throw VueError.createShowBindingInvalidExpression($element[0], expression);
                }
                $element.toggle(shown);
            });
        }

        private setFieldValue(propName: string, propValue: any) {
            const $fields = $(this.options.root).find(this.getSelector("model"));
            const $field = $fields.filter(`${this.getSelector("model", propName)}, [name='${propName}'], [id='${propName}']`);
            if (propValue === this.getFieldValue($field)) {
                return;
            }

            switch ($field.prop("type")) {
                case "checkbox":
                    $field.prop("checked", !!propValue);
                    break;
                case "radio":
                    $field.filter(`[value='${propValue}']`)
                          .prop("checked", true);
                    break;
                default:
                    const converter = this.getFieldConverter($field);
                    const value = converter.format(propValue);
                    if ($field.is(":input")) {
                        $field.val(value);
                    } else {
                        $field.text(value);
                    }
            }

            this.options.listener(propName, propValue);
        }

        private updateModelProperty(propName: string, propValue: any) {
            // Handle nested property
            let parent: any = this.model;
            const names = propName.split(".");
            for (let i = 0; i < names.length - 1; i++) {
                let nextparent = parent[names[i]];
                if (typeof nextparent !== "object" || nextparent === null) {
                    nextparent = parent[names[i]] = {};
                }
                parent = nextparent;
            }
            propName = names[names.length - 1];

            // Transform bound property from vanilla to get/set
            const propInfo = Object.getOwnPropertyDescriptor(parent, propName);
            if (!propInfo || !propInfo.get) {
                delete parent[propName];
                Object.defineProperty(parent, propName, {
                    configurable: false,
                    enumerable: true,
                    get: () => propValue,
                    set: (val) => {
                        propValue = val;
                        this.setFieldValue(propName, propValue);
                    }
                });
                return true;
            }

            const hasChanged = parent[propName] !== propValue;
            if (hasChanged) {
                parent[propName] = propValue;
            }
            return hasChanged;
        }
    }
}