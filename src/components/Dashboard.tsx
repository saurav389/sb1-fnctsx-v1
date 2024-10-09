import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Briefcase, CheckSquare, Users, IndianRupee } from 'lucide-react';

interface Project {
  id: string;
  projectName: string;
  clientId: string;
  finalPrice: number;
}

interface Client {
  id: string;
  clientName: string;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchTeamMembers();
    fetchCompletedTasks();
    fetchTotalEarnings();
  }, []);

  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projectList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    setProjects(projectList);
  };

  const fetchClients = async () => {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    const clientList = querySnapshot.docs.map(doc => ({ id: doc.id, clientName: doc.data().clientName } as Client));
    setClients(clientList);
  };

  const fetchTeamMembers = async () => {
    const querySnapshot = await getDocs(collection(db, 'teamMembers'));
    setTeamMembers(querySnapshot.size);
  };

  const fetchCompletedTasks = async () => {
    const q = query(collection(db, 'tasks'), where('status', '==', 'completed'));
    const querySnapshot = await getDocs(q);
    setCompletedTasks(querySnapshot.size);
  };

  const fetchTotalEarnings = async () => {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const total = querySnapshot.docs.reduce((sum, doc) => sum + (doc.data().finalPrice || 0), 0);
    setTotalEarnings(total);
  };

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <Briefcase className="h-10 w-10 text-blue-500 mr-4" />
          <div>
            <p className="text-sm text-gray-600">Total Projects</p>
            <p className="text-2xl font-bold">{projects.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <CheckSquare className="h-10 w-10 text-green-500 mr-4" />
          <div>
            <p className="text-sm text-gray-600">Completed Tasks</p>
            <p className="text-2xl font-bold">{completedTasks}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <Users className="h-10 w-10 text-purple-500 mr-4" />
          <div>
            <p className="text-sm text-gray-600">Team Members</p>
            <p className="text-2xl font-bold">{teamMembers}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <IndianRupee className="h-10 w-10 text-yellow-500 mr-4" />
          <div>
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.projectName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clients.find(client => client.id === project.clientId)?.clientName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{project.finalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;