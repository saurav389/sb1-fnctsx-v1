import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase'; // Updated import path

export const updateUserPassword = async (userId: string, newPassword: string) => {
  const updatePasswordFunction = httpsCallable(functions, 'updateUserPassword');
  try {
    await updatePasswordFunction({ userId, newPassword });
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};