import { DisplayData } from "./common";

interface ActionField {
    key: string;
    display: DisplayData;
    advanced?: boolean;
    default?: any;
    required?: boolean;
    example?: any;
}

export interface StringActionField extends ActionField {
    type: "string";
}

export interface NumberActionField extends ActionField {
    type: "number";
    decimals?: boolean;
    min?: number;
    max?: number;
    unit?: string;
}

export interface BooleanActionField extends ActionField {
    type: "boolean";
}

export interface SelectionActionField extends ActionField {
    type: "selection";
    options: { value: string; label: string; disabled?: boolean }[];
    multi?: boolean;
}

export interface DateActionField extends ActionField {
    type: "date";
    min?: string;
    max?: string;
}

export interface TimeActionField extends ActionField {
    type: "time";
    min?: string;
    max?: string;
}

export interface DateTimeActionField extends ActionField {
    type: "datetime";
    min?: string;
    max?: string;
}

export interface ColorActionField extends ActionField {
    type: "color";
    alpha?: boolean;
}

export interface EntitySelectorActionField extends ActionField {
    type: "entity";
    prefix?: string[];
}

export interface JSONActionField extends ActionField {
    type: "json";
}

export type ActionFieldType =
    | StringActionField
    | NumberActionField
    | BooleanActionField
    | SelectionActionField
    | DateActionField
    | TimeActionField
    | DateTimeActionField
    | ColorActionField
    | EntitySelectorActionField
    | JSONActionField;

export type EntityAction = {
    id: string;
    plugin: string;
    display: DisplayData;
    target_types?: string[];
    fields: { [key: string]: ActionFieldType };
};
