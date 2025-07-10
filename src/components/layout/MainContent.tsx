import React, { ReactNode } from 'react';

interface MainContentProps {
    children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    return (
        <div className="main-content">
            {children}
        </div>
    );
};

export default MainContent; 