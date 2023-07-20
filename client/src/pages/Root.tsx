import { Outlet } from "react-router-dom";

const Root: React.FC = () => {
    return (
        <main>
            <Outlet />
        </main>
    );
};

export default Root;
