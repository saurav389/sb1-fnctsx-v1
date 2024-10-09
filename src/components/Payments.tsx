import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useForm } from 'react-hook-form';
import { IndianRupee , Trash2, PlusCircle, MinusCircle } from 'lucide-react';

interface Payment {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  description: string;
  type: 'received' | 'paid';
  recipientId?: string;
  taskId?: string;
}

interface Project {
  id: string;
  projectName: string;
}

interface TeamMember {
  id: string;
  name: string;
}

interface Task {
  id: string;
  taskName: string;
  projectId: string;
  assignedTo: string;
  rate: number;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<Payment>();

  useEffect(() => {
    fetchPayments();
    fetchProjects();
    fetchTeamMembers();
    fetchTasks();
  }, []);

  const fetchPayments = async () => {
    const querySnapshot = await getDocs(collection(db, 'payments'));
    const paymentList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
    setPayments(paymentList);
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

  const fetchTasks = async () => {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    const taskList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    setTasks(taskList);
  };

  const onSubmit = async (data: Payment) => {
    try {
      await addDoc(collection(db, 'payments'), data);
      reset();
      fetchPayments();
      setShowReceiveModal(false);
      setShowPayModal(false);
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'payments', id));
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const PaymentModal: React.FC<{ isReceive: boolean }> = ({ isReceive }) => {
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const selectedTeamMember = watch('recipientId');
    const selectedTask = watch('taskId');

    useEffect(() => {
      if (selectedTeamMember) {
        fetchCompletedTasks(selectedTeamMember);
      } else {
        setCompletedTasks([]);
      }
    }, [selectedTeamMember]);

    useEffect(() => {
      if (selectedTask) {
        const task = completedTasks.find(t => t.id === selectedTask);
        if (task) {
          setValue('amount', task.rate);
          setValue('projectId', task.projectId);
        }
      }
    }, [selectedTask, completedTasks]);

    const fetchCompletedTasks = async (teamMemberId: string) => {
      const q = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', teamMemberId),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(q);
      const taskList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setCompletedTasks(taskList);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isReceive ? 'Receive Payment' : 'Make Payment'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-2 text-left">
              <input type="hidden" {...register('type')} value={isReceive ? 'received' : 'paid'} />
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectId">
                  Project
                </label>
                <select
                  {...register('projectId')}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.projectName}</option>
                  ))}
                </select>
              </div>
              {!isReceive && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipientId">
                      Team Member
                    </label>
                    <select
                      {...register('recipientId')}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select Team Member</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taskId">
                      Completed Task
                    </label>
                    <select
                      {...register('taskId')}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select Task</option>
                      {completedTasks.map(task => (
                        <option key={task.id} value={task.id}>{task.taskName}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                  Amount
                </label>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  Date
                </label>
                <input
                  {...register('date')}
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => isReceive ? setShowReceiveModal(false) : setShowPayModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      
      <div className="mb-4">
        <button
          onClick={() => setShowReceiveModal(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          <PlusCircle className="inline-block mr-2" />
          Receive Payment
        </button>
        <button
          onClick={() => setShowPayModal(true)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          <MinusCircle className="inline-block mr-2" />
          Make Payment
        </button>
      </div>

      {showReceiveModal && <PaymentModal isReceive={true} />}
      {showPayModal && <PaymentModal isReceive={false} />}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-bold mb-4">Payment List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      payment.type === 'received' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        payment.type === 'received' ? 'bg-green-200' : 'bg-red-200'
                      }`}></span>
                      <span className="relative">{payment.type === 'received' ? 'Received' : 'Paid'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{projects.find(p => p.id === payment.projectId)?.projectName}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-sm w-10 h-10">
                        <IndianRupee  className="w-full text-sm h-full rounded-full" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap">{payment.amount}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{payment.date}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{payment.description}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {payment.type === 'paid' ? teamMembers.find(m => m.id === payment.recipientId)?.name : 'N/A'}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {payment.taskId ? tasks.find(t => t.id === payment.taskId)?.taskName : 'N/A'}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button onClick={() => deletePayment(payment.id)} className="text-red-600 hover:text-red-900">
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

export default Payments;