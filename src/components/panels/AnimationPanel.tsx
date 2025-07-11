import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const AnimationPanel: React.FC = () => {
    const {
        timeDisplayMode,
        toggleTimeDisplayMode,
        loopMode,
        toggleLoopMode,
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
        <div className="group">
            <h3 className="group-title">Animation</h3>
            <div className="control-row">
                <label>Time Display</label>
                <button onClick={toggleTimeDisplayMode} className="btn">
                    {timeDisplayMode === 'seconds' ? 'Seconds' : 'Frames'}
                </button>
            </div>
            <div className="control-row">
                <label>Loop</label>
                <button onClick={toggleLoopMode} className="btn">
                    {getLoopButtonText()}
                </button>
            </div>
        </div>
    );
};

export default AnimationPanel; 