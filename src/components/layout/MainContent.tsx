import React, { ReactNode } from 'react';

interface MainContentProps {
    children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    return (
        <div className="flex-1 p-2.5 bg-app-bg">
            {children}
        </div>
    );
};

export default MainContent; 