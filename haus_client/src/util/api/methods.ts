import { AuthenticationContext, Session, User } from "../../types/auth";
import { Plugin, RedactedPlugin } from "../../types/plugin";
import { EntityAction } from "../../types/pluginTypes/action";
import { Entity } from "../../types/pluginTypes/entity";
import { ApplicationScopes } from "../../types/scope";
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
        scopes: async (): Promise<ApplicationScopes> => {
            const result = await request<ApplicationScopes>("/scopes");
            if (result.success) {
                return result.data;
            } else {
                return {};
            }
        },
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
            admin: {
                list: async (): Promise<User[] | ApiResponseError> => {
                    const result = await request<User[]>("/users");
                    return extractResponse(result);
                },
                create: async (
                    username: string,
                    password: string,
                    scopes: string[]
                ): Promise<User | ApiResponseError> => {
                    const result = await request<User>("/users/create", {
                        method: "POST",
                        body: { username, password, scopes },
                    });
                    return extractResponse(result);
                },
                setScopes: async (
                    userId: string,
                    scopes: string[]
                ): Promise<User | ApiResponseError> => {
                    const result = await request<User>(
                        `/users/${userId}/scopes`,
                        {
                            method: "POST",
                            body: scopes,
                        }
                    );
                    return extractResponse(result);
                },
                delete: async (
                    userId: string
                ): Promise<null | ApiResponseError> => {
                    const result = await request<null>(`/users/${userId}`, {
                        method: "DELETE",
                    });
                    return extractResponse(result);
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
            updateSettings: async (
                id: string,
                settings: { [key: string]: any }
            ): Promise<Plugin | ApiResponseError> => {
                const result = await request<Plugin>(
                    `/plugins/${id}/settings`,
                    { method: "POST", body: settings }
                );
                return extractResponse(result);
            },
            setActive: async (
                id: string,
                active: boolean
            ): Promise<Plugin | ApiResponseError> => {
                const result = await request<Plugin>(`/plugins/${id}/active`, {
                    method: "POST",
                    body: { active },
                });
                return extractResponse(result);
            },
            reload: async (id: string): Promise<Plugin | ApiResponseError> => {
                const result = await request<Plugin>(`/plugins/${id}/reload`, {
                    method: "POST",
                });
                return extractResponse(result);
            },
            getEntities: async (
                plugin: string
            ): Promise<Entity[] | ApiResponseError> => {
                const result = await request<Entity[]>(
                    `/plugins/${plugin}/entities`
                );
                return extractResponse(result);
            },
            getActions: async (
                plugin: string
            ): Promise<EntityAction[] | ApiResponseError> => {
                const result = await request<EntityAction[]>(
                    `/plugins/${plugin}/actions`
                );
                return extractResponse(result);
            },
        },
    };
}
