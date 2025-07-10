import React from 'react';
import PoseRenderer from './components/PoseRenderer';
import useWindowSize from './hooks/useWindowSize';
import { PoseProvider } from './context/PoseContext.jsx';

function App() {
    const { width, height } = useWindowSize();

    if (!width || !height) {
        return <div>Loading...</div>;
    }

    const canvasSize = Math.min(width * 0.9, height * 0.9, 600);


    return (
        <PoseProvider>
            <div className="App">
                <PoseRenderer
                    draggable={true}
                    width={canvasSize}
                    height={canvasSize * 0.67}
                />
            </div>
        </PoseProvider>
    );
}

export default App; 