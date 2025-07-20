import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import { useApp } from '../../context/AppContext';
import CustomActivityNode from './CustomActivityNode';
import { useTranslation } from 'react-i18next';

const nodeTypes = { activity: CustomActivityNode };

export default function DiagramCanvas() {
    const { projectData, deleteActivity, openActivityModal, updateActivityStatus, projectStatus } = useApp();
    
    const { t } = useTranslation();
    const [contextMenu, setContextMenu] = useState(null);
   
    const canChangeStatus = projectStatus !== t('status.completed');

    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, node });
    }, []);

    const onNodeDoubleClick = useCallback((event, node) => {
        if (projectData.editavel && node.data.status !== t('status.completed')) {
            openActivityModal(node.data, false);
        } else {
            openActivityModal(node.data, true);
        }
    }, [projectData, openActivityModal]);

    const handleCloseContextMenu = () => setContextMenu(null);
    
    const handleDelete = () => {
        if (contextMenu?.node) {
            if(window.confirm(t('alerts.confirmDelete'))) {
               deleteActivity(parseInt(contextMenu.node.id));
            }
        }
        handleCloseContextMenu();
    };

    const handleEdit = () => {
        if (contextMenu?.node) {
            openActivityModal(contextMenu.node.data, false);
        }
        handleCloseContextMenu();
    };

    const handleViewDetails = () => {
        if (contextMenu?.node) {
            openActivityModal(contextMenu.node.data, true);
        }
        handleCloseContextMenu();
    };
    
    const handleStatusChange = (newStatus) => {
        if (contextMenu?.node) {
            updateActivityStatus(parseInt(contextMenu.node.id), newStatus);
        }
        handleCloseContextMenu();
    };

    const { nodes, edges } = useMemo(() => {
        if (!projectData?.atividades) return { nodes: [], edges: [] };
        
        const nodeLayout = {};
        const levels = {};
        let maxLevel = 0;

        projectData.atividades.forEach(node => {
            const level = (node.dependencia?.length === 0) ? 0 : -1;
            nodeLayout[node.id] = { ...node, level: level, x: 0, y: 0 };
        });

        function calculateLevel(node) {
            if (node.level !== -1) return node.level;
            if (!node.dependencia || node.dependencia.length === 0) {
                node.level = 0;
                return 0;
            }
            const parentLevels = node.dependencia.map(depId => calculateLevel(nodeLayout[depId] || {level: 0, dependencia: []}));
            node.level = Math.max(...parentLevels) + 1;
            maxLevel = Math.max(maxLevel, node.level);
            return node.level;
        }

        Object.values(nodeLayout).forEach(calculateLevel);

        for (let i = 0; i <= maxLevel; i++) {
            levels[i] = Object.values(nodeLayout).filter(n => n.level === i);
        }

        Object.keys(levels).forEach(level => {
            levels[level].forEach((node, index) => {
                node.x = parseInt(level) * 300;
                node.y = index * 180;
            });
        });

        const nodes = Object.values(nodeLayout).map(node => ({
            id: node.id.toString(),
            type: 'activity',
            data: node,
            position: { x: node.x, y: node.y },
        }));

        const edges = [];
        projectData.atividades.forEach(act => {
            if (act.dependencia) {
                act.dependencia.forEach(depId => {
                    edges.push({
                        id: `e-${depId}-${act.id}`,
                        source: depId.toString(),
                        target: act.id.toString(),
                        type: 'smoothstep',
                        animated: act.status === t('status.inProgress'),
                        style: { strokeWidth: 2 }
                    });
                });
            }
            if (act.status === t('status.completedWithErrors') && act.onErrorGoTo) {
                act.onErrorGoTo.forEach(errorDepId => {
                    edges.push({
                        id: `err-${act.id}-${errorDepId}`,
                        source: act.id.toString(),
                        target: errorDepId.toString(),
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }
                    });
                });
            }
        });
        return { nodes, edges };
    }, [projectData]);

    if (!projectData) return null;

    const canEditStructure = projectData.editavel && contextMenu?.node.data.status !== t('status.completed');

    return (
        <div className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeContextMenu={onNodeContextMenu}
                onNodeDoubleClick={onNodeDoubleClick}
                onPaneClick={handleCloseContextMenu}
                nodesConnectable={false}
                fitView
                fitViewOptions={{ padding: 0.2 }}
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>

            {contextMenu && (
                <div
                    style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
                    className="absolute z-50 bg-white rounded-md shadow-lg py-1 w-48"
                >
                    <button onClick={handleViewDetails} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('contextMenu.viewDetails')}</button>
                    <button 
                        onClick={handleEdit} 
                        disabled={!canEditStructure}
                        className={`block w-full text-left px-4 py-2 text-sm ${canEditStructure ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                    >
                        {t('buttons.edit')}
                    </button>
                    <button onClick={handleDelete} disabled={!projectData.editavel} className={`block w-full text-left px-4 py-2 text-sm ${projectData.editavel ? 'text-red-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>{t('contextMenu.delete')}</button>
                    
                    <div className="border-t my-1 border-gray-200"></div>
                    <p className={`px-4 pt-2 pb-1 text-xs ${canChangeStatus ? 'text-gray-500' : 'text-gray-400'}`}>{t('contextMenu.changeStatus')}</p>
                    <button onClick={() => handleStatusChange(t('status.pending'))} disabled={!canChangeStatus} className={`block w-full text-left px-4 py-2 text-sm ${canChangeStatus ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>{t('status.pending')}</button>
                    <button onClick={() => handleStatusChange(t('status.inProgress'))} disabled={!canChangeStatus} className={`block w-full text-left px-4 py-2 text-sm ${canChangeStatus ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>{t('status.inProgress')}</button>
                    <button onClick={() => handleStatusChange(t('status.completed'))} disabled={!canChangeStatus} className={`block w-full text-left px-4 py-2 text-sm ${canChangeStatus ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>{t('status.completed')}</button>
                    <button onClick={() => handleStatusChange(t('status.completedWithErrors'))} disabled={!canChangeStatus} className={`block w-full text-left px-4 py-2 text-sm ${canChangeStatus ? 'text-red-500 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>{t('status.completedWithErrors')}</button>
                    <button onClick={() => handleStatusChange(t('status.interrupted'))} disabled={!canChangeStatus} className={`block w-full text-left px-4 py-2 text-sm ${canChangeStatus ? 'text-yellow-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}>{t('status.interrupted')}</button>
                </div>
            )}
        </div>
    );
}