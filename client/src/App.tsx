import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./pages/Root";
import AuthPage from "./pages/AuthPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: "/login",
                element: <AuthPage />,
            },
            {
                path: "/signup",
                element: <AuthPage />,
            },
        ],
    },
]);
const App = () => <RouterProvider router={router} />;

export default App;
