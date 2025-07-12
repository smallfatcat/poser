import React, { ReactNode } from 'react';

interface ViewportProps {
    children: ReactNode;
}

const Viewport: React.FC<ViewportProps> = ({ children }) => {
    return (
        <div className="flex-1 flex items-center justify-center bg-panel-bg rounded border border-border-color">
            {children}
        </div>
    );
};

export default Viewport; 