import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Task {
  id: string;
  taskName: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  projectId: string;
  rate: number;
}

interface Project {
  id: string;
  projectName: string;
}

interface TeamMemberAnalyticsProps {
  memberId: string;
}

const TeamMemberAnalytics: React.FC<TeamMemberAnalyticsProps> = ({ memberId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    project: '',
    status: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [memberId]);

  const fetchTasks = async () => {
    const q = query(collection(db, 'tasks'), where('assignedTo', '==', memberId));
    const querySnapshot = await getDocs(q);
    const taskList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    setTasks(taskList);
  };

  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projectList = querySnapshot.docs.map(doc => ({ id: doc.id, projectName: doc.data().projectName } as Project));
    setProjects(projectList);
  };

  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.id); // Assuming task.id is a timestamp
    return (
      (!filter.month || taskDate.getMonth() + 1 === parseInt(filter.month)) &&
      (!filter.year || taskDate.getFullYear() === parseInt(filter.year)) &&
      (!filter.project || task.projectId === filter.project) &&
      (!filter.status || task.status === filter.status)
    );
  });

  const taskStats = {
    total: filteredTasks.length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
  };

  const totalEarned = filteredTasks.reduce((sum, task) => sum + (task.status === 'completed' ? task.rate : 0), 0);

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Team Member Analytics</h3>
      
      <div className="mb-4 grid grid-cols-2 gap-4">
        <select
          value={filter.month}
          onChange={(e) => setFilter({ ...filter, month: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <select
          value={filter.year}
          onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All Years</option>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          value={filter.project}
          onChange={(e) => setFilter({ ...filter, project: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.projectName}</option>
          ))}
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-semibold">Total Tasks</h4>
          <p>{taskStats.total}</p>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-semibold">In Progress</h4>
          <p>{taskStats.inProgress}</p>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-semibold">Completed</h4>
          <p>{taskStats.completed}</p>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <h4 className="font-semibold">Pending</h4>
          <p>{taskStats.pending}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h4 className="font-semibold mb-2">Summary</h4>
        <p>Total Earned: ${totalEarned}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Task List</h4>
        <ul>
          {filteredTasks.map(task => (
            <li key={task.id} className="mb-2">
              <span className="font-medium">{task.taskName}</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                task.status === 'completed' ? 'bg-green-200 text-green-800' :
                task.status === 'in-progress' ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                {task.status}
              </span>
              <span className="ml-2">Rate: ${task.rate}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeamMemberAnalytics;