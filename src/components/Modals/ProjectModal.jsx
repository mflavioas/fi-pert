import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function ProjectModal({ isOpen, onClose, onSave, isCreating }) {
    const { projectData } = useApp();
    const [formData, setFormData] = useState({});
    const { t } = useTranslation();
    const isLocked = !isCreating && projectData && !projectData.editavel;

    useEffect(() => {
        let initialFormData = {};
        if (isCreating) {
            const date = new Date();
            const localDateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            initialFormData = {
                nome_projeto: t('buttons.newProject'),
                os: '',
                data_hora_inicio: localDateString,
                responsaveis: [],
                editavel: true
            };
        } else if (projectData) {
            const date = new Date(projectData.data_hora_inicio);
            const localDateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            initialFormData = {
                nome_projeto: projectData.nome_projeto,
                os: projectData.os,
                data_hora_inicio: localDateString,
                responsaveis: projectData.responsaveis || [],
                editavel: projectData.editavel !== false
            };
        }
        setFormData(initialFormData);
    }, [projectData, isOpen, isCreating]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleResponsavelChange = (index, field, value) => {
        const updatedResponsaveis = [...formData.responsaveis];
        updatedResponsaveis[index][field] = value;
        setFormData(prev => ({ ...prev, responsaveis: updatedResponsaveis }));
    };

    const addResponsavel = () => {
        setFormData(prev => ({ ...prev, responsaveis: [...prev.responsaveis, { id: Date.now(), nome: '', telefone: '' }] }));
    };

    const removeResponsavel = (index) => {
        const updatedResponsaveis = formData.responsaveis.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, responsaveis: updatedResponsaveis }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const utcDate = new Date(formData.data_hora_inicio).toISOString();
        onSave({ ...formData, data_hora_inicio: utcDate }, isCreating);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{isCreating ? [t('modals.projectNewTitle')] : [t('modals.projectEditTitle')]}</h2>
                <form onSubmit={handleSubmit}>
                    <fieldset disabled={isLocked}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('modals.projectName')}</label>
                                <input type="text" name="nome_projeto" value={formData.nome_projeto || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('header.os')}</label>
                                <input type="text" name="os" value={formData.os || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('modals.startDateTime')}</label>
                                <input type="datetime-local" name="data_hora_inicio" value={formData.data_hora_inicio || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" />
                            </div>
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-800 mb-2">{t('modals.responsibles')}</h3>
                                {formData.responsaveis && formData.responsaveis.map((resp, index) => (
                                    <div key={resp.id || index} className="flex items-center gap-2 mb-2">
                                        <input type="text" placeholder={t('modals.namePlaceholder')} value={resp.nome || ''} onChange={(e) => handleResponsavelChange(index, t('modals.activityName'), e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" />
                                        <input type="text" placeholder={t('modals.phonePlaceholder')} value={resp.telefone || ''} onChange={(e) => handleResponsavelChange(index, t('modals.phonePlaceholder'), e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" />
                                        <button type="button" onClick={() => removeResponsavel(index)} disabled={isLocked} className={`px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 ${isLocked && 'btn-disabled'}`}>-</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addResponsavel} disabled={isLocked} className={`mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${isLocked && 'btn-disabled'}`}>{t('buttons.addResponsible')}</button>
                            </div>
                            <div className="border-t pt-4">
                                <label className="flex items-center">
                                    <input type="checkbox" name="editavel" checked={formData.editavel || false} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded disabled:bg-gray-200" />
                                    <span className="ml-2 text-sm text-gray-800">{t('modals.isEditable')}</span>
                                </label>
                            </div>
                        </div>
                    </fieldset>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('buttons.close')}</button>
                        {!isLocked && <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('buttons.save')}</button>}
                    </div>
                </form>
            </div>
        </div>
    );
}