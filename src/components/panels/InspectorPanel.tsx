import React, { ReactNode } from 'react';

interface InspectorPanelProps {
    children?: ReactNode;
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({ children }) => {
    return (
        <div className="flex flex-col gap-2.5">
            {children}
        </div>
    );
};

export default InspectorPanel; 