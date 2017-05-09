declare namespace Vue {
    interface Keys {
        model: string;
        show: string;
    }
    interface Options {
        keys?: Keys;
        listener?: (propName: string, propValue: any) => void;
        modelExtensionFactory?: () => any;
        root?: string;
    }
    class Binder {
        private model;
        private options;
        constructor(options: Options);
        getModel(): any;
        private getSelector(key);
        private readonly fieldsSelector;
        private getFieldValueCore($field);
        private getFieldValue($field);
        private readField($field, withRefreshShow);
        refresh(): void;
        private refreshShow();
        private updateModelProperty(propName, propValue);
    }
}
