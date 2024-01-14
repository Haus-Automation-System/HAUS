import { DisplayData } from "./common";

interface EntityProperty {
    id: string;
    display: DisplayData;
    value?: any;
    type: string;
}

export interface StringEntityProperty extends EntityProperty {
    type: "string";
    value: string;
}

export interface NumberEntityProperty extends EntityProperty {
    type: "number";
    value: number;
}

export interface BooleanEntityProperty extends EntityProperty {
    type: "boolean";
    value: boolean;
}

export interface ListEntityProperty extends EntityProperty {
    type: "list";
    value: any[];
}

export interface TableEntityProperty extends EntityProperty {
    type: "table";
    columns: { key: string; value_type: string }[];
    value: { [key: string]: any }[];
}

export interface DateEntityProperty extends EntityProperty {
    type: "date";
    value: string;
}

export interface ColorEntityProperty extends EntityProperty {
    type: "color";
    hasAlpha?: boolean;
    value: string;
}

export type EntityPropertyType =
    | StringEntityProperty
    | NumberEntityProperty
    | BooleanEntityProperty
    | ListEntityProperty
    | TableEntityProperty
    | DateEntityProperty
    | ColorEntityProperty;

export type Entity = {
    id: string;
    plugin: string;
    type: string;
    display: DisplayData;
    properties: { [key: string]: EntityPropertyType };
};
