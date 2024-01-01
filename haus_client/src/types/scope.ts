export type ScopeDefinition = {
    name: string;
    friendly_name: string;
    description: string;
    children: ApplicationScopes;
};

export type ApplicationScopes = { [key: string]: ScopeDefinition };
