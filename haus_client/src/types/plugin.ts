export type PluginMetadata = {
    name: string;
    version: string;
    icon: string;
    display_name: string;
};

export type RedactedPlugin = {
    id: string;
    active: boolean;
    status: string | null;
    metadata: PluginMetadata;
};

interface BasePluginField {
    name: string;
    icon: string | null;
    required: boolean;
    placeholder: string;
}

export interface PluginStringField extends BasePluginField {
    type: "string";
    default: string;
}

export interface PluginNumberField extends BasePluginField {
    type: "number";
    default: number;
    min: number | null;
    max: number | null;
}

export interface PluginSwitchField extends BasePluginField {
    type: "switch";
    default: boolean;
}

export type PluginField =
    | PluginStringField
    | PluginNumberField
    | PluginSwitchField;

export type PluginDependency = {
    mode: "pypi";
    name: string;
    version: string;
    extras: string[];
};

export type Plugin = {
    id: string;
    active: boolean;
    status: string | null;
    manifest: {
        metadata: PluginMetadata;
        run: {
            module: string;
            entrypoint: string;
            dependencies: { [key: string]: PluginDependency };
        };
        settings: { [key: string]: PluginField };
    };
};
