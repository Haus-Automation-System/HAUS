import { createBrowserRouter } from "react-router-dom";
import { LayoutView } from "./views/Layout/Layout";
import { Greeter } from "./views/Greeter/Greeter";
import { ServerSettings } from "./views/ServerSettings/ServerSettingsLayout";

export const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <LayoutView />,
        children: [
            {
                path: "settings",
                element: <ServerSettings />,
                children: [
                    {
                        path: "server",
                        element: <>server</>,
                    },
                    {
                        path: "users",
                        element: <>users</>,
                    },
                    {
                        path: "plugins",
                        element: <>plugins</>,
                    },
                ],
            },
        ],
    },
    {
        path: "/logged-out",
        element: <Greeter />,
    },
]);
