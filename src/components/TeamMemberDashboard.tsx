import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface TaskSummary {
  totalAttended: number;
  totalPending: number;
  totalInProgress: number;
  totalCompleted: number;
  totalEarned: number;
  totalMoneyReceived: number;
  totalBalanceAmount: number;
}

const TeamMemberDashboard: React.FC = () => {
  const [user] = useAuthState(auth);
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
    if (user) {
      fetchTaskSummary();
    }
  }, [user]);

  const fetchTaskSummary = async () => {
    if (!user) return;

    const teamMemberQuery = query(collection(db, 'teamMembers'), where('userId', '==', user.uid));
    const teamMemberSnapshot = await getDocs(teamMemberQuery);
    
    if (teamMemberSnapshot.empty) {
      console.error('Team member not found');
      return;
    }

    const teamMemberId = teamMemberSnapshot.docs[0].id;
    const tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', teamMemberId));
    const tasksSnapshot = await getDocs(tasksQuery);
    
    const paymentsQuery = query(collection(db, 'payments'), where('recipientId', '==', teamMemberId), where('type', '==', 'paid'));
    const paymentsSnapshot = await getDocs(paymentsQuery);

    const summary = tasksSnapshot.docs.reduce((acc, doc) => {
      const task = doc.data();
      acc.totalAttended += task.status === 'attended' ? 1 : 0;
      acc.totalPending += task.status === 'pending' ? 1 : 0;
      acc.totalInProgress += task.status === 'in-progress' ? 1 : 0;
      acc.totalCompleted += task.status === 'completed' ? 1 : 0;
      acc.totalEarned += task.status === 'completed' ? task.rate : 0;
      return acc;
    }, {
      totalAttended: 0,
      totalPending: 0,
      totalInProgress: 0,
      totalCompleted: 0,
      totalEarned: 0,
    });

    const totalMoneyReceived = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

    setTaskSummary({
      ...summary,
      totalMoneyReceived,
      totalBalanceAmount: summary.totalEarned - totalMoneyReceived,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Team Member Dashboard</h1>

      {/* Summary Cards */}
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
    </div>
  );
};

export default TeamMemberDashboard;