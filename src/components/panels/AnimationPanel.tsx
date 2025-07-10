import React from 'react';

type LoopMode = 'none' | 'loop' | 'pingPong';

interface AnimationPanelProps {
    animationDuration: number;
    setAnimationDuration: (duration: number) => void;
    timeDisplayMode: 'seconds' | 'frames';
    toggleTimeDisplayMode: () => void;
    loopMode: LoopMode;
    toggleLoopMode: () => void;
}

const AnimationPanel: React.FC<AnimationPanelProps> = ({
    animationDuration,
    setAnimationDuration,
    timeDisplayMode,
    toggleTimeDisplayMode,
    loopMode,
    toggleLoopMode,
}) => {
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (timeDisplayMode === 'seconds') {
            setAnimationDuration(value * 1000);
        } else {
            setAnimationDuration(Math.round(value * (1000 / 60)));
        }
    };

    const getDisplayDuration = () => {
        if (timeDisplayMode === 'seconds') {
            return (animationDuration / 1000).toFixed(2);
        }
        return Math.round(animationDuration / (1000 / 60));
    };

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
                <label htmlFor="duration">
                    Duration ({timeDisplayMode === 'seconds' ? 's' : 'frames'})
                </label>
                <input
                    type="number"
                    id="duration"
                    value={getDisplayDuration()}
                    onChange={handleDurationChange}
                    step={timeDisplayMode === 'seconds' ? 0.1 : 1}
                    className="number-input"
                />
            </div>
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