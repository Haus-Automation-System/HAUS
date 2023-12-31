import { useContext, useMemo } from "react";
import { ApiContext, ApiContextType } from "./types";
import { buildApiMethods } from "./methods";
import { AuthenticationContext, Session, User } from "../../types/auth";
import { isArray } from "lodash";

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

export function hasScope(
    user: User,
    scope: string,
    reverse?: boolean
): boolean {
    if (user.scopes.includes("root")) {
        return true;
    }
    if (reverse) {
        for (const uscope of user.scopes) {
            let scopeCheck: string = uscope.slice();

            while (scopeCheck.length > 0) {
                if (scopeCheck === scope) {
                    return true;
                }

                scopeCheck = scopeCheck.split(".").slice(0, -1).join(".");
            }
        }
        return false;
    } else {
        let scopeCheck: string = scope.slice();

        while (scopeCheck.length > 0) {
            if (user.scopes.includes(scopeCheck)) {
                return true;
            }

            scopeCheck = scopeCheck.split(".").slice(0, -1).join(".");
        }

        return false;
    }
}

export function hasScopes(
    user: User,
    scopes: string[],
    all?: boolean,
    reverse?: boolean
): boolean {
    if (user.scopes.includes("root")) {
        return true;
    }
    if (all) {
        return scopes.every((s) => hasScope(user, s, reverse));
    } else {
        return scopes.some((s) => hasScope(user, s, reverse));
    }
}

export function useScoped(
    scope: string | string[],
    options?: { all?: boolean; reversed?: boolean }
): boolean {
    const api = useApiContext();

    return useMemo(() => {
        if (!api.user) {
            return false;
        }

        return hasScopes(
            api.user,
            isArray(scope) ? scope : [scope],
            options?.all,
            options?.reversed
        );
    }, [scope, api.user?.scopes, options?.all, options?.reversed]);
}
