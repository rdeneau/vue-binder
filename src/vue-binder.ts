namespace Vue {
    export interface Keys {
        model: string;
        show: string;
        type: string;
    }

    export interface Options {
        keys?: Keys;
        listener?: (propName: string, propValue: any) => void;
        model: any;
        root?: string;
    }

    const defaultOptions: Options = {
        keys: {
            model: "vue-model",
            show: "vue-show",
            type: "vue-type"
        },
        listener: (propName: string, propValue: any) => {},
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

    export class Binder {
        private model: any;
        private options: Options;

        constructor(options: Options) {
            this.options = $.extend(true, defaultOptions, options);
            this.model = this.options.model;

            $(this.options.root).on("change input", this.fieldsSelector, event => {
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

        private get fieldsSelector() {
            return ["input", "select"]
                        .map(tag => `${tag}${this.getSelector("model")}`)
                        .join(", ");
        }

        private getFieldValueCore($field: JQuery) {
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
            let propValue = this.getFieldValueCore($field);
            if (propValue === undefined) {
                return null;
            }

            // Conversion
            const type = $field.data(this.options.keys.type) || $field.prop("type");
            switch (type) {
                case "boolean":
                    return propValue.match(/^(true|false)$/i)
                            ? JSON.parse(propValue.toLowerCase())
                            : null;

                case "number":
                    propValue = parseFloat(propValue);
                    if (Number.isNaN(propValue)) {
                        return null;
                    }
                    break;
            }

            return propValue;
        }

        private readField($field: JQuery, withRefreshShow: boolean) {
            const propName = $field.data(this.options.keys.model) as string
                          || $field.prop("name")
                          || $field.prop("id");
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
            const $fields = $(this.options.root).find(this.fieldsSelector);
            $fields.each((_, elem) => {
                let $field = $(elem);
                if ($field.is(":radio")) {
                    // Traitement des boutons radio en groupe
                    // S'applique à celui qui est coché sinon au 1er du groupe
                    const name = $field.prop("name");
                    const $radios = $fields.filter(`[name='${name}']`);
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
                const model = this.modelCopy;
                const shown = eval(expression);
                if (typeof shown !== "boolean") {
                    throw VueError.createShowBindingInvalidExpression($element[0], expression);
                }
                $element.toggle(shown);
            });
        }

        private setFieldValue(propName: string, propValue: any) {
            const $fields = $(this.options.root).find(this.fieldsSelector);
            const $field = $fields.filter(`${this.getSelector("model", propName)}, [name='${propName}']`);
            if (propValue === this.getFieldValue($field)) {
                return;
            }
            switch ($field.prop("type")) {
                case "checkbox":
                    $field.prop("checked", true)
                          .change();
                    break;
                case "radio":
                    $field.filter(`[value='${propValue}']`)
                          .prop("checked", true)
                          .change();
                    break;
                default:
                    $field.val(propValue)
                          .change();
            }
        }

        private updateModelProperty(propName: string, propValue: any) {
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