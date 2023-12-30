import { createContext } from "react";
import { AuthenticationContext, Session, User } from "../../types/auth";
import { buildApiMethods } from "./methods";

export type ApiResponse<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          status: number;
          code: string | null;
          description: string | null;
      };

export type ApiResponseError = {
    isApiError: true;
    httpStatus: number;
    code: string | null;
    description: string | null;
};

export function isApiError(obj: any): obj is ApiResponseError {
    return Boolean(obj.isApiError);
}

export function extractResponse<T>(
    response: ApiResponse<T>
): T | ApiResponseError {
    if (response.success) {
        return response.data;
    } else {
        return {
            isApiError: true,
            httpStatus: response.status,
            code: response.code,
            description: response.description,
        };
    }
}

export type ApiRequestFunction = <T>(
    path: string,
    options?:
        | {
              method?: "GET" | "DELETE";
              params?: { [key: string]: string };
          }
        | {
              method: "POST" | "PUT";
              params?: { [key: string]: string };
              body?: any;
          }
) => Promise<ApiResponse<T>>;

export type ApiContextType = {
    user: User | null;
    session: Session | null;
    authenticationContext: AuthenticationContext | null;
    request: ApiRequestFunction;
    methods: ReturnType<typeof buildApiMethods>;
};

export const ApiContext = createContext<ApiContextType>(null as any);
