import { Navigate, Route, Routes } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { PlansPage } from "./pages/Plans";
import { SubscriptionsPage } from "./pages/Subscriptions";
import { InvoicesPage } from "./pages/Invoices";

export function App() {
  return (
    <div className="app-shell flex">
      <Sidebar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
        </Routes>
      </main>
    </div>
  );
}
