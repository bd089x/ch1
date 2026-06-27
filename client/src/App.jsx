import { Routes, Route } from "react-router-dom";
import LoadingOverlay from "./components/LoadingOverlayComponent";

import Home from "./pages/HomePage";
import Editor from "./pages/EditorPage";
import Settings from "./pages/SettingsPage";
import Reset from "./pages/ResetPage";
import WorkspaceCreate from "./pages/WorkspaceCreatePage";
import WorkspaceDelete from "./pages/WorkspaceDeletePage";
import WorkspaceUpdate from "./pages/WorkspaceUpdatePage";

export default function App() {
    return (
        <div className="min-h-screen bg-black text-white">

            <LoadingOverlay />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/workspace/create"
                    element={<WorkspaceCreate />}
                />

                <Route
                    path="/workspace/update/:id"
                    element={<WorkspaceUpdate />}
                />

                <Route
                    path="/workspace/delete/:id"
                    element={<WorkspaceDelete />}
                />

                {/* Empty workspace */}
                <Route
                    path="/editor"
                    element={<Editor />}
                />

                {/* Workspace filtered by one or more tags */}
                <Route
                    path="/editor/:tags"
                    element={<Editor />}
                />

                <Route
                    path="/settings"
                    element={<Settings />}
                />

                <Route
                    path="/reset"
                    element={<Reset />}
                />

            </Routes>

        </div>
    );
}