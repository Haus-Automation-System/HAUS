import { useCallback, useContext, useEffect, useMemo } from "react";
import { ApiContext, ApiContextType, ApiEvent } from "./types";
import { buildApiMethods } from "./methods";
import { AuthenticationContext, Session, User } from "../../types/auth";
import { camelCase, isMatch, reduce } from "lodash";

export { ApiProvider } from "./provider";
export { isApiError } from "./types";

export function useApiContext(): ApiContextType {
    const apiContext: ApiContextType | null = useContext(ApiContext);
    return (
        apiContext ?? {
            user: null,
            session: null,
            authenticationContext: null,
            request: async () => ({
                success: false,
                status: 0,
                code: null,
                description: null,
            }),
            methods: buildApiMethods(
                async () => ({
                    success: false,
                    status: 0,
                    code: null,
                    description: null,
                }),
                { user: null, session: null, authenticationContext: null },
                () => {}
            ),
        }
    );
}

export function useUser(): User | null {
    return useApiContext().user;
}

export function useSession(): Session | null {
    return useApiContext().session;
}

export function useAuthenticationContext(): AuthenticationContext | null {
    return useApiContext().authenticationContext;
}

export function useApi(): ApiContextType["methods"] {
    return useApiContext().methods;
}

export function hasScope(user: User, scope: string): boolean {
    if (user.scopes.includes("root")) {
        return true;
    }

    let check = scope.slice();
    while (check.length > 0) {
        if (user.scopes.includes(check)) {
            return true;
        }

        check = check.split(".").slice(0, -1).join(".");
    }

    return false;
}

export function withinScope(user: User, scope: string): boolean {
    if (user.scopes.includes("root")) {
        return true;
    }

    return user.scopes.some((s) => s.startsWith(scope));
}

export function useScoped(
    scopes: string[],
    options?: {
        mode?: "hasScope" | "withinScope";
        all?: boolean;
    }
): boolean {
    const api = useApiContext();

    return useMemo(() => {
        if (!api.user) {
            return false;
        }

        if (api.user.scopes.includes("root")) {
            return true;
        }

        if (options?.all) {
            return scopes.every((s) =>
                options?.mode === "withinScope"
                    ? withinScope(api.user as User, s)
                    : hasScope(api.user as User, s)
            );
        } else {
            return scopes.some((s) =>
                options?.mode === "withinScope"
                    ? withinScope(api.user as User, s)
                    : hasScope(api.user as User, s)
            );
        }
    }, [scopes, options?.mode, options?.all, api.user?.id, api.user?.scopes]);
}

export function useMultiScoped(
    scopes: {
        scope: string;
        mode?: "hasScope" | "withinScope";
        alias?: string;
    }[]
): { [key: string]: boolean } {
    const api = useApiContext();

    return useMemo(() => {
        return reduce(
            scopes,
            (prev, current) => {
                if (!api.user) {
                    return {
                        ...prev,
                        [current.alias ?? camelCase(current.scope)]: false,
                    };
                }

                if (api.user.scopes.includes("root")) {
                    return {
                        ...prev,
                        [current.alias ?? camelCase(current.scope)]: true,
                    };
                }

                if (current.mode === "withinScope") {
                    return {
                        ...prev,
                        [current.alias ?? camelCase(current.scope)]:
                            withinScope(api.user, current.scope),
                    };
                } else {
                    return {
                        ...prev,
                        [current.alias ?? camelCase(current.scope)]: hasScope(
                            api.user,
                            current.scope
                        ),
                    };
                }
            },
            {}
        );
    }, [api.user?.scopes, scopes]);
}

export function useEvent<T extends object>(
    event: string,
    handler: (event: ApiEvent<T>) => void,
    filter?: object
) {
    const { socket } = useApiContext();

    const socketAvailable = useMemo(() => socket !== null, [socket]);

    const handleEvent = useCallback(
        (ev: MessageEvent) => {
            try {
                const evData: ApiEvent<T> = JSON.parse(ev.data);
                if (
                    evData.code === event &&
                    (!filter || isMatch(evData.data, filter))
                ) {
                    handler(evData);
                }
            } catch {}
        },
        [event, handler]
    );

    useEffect(() => {
        if (socketAvailable && socket) {
            socket.addEventListener("message", handleEvent);
            return () => socket.removeEventListener("message", handleEvent);
        }
    }, [socketAvailable]);
}
