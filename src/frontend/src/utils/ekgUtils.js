// src/utils/ekgUtils.js

// Helper function for Gaussian wave
export function gaussianWave(x, mean, amplitude, width) {
    return amplitude * Math.exp(-((x - mean) ** 2) / (2 * width ** 2));
}

// Function to generate an EKG waveform
export function ekgWaveform(t, heartRate = 60, pWave = true, variableRR = false, flutterRatio = null, retrogradeP = false) {
    const beatDuration = 60 / heartRate;
    let ekgBeat = Array(t.length).fill(0);
    const peaks = {};

    // Define wave positions
    const pWaveStart = pWave ? 0.2 * beatDuration : null;
    const qWaveStart = 0.4 * beatDuration;
    const rWaveStart = 0.45 * beatDuration;
    const sWaveStart = 0.5 * beatDuration;
    const tWaveStart = 0.7 * beatDuration;

    // Add P wave
    if (pWave) {
        ekgBeat = ekgBeat.map((y, i) => y + gaussianWave(t[i], pWaveStart, 0.1, 0.05 * beatDuration));
    }

    // QRS complex and T wave
    ekgBeat = ekgBeat.map((y, i) =>
        y -
        gaussianWave(t[i], qWaveStart, 0.15, 0.02 * beatDuration) +
        gaussianWave(t[i], rWaveStart, 1.0, 0.01 * beatDuration) -
        gaussianWave(t[i], sWaveStart, 0.2, 0.02 * beatDuration) +
        gaussianWave(t[i], tWaveStart, 0.3, 0.1 * beatDuration)
    );

    // Variable R-R interval
    if (variableRR) {
        const randomFactor = Math.random() * 0.4 + 0.8; // Random between 0.8 and 1.2
        beatDuration *= randomFactor;
    }

    // Retrograde P waves
    if (retrogradeP) {
        const retrogradePosition = rWaveStart - 0.15 * beatDuration;
        ekgBeat = ekgBeat.map((y, i) => y + gaussianWave(t[i], retrogradePosition, -0.08, 0.04 * beatDuration));
    }

    // Simulate flutter waves if specified
    if (flutterRatio && pWaveStart) {
        const flutterFrequency = flutterRatio * heartRate / 60;
        for (let i = 0; i < flutterRatio; i++) {
            const flutterPosition = pWaveStart + i * (0.6 / flutterFrequency);
            ekgBeat = ekgBeat.map((y, i) => y + gaussianWave(t[i], flutterPosition, 0.1, 0.05 * beatDuration));
        }
    }

    peaks.P = pWaveStart;
    peaks.Q = qWaveStart;
    peaks.R = rWaveStart;
    peaks.S = sWaveStart;
    peaks.T = tWaveStart;

    return { ekgBeat, peaks };
}

// Function to generate the complete EKG signal
export function generateEKG(duration = 10, heartRate = 72, samplingRate = 1000, ...params) {
    const numSamples = duration * samplingRate;
    const t = Array.from({ length: numSamples }, (_, i) => i / samplingRate);
    let ekgSignal = Array(t.length).fill(0);
    const peaksList = [];

    for (let i = 0; i < Math.floor(duration * heartRate / 60); i++) {
        const start = Math.floor(i * 60 / heartRate * samplingRate);
        const end = start + Math.floor(60 / heartRate * samplingRate);
        const { ekgBeat, peaks } = ekgWaveform(
            t.slice(0, end - start),
            heartRate,
            ...params
        );

        // Add noise and combine beats
        for (let j = start; j < end && j < ekgSignal.length; j++) {
            ekgSignal[j] = ekgBeat[j - start] + 0.05 * (Math.random() - 0.5);
        }

        for (let [peak, time] of Object.entries(peaks)) {
            if (time !== null) {
                peaksList.push({ peak, time: t[start] + time });
            }
        }
    }

    return { t, ekgSignal, peaksList };
}
