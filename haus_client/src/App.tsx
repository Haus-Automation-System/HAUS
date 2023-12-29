import { RouterProvider } from "react-router-dom";
import "./styles/index.scss";
import { MantineProvider } from "@mantine/core";
import { AppRouter } from "./routes";

function App() {
    return (
        <MantineProvider defaultColorScheme="dark">
            <div className="app">
                <RouterProvider router={AppRouter} />
            </div>
        </MantineProvider>
    );
}

export default App;
