import React, { ReactNode } from 'react';

interface ViewportProps {
    children: ReactNode;
}

const Viewport: React.FC<ViewportProps> = ({ children }) => {
    return (
        <div className="viewport">
            {children}
        </div>
    );
};

export default Viewport; 