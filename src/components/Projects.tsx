import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { useForm } from 'react-hook-form';
import { Folder, Trash2, FileText, Edit } from 'lucide-react';

interface Project {
  id: string;
  projectId: string;
  projectName: string;
  description: string;
  clientId: string;
  quotation: number;
  finalPrice: number;
  requirementDocUrl: string;
  clientDocUrl: string;
  requirementDocName?: string;
  clientDocName?: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<{ id: string; clientName: string }[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm<Project>();
  const storage = getStorage();

  const requirementDoc = watch('requirementDocUrl');
  const clientDoc = watch('clientDocUrl');

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projectList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    setProjects(projectList);
  };

  const fetchClients = async () => {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    const clientList = querySnapshot.docs.map(doc => ({ id: doc.id, clientName: doc.data().clientName }));
    setClients(clientList);
  };

  const onSubmit = async (data: Project) => {
    try {
      if (editingProject) {
        // Update existing project
        const projectRef = doc(db, 'projects', editingProject.id);
        const updateData: Partial<Project> = {
          projectName: data.projectName,
          description: data.description || '',
          clientId: data.clientId,
          quotation: data.quotation,
          finalPrice: data.finalPrice,
        };

        // Handle file uploads if new files are selected
        if (data.requirementDocUrl instanceof FileList && data.requirementDocUrl.length > 0) {
          const file = data.requirementDocUrl[0];
          const storageRef = ref(storage, `project_docs/${editingProject.projectId}_requirement`);
          await uploadBytes(storageRef, file);
          const newUrl = await getDownloadURL(storageRef);
          updateData.requirementDocUrl = newUrl;
          updateData.requirementDocName = file.name;
        }

        if (data.clientDocUrl instanceof FileList && data.clientDocUrl.length > 0) {
          const file = data.clientDocUrl[0];
          const storageRef = ref(storage, `project_docs/${editingProject.projectId}_client`);
          await uploadBytes(storageRef, file);
          const newUrl = await getDownloadURL(storageRef);
          updateData.clientDocUrl = newUrl;
          updateData.clientDocName = file.name;
        }

        await updateDoc(projectRef, updateData);
        setEditingProject(null);
      } else {
        // Add new project
        const projectId = `PRJ-${Date.now()}`;
        const newProject: Project = {
          projectId,
          projectName: data.projectName,
          description: data.description || '',
          clientId: data.clientId,
          quotation: data.quotation,
          finalPrice: data.finalPrice,
          requirementDocUrl: '',
          clientDocUrl: '',
        };

        // Upload requirement document
        if (data.requirementDocUrl instanceof FileList && data.requirementDocUrl.length > 0) {
          const file = data.requirementDocUrl[0];
          const storageRef = ref(storage, `project_docs/${projectId}_requirement`);
          await uploadBytes(storageRef, file);
          newProject.requirementDocUrl = await getDownloadURL(storageRef);
          newProject.requirementDocName = file.name;
        }

        // Upload client document
        if (data.clientDocUrl instanceof FileList && data.clientDocUrl.length > 0) {
          const file = data.clientDocUrl[0];
          const storageRef = ref(storage, `project_docs/${projectId}_client`);
          await uploadBytes(storageRef, file);
          newProject.clientDocUrl = await getDownloadURL(storageRef);
          newProject.clientDocName = file.name;
        }

        // Add project to Firestore
        await addDoc(collection(db, 'projects'), newProject);
      }

      reset();
      fetchProjects();
    } catch (error) {
      console.error('Error adding/updating project:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while adding/updating the project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const editProject = (project: Project) => {
    setEditingProject(project);
    setValue('projectName', project.projectName);
    setValue('description', project.description);
    setValue('clientId', project.clientId);
    setValue('quotation', project.quotation);
    setValue('finalPrice', project.finalPrice);
    // Don't set file input values, as they can't be programmatically set for security reasons
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input {...register('projectName')} placeholder="Project Name" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          <textarea {...register('description')} placeholder="Description" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3} />
          <select {...register('clientId')} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.clientName}</option>
            ))}
          </select>
          <input {...register('quotation', { valueAsNumber: true })} placeholder="Quotation" type="number" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          <input {...register('finalPrice', { valueAsNumber: true })} placeholder="Final Price" type="number" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          <div>
            <input {...register('requirementDocUrl')} type="file" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            {requirementDoc instanceof FileList && requirementDoc.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">Selected: {requirementDoc[0].name}</p>
            )}
          </div>
          <div>
            <input {...register('clientDocUrl')} type="file" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            {clientDoc instanceof FileList && clientDoc.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">Selected: {clientDoc[0].name}</p>
            )}
          </div>
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          {editingProject ? 'Update Project' : 'Add Project'}
        </button>
        {editingProject && (
          <button type="button" onClick={() => { setEditingProject(null); reset(); }} className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cancel Edit
          </button>
        )}
      </form>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-bold mb-4">Project List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Final Price</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Documents</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{project.projectId}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <Folder className="w-full h-full rounded-full" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap">{project.projectName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{clients.find(c => c.id === project.clientId)?.clientName}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">${project.finalPrice}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex flex-col space-y-1">
                      {project.requirementDocUrl && (
                        <a href={project.requirementDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          <span className="text-xs">{project.requirementDocName || 'Requirement Doc'}</span>
                        </a>
                      )}
                      {project.clientDocUrl && (
                        <a href={project.clientDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          <span className="text-xs">{project.clientDocName || 'Client Doc'}</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button onClick={() => editProject(project)} className="text-blue-600 hover:text-blue-900 mr-2">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => deleteProject(project.id)} className="text-red-600 hover:text-red-900">
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

export default Projects;