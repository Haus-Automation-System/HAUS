import { createBrowserRouter } from "react-router-dom";
import { LayoutView } from "./views/Layout/Layout";
import { Greeter } from "./views/Greeter/Greeter";

export const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <LayoutView />,
        children: [],
    },
    {
        path: "/logged-out",
        element: <Greeter />,
    },
]);
