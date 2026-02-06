import React from 'react';
import { MapNode } from '../types';
import { Skull, HelpCircle, MapPin, Tent, Crown } from 'lucide-react';

interface MapProps {
  mapNodes: MapNode[];
  currentNodeId: string | null;
  onNodeSelect: (node: MapNode) => void;
}

export const GameMap: React.FC<MapProps> = ({ mapNodes, currentNodeId, onNodeSelect }) => {
  
  const getIcon = (type: string) => {
    switch (type) {
        case 'combat': return <Skull size={24} />;
        case 'elite': return <Skull size={28} className="text-red-500" />;
        case 'event': return <HelpCircle size={24} />;
        case 'rest': return <Tent size={24} />;
        case 'boss': return <Crown size={32} className="text-yellow-400" />;
        default: return <MapPin size={24} />;
    }
  };

  const isNodeSelectable = (node: MapNode) => {
    if (!currentNodeId) {
        // Only allow selecting starting nodes (Tier 1, usually low Y or distinct ID pattern)
        // In our generator, Tier 1 is id '1-x'
        return node.id.startsWith('1-');
    }
    // Find current node
    const currentNode = mapNodes.find(n => n.id === currentNodeId);
    if (!currentNode) return false;
    // Check if node is in the current node's 'next' list
    return currentNode.next.includes(node.id);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative p-8">
        <h2 className="text-4xl font-serif text-amber-100 mb-8 tracking-widest uppercase border-b border-amber-500/30 pb-4">The Spire Map</h2>
        
        <div className="relative w-[600px] h-[600px] bg-slate-800 rounded-full shadow-2xl border-4 border-slate-700 overflow-hidden">
             {/* Simple Background Pattern */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>

            {/* Render Connections first */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {mapNodes.map(node => {
                    return node.next.map(nextId => {
                        const nextNode = mapNodes.find(n => n.id === nextId);
                        if (!nextNode) return null;
                        return (
                            <line 
                                key={`${node.id}-${nextId}`}
                                x1={`${node.x}%`} 
                                y1={`${node.y}%`} 
                                x2={`${nextNode.x}%`} 
                                y2={`${nextNode.y}%`} 
                                stroke={node.completed ? "#10b981" : "#475569"} 
                                strokeWidth="3"
                                strokeDasharray="5,5"
                            />
                        );
                    });
                })}
            </svg>

            {/* Render Nodes */}
            {mapNodes.map(node => {
                const selectable = isNodeSelectable(node);
                const isCurrent = node.id === currentNodeId;
                const isCompleted = node.completed;

                let nodeClass = "absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ";
                
                if (isCurrent) {
                    nodeClass += "bg-amber-500 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-125 text-white";
                } else if (isCompleted) {
                    nodeClass += "bg-emerald-700 border-emerald-500 opacity-60 grayscale";
                } else if (selectable) {
                    nodeClass += "bg-slate-600 border-white hover:bg-slate-500 hover:scale-110 cursor-pointer animate-pulse-slow shadow-lg text-white";
                } else {
                    nodeClass += "bg-slate-800 border-slate-600 opacity-40 cursor-not-allowed text-slate-500";
                }

                return (
                    <div 
                        key={node.id}
                        className={nodeClass}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onClick={() => selectable && onNodeSelect(node)}
                    >
                        {getIcon(node.type)}
                    </div>
                );
            })}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
            Select a highlighted node to proceed.
        </div>
    </div>
  );
};
