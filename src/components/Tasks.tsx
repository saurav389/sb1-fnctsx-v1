import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useForm } from 'react-hook-form';
import { CheckSquare, Trash2, Edit } from 'lucide-react';

interface Task {
  id: string;
  projectId: string;
  taskName: string;
  description: string;
  assignedTo: string;
  rate: number;
  status: 'attended' | 'pending' | 'in-progress' | 'completed';
  parentTaskId?: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<{ id: string; projectName: string }[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<Task>();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const fetchTasks = async () => {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    const taskList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    setTasks(taskList);
  };

  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projectList = querySnapshot.docs.map(doc => ({ id: doc.id, projectName: doc.data().projectName }));
    setProjects(projectList);
  };

  const fetchTeamMembers = async () => {
    const querySnapshot = await getDocs(collection(db, 'teamMembers'));
    const memberList = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    setTeamMembers(memberList);
  };

  const onSubmit = async (data: Task) => {
    try {
      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), data);
        setEditingTask(null);
      } else {
        await addDoc(collection(db, 'tasks'), data);
      }
      reset();
      fetchTasks();
    } catch (error) {
      console.error('Error adding/updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setValue('projectId', task.projectId);
    setValue('taskName', task.taskName);
    setValue('description', task.description);
    setValue('assignedTo', task.assignedTo);
    setValue('rate', task.rate);
    setValue('status', task.status);
    setValue('parentTaskId', task.parentTaskId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <select {...register('projectId')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.projectName}</option>
            ))}
          </select>
          <input {...register('taskName')} placeholder="Task Name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          <textarea {...register('description')} placeholder="Description" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3} />
          <select {...register('assignedTo')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="">Assign To</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          <input {...register('rate', { valueAsNumber: true })} placeholder="Rate" type="number" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          <select {...register('status')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="attended">Attended</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select {...register('parentTaskId')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="">Parent Task (optional)</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.taskName}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
      </form>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-bold mb-4">Task List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Task Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <CheckSquare className="w-full h-full rounded-full" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap">{task.taskName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{projects.find(p => p.id === task.projectId)?.projectName}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{task.description}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{teamMembers.find(m => m.id === task.assignedTo)?.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">${task.rate}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      task.status === 'completed' ? 'text-green-900' :
                      task.status === 'in-progress' ? 'text-yellow-900' :
                      task.status === 'attended' ? 'text-blue-900' :
                      'text-red-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        task.status === 'completed' ? 'bg-green-200' :
                        task.status === 'in-progress' ? 'bg-yellow-200' :
                        task.status === 'attended' ? 'bg-blue-200' :
                        'bg-red-200'
                      }`}></span>
                      <span className="relative">{task.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button onClick={() => editTask(task)} className="text-blue-600 hover:text-blue-900 mr-2">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tasks;