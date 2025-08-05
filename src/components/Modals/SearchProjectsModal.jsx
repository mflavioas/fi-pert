import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import apiConfig from '../../config/apiConfig';

export default function SearchProjectsModal({ isOpen, onClose, onSelectProject }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        try {
            const response = await axios.get(`${apiConfig.baseURL}${apiConfig.endpoints.searchProjects}`, {
                params: { query: searchTerm },
                headers: apiConfig.headers,
            });
            setProjects(response.data);
            setError(null);
        } catch (err) {
            setProjects([]);
            setError(t('modals.noProjectsFound'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-[90vh] max-h-[90vh] overflow-y-auto">
                <h2>{t('modals.searchProjectsTitle')}</h2>
                <div className="md:grid md:grid-cols-6 md:gap-6">
                    <div className="col-span-6 sm:col-span-3">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('modals.searchPlaceholder')}
                            className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2 bg-white-100 disabled:bg-gray-200" 
                        />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >{t('buttons.search')}
                        </button>
                    </div>
                </div>
                
                {error && <p>{error}</p>}

                {projects.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>{t('modals.projectId')}</th>
                                <th>{t('modals.projectOS')}</th>
                                <th>{t('modals.projectDescription')}</th>
                                <th>{t('modals.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td>{project.id}</td>
                                    <td>{project.os}</td>
                                    <td>{project.description}</td>
                                    <td>
                                        <button onClick={() => onSelectProject(project.id)}>
                                            {t('buttons.openProject')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    !error && <p>{t('modals.noProjectsFound')}</p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            {t('buttons.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
