import { useContext } from "react";
import { ApiContext, ApiContextType } from "./types";
import { buildApiMethods } from "./methods";
import { AuthenticationContext, Session, User } from "../../types/auth";

export { ApiProvider } from "./provider";

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
