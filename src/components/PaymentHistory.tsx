import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Payment {
  id: string;
  amount: number;
  date: string;
  taskId: string;
  taskName: string;
}

const PaymentHistory: React.FC = () => {
  const [user] = useAuthState(auth);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;

    try {
      const teamMemberQuery = query(collection(db, 'teamMembers'), where('userId', '==', user.uid));
      const teamMemberSnapshot = await getDocs(teamMemberQuery);
      
      if (teamMemberSnapshot.empty) {
        console.error('Team member not found');
        return;
      }

      const teamMemberId = teamMemberSnapshot.docs[0].id;

      const paymentsQuery = query(
        collection(db, 'payments'),
        where('recipientId', '==', teamMemberId),
        where('type', '==', 'paid')
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentList = await Promise.all(paymentsSnapshot.docs.map(async (paymentDoc) => {
        const paymentData = paymentDoc.data();
        let taskName = 'N/A';
        if (paymentData.taskId) {
          const taskDocRef = doc(db, 'tasks', paymentData.taskId);
          const taskDocSnap = await getDoc(taskDocRef);
          if (taskDocSnap.exists()) {
            taskName = taskDocSnap.data().taskName;
          }
        }
        return {
          id: paymentDoc.id,
          amount: paymentData.amount,
          date: paymentData.date,
          taskId: paymentData.taskId,
          taskName: taskName,
        } as Payment;
      }));
      setPayments(paymentList);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Payment History</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{payment.date}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{payment.taskName}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">₹{payment.amount}</p>
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

export default PaymentHistory;