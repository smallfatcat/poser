import React, { ReactNode, Children, cloneElement, isValidElement } from 'react';

interface TimelineProps {
    children: ReactNode;
    [key: string]: any; // Allow other props
}

const Timeline: React.FC<TimelineProps> = ({ children, ...rest }) => {
    return (
        <div className="bg-panel-bg border-t border-border-color p-2 space-y-2 min-h-[280px]">
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