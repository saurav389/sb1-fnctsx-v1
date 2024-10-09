import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Task {
  id: string;
  taskName: string;
  description: string;
  status: 'attended' | 'pending' | 'in-progress' | 'completed';
  rate: number;
  parentTaskId?: string;
}

interface Payment {
  id: string;
  amount: number;
  recipientId: string;
  type: 'paid' | 'received';
}

interface TaskSummary {
  totalAttended: number;
  totalPending: number;
  totalInProgress: number;
  totalCompleted: number;
  totalEarned: number;
  totalMoneyReceived: number;
  totalBalanceAmount: number;
}

interface TeamMemberDetailsProps {
  memberId: string;
  onClose: () => void;
}

const TeamMemberDetails: React.FC<TeamMemberDetailsProps> = ({ memberId, onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [taskSummary, setTaskSummary] = useState<TaskSummary>({
    totalAttended: 0,
    totalPending: 0,
    totalInProgress: 0,
    totalCompleted: 0,
    totalEarned: 0,
    totalMoneyReceived: 0,
    totalBalanceAmount: 0,
  });

  useEffect(() => {
    fetchTasks();
    fetchPayments();
  }, [memberId]);

  const fetchTasks = async () => {
    try {
      const q = query(collection(db, 'tasks'), where('assignedTo', '==', memberId));
      const querySnapshot = await getDocs(q);
      const taskList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);
      calculateTaskSummary(taskList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const q = query(collection(db, 'payments'), where('recipientId', '==', memberId), where('type', '==', 'paid'));
      const querySnapshot = await getDocs(q);
      const paymentList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      setPayments(paymentList);
      updateTaskSummaryWithPayments(paymentList);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const calculateTaskSummary = (tasks: Task[]) => {
    const summary: TaskSummary = {
      totalAttended: tasks.filter(t => t.status === 'attended').length,
      totalPending: tasks.filter(t => t.status === 'pending').length,
      totalInProgress: tasks.filter(t => t.status === 'in-progress').length,
      totalCompleted: tasks.filter(t => t.status === 'completed').length,
      totalEarned: tasks.reduce((sum, task) => task.status === 'completed' ? sum + task.rate : sum, 0),
      totalMoneyReceived: 0,
      totalBalanceAmount: 0,
    };
    setTaskSummary(summary);
  };

  const updateTaskSummaryWithPayments = (payments: Payment[]) => {
    const totalMoneyReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
    setTaskSummary(prevSummary => ({
      ...prevSummary,
      totalMoneyReceived,
      totalBalanceAmount: prevSummary.totalEarned - totalMoneyReceived,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="team-member-modal">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3">
          <h3 className="text-xl font-bold">Team Member Details</h3>
          <button onClick={onClose} className="text-black close-modal">&times;</button>
        </div>
        <div className="mt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800">Total Attended</h4>
              <p className="text-2xl font-bold text-blue-600">{taskSummary.totalAttended}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-800">Total Pending</h4>
              <p className="text-2xl font-bold text-yellow-600">{taskSummary.totalPending}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-800">Total In Progress</h4>
              <p className="text-2xl font-bold text-orange-600">{taskSummary.totalInProgress}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800">Total Completed</h4>
              <p className="text-2xl font-bold text-green-600">{taskSummary.totalCompleted}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-800">Total Earned</h4>
              <p className="text-2xl font-bold text-purple-600">₹{taskSummary.totalEarned}</p>
            </div>
            <div className="bg-indigo-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-indigo-800">Total Money Received</h4>
              <p className="text-2xl font-bold text-indigo-600">₹{taskSummary.totalMoneyReceived}</p>
            </div>
            <div className="bg-pink-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-pink-800">Total Balance Amount</h4>
              <p className="text-2xl font-bold text-pink-600">₹{taskSummary.totalBalanceAmount}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{task.taskName}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{task.description}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">₹{task.rate}</p>
                    </td>
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

export default TeamMemberDetails;