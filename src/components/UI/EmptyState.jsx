import React from 'react';
import { icons } from '../../config/icons';
import { useTranslation } from 'react-i18next';

export default function EmptyState({ onNewProject, onLoadProject }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col justify-center items-center h-full text-center text-gray-500">
            <div className="text-blue-600 mb-4">{icons.logo}</div>
            <h2 className="text-2xl font-bold text-gray-700">{t('emptyState.welcome')}</h2>
            <p className="mt-2 mb-6">{t('emptyState.noProject')}</p>
            <div className="flex gap-4">
                <button onClick={onNewProject} className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-lg text-lg">
                    {t('modals.projectNewTitle')}
                </button>
                <button onClick={onLoadProject} className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 shadow-lg text-lg">
                    {t('emptyState.loadProject')}
                </button>
            </div>
        </div>
    );
}