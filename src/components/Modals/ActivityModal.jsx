import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function ActivityModal({ isOpen, onClose, activity, onSave, isReadOnly }) {
    const { projectData, tiposAtividade } = useApp();
    const [formData, setFormData] = useState({});
    const fileInputRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        const defaultData = {
            id: Date.now(),
            nome: '',
            tempo_execucao_horas: 8,
            dependencia: [],
            status: t('status.pending'),
            tipo_id: 1,
            descricao: '',
            anexos: [],
            comentarios: [],
            newComment: ''
        };
        setFormData(activity ? { ...defaultData, ...activity } : defaultData);
    }, [activity, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'tipo_id' || name === 'tempo_execucao_horas') {
            finalValue = parseInt(value, 10);
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleMultiSelectChange = (e) => {
        const { name } = e.target;
        const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setFormData(prev => ({...prev, [name]: values}));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const newAnexo = {
                nome: file.name,
                tipo: file.type,
                data: e.target.result
            };
            setFormData(prev => ({
                ...prev,
                anexos: [...(prev.anexos || []), newAnexo]
            }));
        };
        reader.readAsDataURL(file);
        event.target.value = null;
    };

    const removeAnexo = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            anexos: prev.anexos.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!formData.nome) {
            alert(t('errors.activityNameRequired'));
            return;
        }
        onSave(formData);
        onClose();
    };
    
    const handleAddComment = () => {
        if (formData.newComment.trim() === '') return;
        setFormData(prev => ({
            ...prev,
            comentarios: [...prev.comentarios, prev.newComment],
            newComment: ''
        }));
    };

    const handleRemoveComment = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            comentarios: prev.comentarios.filter((_, index) => index !== indexToRemove)
        }));
    };

    const otherActivities = projectData?.atividades.filter(a => a.id !== formData.id) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-[90vh] max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{isReadOnly ? t('modals.activityDetailsTitle') : (activity ? t('modals.activityEditTitle') : t('modals.activityNewTitle'))}</h2>
                <form onSubmit={handleSubmit}>
                    <fieldset disabled={isReadOnly} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">{t('modals.activityName')}</label>
                                <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 disabled:bg-gray-200" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('modals.duration')}</label>
                                <input type="number" name="tempo_execucao_horas" value={formData.tempo_execucao_horas || 1} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" min="1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status || t('status.pending')} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200">
                                    <option>{t('status.pending')}</option>
                                    <option>{t('status.inProgress')}</option>
                                    <option>{t('status.completed')}</option>
                                    <option>{t('status.completedWithErrors')}</option>
                                    <option>{t('status.interrupted')}</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">{t('modals.type')}</label>
                                <select name="tipo_id" value={formData.tipo_id || 1} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200">
                                    {tiposAtividade.map(tipo => <option key={tipo.id} value={tipo.id}>{t(tipo.nameKey)}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">{t('modals.dependencies')}</label>
                                <select multiple name="dependencia" value={formData.dependencia || []} onChange={handleMultiSelectChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24 disabled:bg-gray-200">
                                    {otherActivities.map(act => <option key={act.id} value={act.id}>{act.nome}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">{t('modals.description')}</label>
                                <textarea name="descricao" value={formData.descricao || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" rows="2"></textarea>
                            </div>
                        </div>
                        <div className="md:col-span-2 border-t pt-4">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">{t('modals.attachments')}</h3>
                            <div className="space-y-2">
                                {formData.anexos && formData.anexos.map((anexo, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                        <a href={anexo.data} download={anexo.nome} className="text-blue-600 hover:underline truncate pr-4">
                                            {anexo.nome}
                                        </a>
                                        {!isReadOnly && (
                                            <button type="button" onClick={() => removeAnexo(index)} className="text-red-500 hover:text-red-700 font-bold">
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {!isReadOnly && (
                                <>
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="mt-2 px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                        {t('modals.addAttachments')}
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                </>
                            )}
                        </div>
                        <div className="md:col-span-2 border-t pt-4">
                            {!isReadOnly && (
                                <div className="md:col-span-2">
                                    <textarea 
                                        name="newComment"
                                        value={formData.newComment || ''}
                                        onChange={handleChange} 
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" rows="2">
                                    </textarea>
                                    <button
                                        type="button"
                                        onClick={handleAddComment}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    >
                                        {t('modals.addComment')}
                                    </button>
                                </div>
                            )}

                            <h3 className="text-lg font-medium text-gray-800 mb-2">{t('modals.comments')}</h3>
                            <div className="space-y-2">
                                {formData.comentarios && formData.comentarios.map((comentario, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                        <span className="truncate pr-4">{comentario}</span>
                                        {!isReadOnly && (
                                            <button type="button" onClick={() => handleRemoveComment(index)} className="text-red-500 hover:text-red-700 font-bold">
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </fieldset>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('buttons.close')}</button>
                        {!isReadOnly && <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('buttons.save')}</button>}
                    </div>
                </form>
            </div>
        </div>
    );
}