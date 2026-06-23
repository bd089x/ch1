import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Settings from "./pages/Settings";

export default function App() {
    return (
        <div className="min-h-screen bg-black text-white">

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/new"
                    element={<Editor />}
                />

                <Route
                    path="/note/:id"
                    element={<Editor />}
                />

                {/* Settings */}
                <Route
                    path="/settings"
                    element={<Settings />}
                />

            </Routes>

        </div>
    );
}