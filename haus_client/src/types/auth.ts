export enum AccessLevel {
    Internal = 0,
    Privileged = 1,
    External = 2,
    Forbidden = 3,
}

export type User = {
    id: string;
    username: string;
    display_name: string | null;
    user_icon: string | null;
    scopes: (string | "root")[];
};

export type Session = {
    id: string;
    expire_at: string;
    user_id: string | null;
};

export type AuthenticationContext = {
    time: string;
    source: string;
    session: Session;
    access: AccessLevel;
};
