import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { icons } from '../../config/icons';
import { format } from 'date-fns';
import LanguageSwitcher from './LanguageSwitcher';

const IconButton = ({ title, onClick, disabled, children, className }) => {
    const disabledClasses = disabled ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-700';
    return (
        <div className="relative group flex items-center">
            <button 
                onClick={onClick} 
                disabled={disabled} 
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-md shadow transition-colors ${disabledClasses} ${className}`}
            >
                {children}
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {title}
            </div>
        </div>
    );
};

export default function Header() {
    const { t } = useTranslation();
    const { projectData, estimatedEndDate, plannedEndDate, projectStatus, setProjectModal, openActivityModal } = useApp();

    const isProjectLoaded = !!projectData;
    const isEditable = isProjectLoaded && projectData.editavel;

    const statusColors = { /* ... */ }; // Sua lógica de cores aqui

    const renderResponsaveis = () => { /* ... */ };

    const displayStartDate = isProjectLoaded ? (projectData.data_hora_inicio_real || projectData.data_hora_inicio) : null;
    const startDateLabel = isProjectLoaded && projectData.data_hora_inicio_real ? t('header.realStart') : t('header.start');

    return (
        <header className="bg-white shadow-md p-3 flex justify-between items-center z-10">
            <div 
                className={`flex items-center gap-4 p-2 rounded-md ${isProjectLoaded ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'} transition-colors`}
                onClick={() => isProjectLoaded && setProjectModal({ isOpen: true, isCreating: false })}
            >
                {/* ... Lógica do Título e Detalhes do Projeto ... */}
            </div>
            {isProjectLoaded && (
                <div className="flex items-center gap-6">
                    {/* ... Lógica das Datas e Status ... */}
                </div>
            )}
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <IconButton title={t('buttons.newProject')} onClick={() => setProjectModal({ isOpen: true, isCreating: true })} className="bg-yellow-500 hover:bg-yellow-600">
                    {icons.newProject} <span>{t('buttons.newProject')}</span>
                </IconButton>
                <IconButton title={t('buttons.newActivity')} onClick={() => openActivityModal()} disabled={!isEditable} className="bg-blue-600 hover:bg-blue-700">
                    {icons.newActivity} <span>{t('buttons.newActivity')}</span>
                </IconButton>
                {/* ... outros botões ... */}
            </div>
        </header>
    );
}