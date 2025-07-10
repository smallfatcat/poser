import React from 'react';
import { PoseProvider } from './context/PoseContext';
import { Toaster } from 'react-hot-toast';
import Editor from './components/Editor';


const App: React.FC = () => {
    return (
        <PoseProvider>
            <div className="App">
                <Toaster />
                <Editor />
            </div>
        </PoseProvider>
    );
}

export default App; 