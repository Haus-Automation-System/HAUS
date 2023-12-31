import { useContext, useMemo } from "react";
import { ApiContext, ApiContextType } from "./types";
import { buildApiMethods } from "./methods";
import { AuthenticationContext, Session, User } from "../../types/auth";

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
