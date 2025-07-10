import React, { ReactNode } from 'react';

interface InspectorPanelProps {
    children?: ReactNode;
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({ children }) => {
    return (
        <div className="inspector-panel">
            {children}
        </div>
    );
};

export default InspectorPanel; 