import React, { ReactNode } from 'react';

interface TimelineProps {
    children: ReactNode;
}

const Timeline: React.FC<TimelineProps> = ({ children }) => {
    return (
        <div className="timeline">
            {children}
        </div>
    );
};

export default Timeline; 