import React, { useRef } from 'react';

// Centralized style definitions for a dark theme
const styles = {
    container: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#2c2c2c',
        borderRadius: '8px',
        border: '1px solid #444',
        boxSizing: 'border-box',
        color: '#f0f0f0'
    },
    group: {
        marginBottom: '20px',
    },
    groupTitle: {
        margin: '0 0 10px 0',
        fontSize: '16px',
        color: '#e0e0e0',
        borderBottom: '1px solid #555',
        paddingBottom: '8px'
    },
    button: {
        padding: '10px 18px',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        outline: 'none',
        transition: 'background-color 0.2s, transform 0.1s',
    },
    sliderContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '150px'
    },
    sliderLabel: {
        fontSize: '13px',
        color: '#bbb',
        marginBottom: '5px',
        textTransform: 'capitalize'
    },
    sliderInput: {
        width: '100%',
        cursor: 'pointer'
    },
    sliderValue: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#fff',
        marginTop: '3px'
    }
};

const BoneSlider = ({ name, value, onChange, min = 10, max = 150 }) => (
    <div style={styles.sliderContainer}>
        <label htmlFor={`${name}-length`} style={styles.sliderLabel}>
            {name.replace('Length', ' Length')}
        </label>
        <input
            type="range"
            id={`${name}-length`}
            name={`${name}-length`}
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(name, parseInt(e.target.value, 10))}
            style={styles.sliderInput}
        />
        <span style={styles.sliderValue}>{value}</span>
    </div>
);

const PoseControls = ({
    draggable,
    useRelativeConstraints,
    setUseRelativeConstraints,
    useInverseKinematics,
    setUseInverseKinematics,
    jointVisibility,
    toggleJointVisibility,
    getJointVisibilityText,
    savePoseData,
    onPoseLoad,
    boneLengths,
    onBoneLengthChange,
}) => {
    const fileInputRef = useRef(null);

    const handleLoadClick = () => {
        fileInputRef.current.click();
    };

    // Define button styles based on state for dark theme
    const relativeConstraintsStyle = { ...styles.button, backgroundColor: useRelativeConstraints ? '#0d6efd' : '#6c757d' };
    const ikStyle = { ...styles.button, backgroundColor: useInverseKinematics ? '#6f42c1' : '#6c757d' };
    const visibilityStyle = { ...styles.button, backgroundColor: jointVisibility === 'always' ? '#dc3545' : (jointVisibility === 'hover' ? '#ffc107' : '#6c757d') };
    const saveStyle = { ...styles.button, backgroundColor: '#198754' };
    const loadStyle = { ...styles.button, backgroundColor: '#0dcaf0' };

    return (
        <div style={styles.container}>
            {draggable && (
                <div style={styles.group}>
                    <h3 style={styles.groupTitle}>Interaction Settings</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => setUseRelativeConstraints(!useRelativeConstraints)} style={relativeConstraintsStyle}>
                            {useRelativeConstraints ? 'Relative Constraints' : 'Absolute Constraints'}
                        </button>
                        <button onClick={() => setUseInverseKinematics(!useInverseKinematics)} style={ikStyle}>
                            {useInverseKinematics ? 'IK Enabled' : 'IK Disabled'}
                        </button>
                        <button onClick={toggleJointVisibility} style={visibilityStyle}>
                            {getJointVisibilityText()}
                        </button>
                    </div>
                </div>
            )}

            <div style={styles.group}>
                <h3 style={styles.groupTitle}>File Operations</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={savePoseData} style={saveStyle}>
                        Save Pose
                    </button>
                    <button onClick={handleLoadClick} style={loadStyle}>
                        Load Pose
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onPoseLoad}
                        style={{ display: 'none' }}
                        accept="application/json"
                    />
                </div>
            </div>

            {draggable && onBoneLengthChange && (
                <div style={styles.group}>
                    <h3 style={styles.groupTitle}>Bone Lengths</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                        <BoneSlider name="torsoLength" value={boneLengths.torsoLength} onChange={onBoneLengthChange} />
                        <BoneSlider name="neckLength" value={boneLengths.neckLength} onChange={onBoneLengthChange} />
                        <BoneSlider name="upperArmLength" value={boneLengths.upperArmLength} onChange={onBoneLengthChange} />
                        <BoneSlider name="lowerArmLength" value={boneLengths.lowerArmLength} onChange={onBoneLengthChange} />
                        <BoneSlider name="handLength" value={boneLengths.handLength} onChange={onBoneLengthChange} />
                        <BoneSlider name="upperLegLength" value={boneLengths.upperLegLength} onChange={onBoneLengthChange} />
                        <BoneSlider name="lowerLegLength" value={boneLengths.lowerLegLength} onChange={onBoneLengthChange} />
                        <BoneSlider name="footLength" value={boneLengths.footLength} onChange={onBoneLengthChange} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoseControls;
