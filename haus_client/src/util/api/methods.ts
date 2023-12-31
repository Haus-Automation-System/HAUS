import { AuthenticationContext, Session, User } from "../../types/auth";
import { Plugin, RedactedPlugin } from "../../types/plugin";
import {
    ApiRequestFunction,
    ApiResponseError,
    extractResponse,
    isApiError,
} from "./types";

export type ApiData = {
    session: Session | null;
    user: User | null;
    authenticationContext: AuthenticationContext | null;
};

export function buildApiMethods(
    request: ApiRequestFunction,
    apiData: ApiData,
    setApiData: (
        statePartial:
            | Partial<ApiData>
            | ((currentState: ApiData) => Partial<ApiData>)
    ) => void
) {
    async function getApiContext(): Promise<ApiData> {
        const result = await request<AuthenticationContext>("/");
        const data = extractResponse(result);
        if (isApiError(data)) {
            setApiData({
                session: null,
                user: null,
                authenticationContext: null,
            });
            return { session: null, user: null, authenticationContext: null };
        } else {
            let user: User | null;
            if (data.session.user_id) {
                const userResult = await request<User>("/users/self");
                const userData = extractResponse(userResult);
                user = isApiError(userData) ? null : userData;
            } else {
                user = null;
            }
            setApiData({
                session: data.session,
                user,
                authenticationContext: data,
            });
            return { session: data.session, user, authenticationContext: data };
        }
    }

    return {
        getApiContext,
        users: {
            auth: {
                login: async (
                    username: string,
                    password: string
                ): Promise<User | ApiResponseError> => {
                    const result = await request<User>("/users/auth/login", {
                        method: "POST",
                        body: { username, password },
                    });
                    const data = extractResponse(result);
                    if (!isApiError(data)) {
                        await getApiContext();
                    }
                    return data;
                },
            },
            self: {
                data: async (): Promise<User | ApiResponseError> => {
                    const result = await request<User>("/users/self");
                    return extractResponse(result);
                },
                logout: async (): Promise<void> => {
                    await request<null>("/users/self/logout", {
                        method: "POST",
                    });
                    await getApiContext();
                },
            },
        },
        plugins: {
            list: {
                detailed: async (): Promise<Plugin[] | ApiResponseError> => {
                    const result = await request<Plugin[]>("/plugins/detailed");
                    return extractResponse(result);
                },
                basic: async (): Promise<
                    RedactedPlugin[] | ApiResponseError
                > => {
                    const result = await request<RedactedPlugin[]>("/plugins/");
                    return extractResponse(result);
                },
            },
            info: {
                detailed: async (
                    id: string
                ): Promise<Plugin | ApiResponseError> => {
                    const result = await request<Plugin>(
                        `/plugins/${id}/detailed`
                    );
                    return extractResponse(result);
                },
                basic: async (
                    id: string
                ): Promise<RedactedPlugin | ApiResponseError> => {
                    const result = await request<RedactedPlugin>(
                        `/plugins/${id}`
                    );
                    return extractResponse(result);
                },
            },
        },
    };
}
