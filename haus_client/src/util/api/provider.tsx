import { useSetState } from "@mantine/hooks";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ApiData, buildApiMethods } from "./methods";
import { ApiContext, ApiRequestFunction, ApiResponse } from "./types";

export function ApiProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const [apiState, setApiState] = useSetState<ApiData>({
        session: null,
        user: null,
        authenticationContext: null,
    });
    const request: ApiRequestFunction = useCallback(async function <T>(
        path: string,
        options?:
            | {
                  method?: "GET" | "DELETE";
                  params?: { [key: string]: string };
                  body?: undefined;
              }
            | {
                  method: "POST" | "PUT";
                  params?: { [key: string]: string };
                  body?: any;
              }
    ): Promise<ApiResponse<T>> {
        const params = options?.params
            ? "?" + new URLSearchParams(options.params).toString()
            : "";
        const result = await fetch(
            `/api${path.startsWith("/") ? "" : "/"}${path}${params}`,
            {
                method: options?.method ?? "GET",
                body: options?.body ? JSON.stringify(options.body) : undefined,
            }
        );

        if (result.ok) {
            if (result.status === 204) {
                return {
                    success: true,
                    data: null as any,
                };
            } else {
                const data = await result.text();
                try {
                    return {
                        success: true,
                        data: JSON.parse(data),
                    };
                } catch {
                    return {
                        success: true,
                        data: data as any,
                    };
                }
            }
        } else {
            const data = await result.text();
            try {
                return {
                    success: false,
                    status: result.status,
                    code: JSON.parse(data).extra?.error_code ?? null,
                    description: JSON.parse(data).detail ?? null,
                };
            } catch {
                return {
                    success: false,
                    status: result.status,
                    code: "errors.server.unspecified",
                    description: null,
                };
            }
        }
    }, []);

    const methods = useMemo(
        () => buildApiMethods(request, apiState, setApiState),
        [request, apiState, setApiState]
    );

    useEffect(() => {
        methods.getApiContext();
    }, [apiState.session?.id]);

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (apiState.user && apiState.session) {
            setSocket(
                new WebSocket(
                    `wss://${location.host}/api/events/${apiState.session.id}`
                )
            );

            return () => {
                if (socket) {
                    socket.close();
                    setSocket(null);
                }
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [apiState.user?.id, apiState.session?.id]);

    return (
        <ApiContext.Provider
            value={{
                request,
                methods,
                ...apiState,
                socket,
            }}
        >
            {children}
        </ApiContext.Provider>
    );
}
