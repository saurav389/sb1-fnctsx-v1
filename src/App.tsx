import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TeamMembers from './components/TeamMembers';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Payments from './components/Payments';
import TeamMemberDashboard from './components/TeamMemberDashboard';
import YourTasks from './components/YourTasks';
import PaymentHistory from './components/PaymentHistory';

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/team-members" element={<TeamMembers />} />
    <Route path="/clients" element={<Clients />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/tasks" element={<Tasks />} />
    <Route path="/payments" element={<Payments />} />
  </Routes>
);

const TeamMemberRoutes = () => (
  <Routes>
    <Route path="/" element={<TeamMemberDashboard />} />
    <Route path="/your-tasks" element={<YourTasks />} />
    <Route path="/payment-history" element={<PaymentHistory />} />
  </Routes>
);

const AppRoutes = () => {
  const { currentUser, isAdmin } = useAuth();

  console.log("AppRoutes - currentUser:", currentUser?.email, "isAdmin:", isAdmin);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      {isAdmin ? <AdminRoutes /> : <TeamMemberRoutes />}
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AppRoutes />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;