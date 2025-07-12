import React, { ReactNode } from 'react';

interface SidebarProps {
    children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    return (
        <div className="w-sidebar border-r border-gray-300 p-2.5 flex flex-col gap-2.5 bg-panel-bg">
            {children}
        </div>
    );
};

export default Sidebar; 