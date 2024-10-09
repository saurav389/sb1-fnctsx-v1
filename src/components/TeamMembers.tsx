import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useForm } from 'react-hook-form';
import { Users, Trash2, Edit, X } from 'lucide-react';
import TeamMemberDetails from './TeamMemberDetails';
import ChangePassword from './ChangePassword';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: string;
  phoneNumber: string;
  position: string;
  joiningDate: string;
  bio: string;
}

const roles = ['admin', 'developer', 'designer', 'manager', 'tester'];

const TeamMembers: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<TeamMember & { password: string }>();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const querySnapshot = await getDocs(collection(db, 'teamMembers'));
    const memberList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
    setTeamMembers(memberList);
  };

  const onSubmit = async (data: TeamMember & { password: string }) => {
    try {
      if (editingMember) {
        await updateDoc(doc(db, 'teamMembers', editingMember.id), data);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await addDoc(collection(db, 'teamMembers'), {
          ...data,
          userId: userCredential.user.uid,
        });
      }
      reset();
      setShowAddMember(false);
      setEditingMember(null);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error adding/updating team member:', error);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teamMembers', id));
      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const editMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowAddMember(true);
    setValue('name', member.name);
    setValue('email', member.email);
    setValue('role', member.role);
    setValue('skills', member.skills);
    setValue('phoneNumber', member.phoneNumber);
    setValue('position', member.position);
    setValue('joiningDate', member.joiningDate);
    setValue('bio', member.bio);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Team Members</h1>
          <button
            onClick={() => { setShowAddMember(true); setEditingMember(null); reset(); }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Team Member
          </button>
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <Users className="w-full h-full rounded-full" />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 whitespace-no-wrap">{member.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{member.email}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{member.role}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button onClick={() => editMember(member)} className="text-blue-600 hover:text-blue-900 mr-2">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => deleteMember(member.id)} className="text-red-600 hover:text-red-900 mr-2">
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => { setSelectedMember(member); setShowMemberDetails(true); }} className="text-green-600 hover:text-green-900 mr-2">
                        View Details
                      </button>
                      <button onClick={() => { setSelectedMember(member); setShowChangePassword(true); }} className="text-purple-600 hover:text-purple-900">
                        Change Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h3>
                <button onClick={() => { setShowAddMember(false); setEditingMember(null); reset(); }} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                {!editingMember && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      {...register('password')}
                      type="password"
                      id="password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    {...register('role')}
                    id="role"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
                  <input
                    {...register('skills')}
                    type="text"
                    id="skills"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    id="phoneNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    {...register('position')}
                    type="text"
                    id="position"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700">Joining Date</label>
                  <input
                    {...register('joiningDate')}
                    type="date"
                    id="joiningDate"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    {...register('bio')}
                    id="bio"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingMember ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMemberDetails && selectedMember && (
        <TeamMemberDetails
          memberId={selectedMember.id}
          onClose={() => { setShowMemberDetails(false); setSelectedMember(null); }}
        />
      )}

      {showChangePassword && selectedMember && (
        <ChangePassword
          userId={selectedMember.id}
          isAdmin={true}
          onClose={() => { setShowChangePassword(false); setSelectedMember(null); }}
        />
      )}
    </>
  );
};

export default TeamMembers;