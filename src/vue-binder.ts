namespace Vue {
    export interface Keys {
        model: string;
        show: string;
    }

    export interface Options {
        keys?: Keys;
        listener?: (propName: string, propValue: any) => void;
        modelExtensionFactory?: () => any;
        root?: string;
    }

    const defaultOptions: Options = {
        keys: {
            model: "vue-model",
            show: "vue-show"
        },
        listener: (propName: string, propValue: any) => {},
        modelExtensionFactory: () => ({}),
        root: "body"
    };

    export class Binder {
        private model: any = {};
        private options: Options;

        constructor(options: Options) {
            this.options = $.extend(true, defaultOptions, options);

            $(this.options.root).on("change input", this.fieldsSelector, event => {
                const $field = $(event.currentTarget);
                this.readField($field, true);
            });

            this.refresh();
        }

        getModel() {
            const modelCopy = JSON.parse(JSON.stringify(this.model));
            return $.extend({}, this.options.modelExtensionFactory(), modelCopy);
        }

        private getSelector(key: string) {
            return `[data-${this.options.keys[key]}]`;
        }

        private get fieldsSelector() {
            return ["input", "select"]
                        .map(tag => `${tag}${this.getSelector("model")}`)
                        .join(", ");
        }

        private getFieldValueCore($field: JQuery) {
            switch ($field.prop("type")) {
                case "checkbox":
                    return $field.prop("checked");
                case "radio":
                    return $(`input[type='radio'][name='${$field.prop("name")}']${this.getSelector("model")}:checked`).val();
                case "number":
                    return parseFloat($field.val());
            }
            return $field.val();
        }

        private getFieldValue($field: JQuery) {
            let propValue = this.getFieldValueCore($field);
            if (propValue === undefined) {
                return null;
            }
            if ($field.is("input[type='radio'], select") &&
                typeof propValue === "string" &&
                propValue.match(/^(true|false)$/i)) {
                return JSON.parse(propValue.toLowerCase());
            }
            return propValue;
        }

        private readField($field: JQuery, withRefreshShow: boolean) {
            const propName = $field.data(this.options.keys.model) as string
                          || $field.prop("name");
            const propValue = this.getFieldValue($field);
            if (this.updateModelProperty(propName, propValue)) {
                this.options.listener(propName, propValue);
                if (withRefreshShow) {
                    this.refreshShow();
                }
            }
        }

        refresh() {
            $(this.options.root).find(this.fieldsSelector).each((_, elem) => {
                this.readField($(elem), false);
            });
            this.refreshShow();
        }

        private refreshShow() {
            $(this.options.root).find(this.getSelector("show")).each((_, elem) => {
                const $element = $(elem);
                const expression = $element.data(this.options.keys.show) as string;
                const model = this.getModel();
                const shown = eval(expression);
                $element.toggle(shown);
            });
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

            const hasChanged = parent[propName] !== propValue;
            if (hasChanged) {
                parent[propName] = propValue;
            }
            return hasChanged;
        }
    }
}