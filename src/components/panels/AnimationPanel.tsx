import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const AnimationPanel: React.FC = () => {
    const {
        timeDisplayMode,
        toggleTimeDisplayMode,
        loopMode,
        toggleLoopMode,
        framerate,
        setFramerate,
    } = useSettings();

    const getLoopButtonText = () => {
        switch (loopMode) {
            case 'loop':
                return 'Loop';
            case 'pingPong':
                return 'Ping Pong';
            case 'none':
            default:
                return 'Off';
        }
    };

    return (
        <div className="mb-5">
            <h3 className="text-lg font-medium text-text-primary border-b border-border-color pb-2 mb-2.5">Animation</h3>
            <div className="flex flex-col gap-2 mb-2">
                <label className="text-sm text-text-secondary">Time Display</label>
                <button onClick={toggleTimeDisplayMode} className="px-3 py-2 text-sm rounded border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 transition-colors">
                    {timeDisplayMode === 'seconds' ? 'Seconds' : 'Frames'}
                </button>
            </div>
            <div className="flex flex-col gap-2 mb-2">
                <label className="text-sm text-text-secondary">Loop</label>
                <button onClick={toggleLoopMode} className="px-3 py-2 text-sm rounded border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 transition-colors">
                    {getLoopButtonText()}
                </button>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary">Framerate</label>
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        min="1"
                        max="120"
                        value={framerate}
                        onChange={(e) => setFramerate(parseInt(e.target.value))}
                        className="flex-1"
                    />
                    <span className="text-sm text-text-primary min-w-[3rem]">{framerate} FPS</span>
                </div>
            </div>
        </div>
    );
};

export default AnimationPanel; 