import React, { ReactNode, Children, cloneElement, isValidElement } from 'react';

interface TimelineProps {
    children: ReactNode;
    [key: string]: any; // Allow other props
}

const Timeline: React.FC<TimelineProps> = ({ children, ...rest }) => {
    return (
        <div className="timeline">
            {Children.map(children, child => {
                if (isValidElement(child)) {
                    return cloneElement(child, rest as React.Attributes & { [key: string]: any });
                }
                return child;
            })}
        </div>
    );
};

export default Timeline; 