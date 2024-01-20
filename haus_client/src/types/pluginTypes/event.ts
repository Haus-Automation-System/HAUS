import { Entity } from "./entity";

export type PluginReportedEvent = {
    id: string;
    types: string[];
    data: any;
    targets: string[];
    new_state?: Entity;
};
