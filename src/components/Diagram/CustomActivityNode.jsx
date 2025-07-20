import React from 'react';
import { Handle, Position } from 'reactflow';
import { useApp } from '../../context/AppContext';
import { icons } from '../../config/icons';
import { useTranslation } from 'react-i18next';

export default function CustomActivityNode({ data }) {
    const { tiposAtividade } = useApp();
    const tipoInfo = tiposAtividade.find(t => t.id === data.tipo_id);
    const { t } = useTranslation();
    const statusColors = {
        [t('status.pending')]: 'bg-gray-200 text-gray-800',
        [t('status.inProgress')]: 'bg-blue-200 text-blue-800',
        [t('status.completed')]: 'bg-green-200 text-green-800',
        [t('status.completedWithErrors')]: 'bg-red-200 text-red-800',
        [t('status.interrupted')]: 'bg-yellow-200 text-yellow-800'
    };

    return (
        <>
            <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
            <div className="bg-white p-3 rounded-lg shadow-lg min-w-[220px]" style={{ borderTop: `4px solid ${tipoInfo?.cor || '#ccc'}` }}>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-gray-800">{data.nome}</p>
                    {tipoInfo && icons[tipoInfo.icone]}
                </div>
                <p className="text-xs text-gray-500 mb-2">{t('modals.duration2')} {data.tempo_execucao_horas}h</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[data.status] || ''}`}>
                    {data.status}
                </span>
            </div>
            <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />
        </>
    );
}