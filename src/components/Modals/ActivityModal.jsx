import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function ActivityModal({ isOpen, onClose, activity, onSave, isReadOnly }) {
    const { projectData, tiposAtividade } = useApp();
    const [formData, setFormData] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        const defaultData = {
            id: Date.now(),
            nome: '',
            tempo_execucao_horas: 8,
            dependencia: [],
            status: 'Pendente',
            tipo_id: 1,
            descricao: '',
            onErrorGoTo: [],
            anexos: []
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
            alert('O nome da atividade é obrigatório.');
            return;
        }
        onSave(formData);
        onClose();
    };
    
    const otherActivities = projectData?.atividades.filter(a => a.id !== formData.id) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{isReadOnly ? "Detalhes da Atividade" : (activity ? 'Editar Atividade' : 'Nova Atividade')}</h2>
                <form onSubmit={handleSubmit}>
                    <fieldset disabled={isReadOnly} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Nome</label>
                                <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 disabled:bg-gray-200" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tempo (horas)</label>
                                <input type="number" name="tempo_execucao_horas" value={formData.tempo_execucao_horas || 1} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" min="1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status || 'Pendente'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200">
                                    <option>Pendente</option>
                                    <option>Em Andamento</option>
                                    <option>Concluído</option>
                                    <option>Concluído com erros</option>
                                    <option>Interrompido</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                <select name="tipo_id" value={formData.tipo_id || 1} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200">
                                    {tiposAtividade.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Dependências (Fluxo Normal)</label>
                                <select multiple name="dependencia" value={formData.dependencia || []} onChange={handleMultiSelectChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24 disabled:bg-gray-200">
                                    {otherActivities.map(act => <option key={act.id} value={act.id}>{act.nome}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Em Caso de Erro, Ir Para... (Fluxo de Contingência)</label>
                                <select multiple name="onErrorGoTo" value={formData.onErrorGoTo || []} onChange={handleMultiSelectChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24 disabled:bg-gray-200">
                                    {otherActivities.map(act => <option key={act.id} value={act.id}>{act.nome}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                <textarea name="descricao" value={formData.descricao || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-200" rows="2"></textarea>
                            </div>
                        </div>
                        <div className="md:col-span-2 border-t pt-4">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Anexos</h3>
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
                                        Adicionar Anexo
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                </>
                            )}
                        </div>
                    </fieldset>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Fechar</button>
                        {!isReadOnly && <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>}
                    </div>
                </form>
            </div>
        </div>
    );
}