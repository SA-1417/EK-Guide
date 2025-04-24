import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "./App.css"; // Ensure this file is created for styles

/// Arrhythmias data structure
const arrhythmias = {
    "Sinus Tachycardia": { 
        heartRate: 100,
        Pwave: true,
        RtR: true, // Regular R-R intervals
        Placement: false, // P wave before QRS complex
        Ppositive: true, // P wave is upside down
        description: "Regular rhythm with a P wave preceding every QRS complex." 
    },
    "Afib with RVR": { //Afib with RVR
        heartRate: 150,
        Pwave: false,
	    Rtr: false,
        Placement: false, 
        description: "Lacks distinct P waves, has variable R-R intervals." 
    },
    "AVRT": { //AVRT
        heartRate: 220,
        Pwave: true,
	    Rtr: true,
        Placement: true,
        Ppositive: false, // P wave is upside down
        description: "Very fast rate (200-300 bpm), with retrograde P waves." 
    },
    "AVNRT": { //AVNRT
        heartRate: 180,
        Pwave: false,
        RtR: true, // Irregular R-R intervals
        Placement: false,
        description: "Fast rate, with retrograde P waves possibly overlaying the QRS." 
    }
};


// Merged function to generate EKG waveform and signal
function generateEKG(duration = 5, arrhythmiaType, samplingRate = 1000, numWaves = 1) {
    const numSamples = duration * samplingRate; // Total number of samples to generate
    const t = Array.from({ length: numSamples }, (_, i) => i / samplingRate); // Time array
    let ekgSignal = Array(t.length).fill(0); // Initialize the EKG signal array
    const heartRate = arrhythmias[arrhythmiaType].heartRate; // Get heart rate for the chosen arrhythmia
    const beatDuration = 60 / heartRate; // Calculate the duration of one heartbeat

    // Gaussian wave generator
    function gaussianWave(x, mean, amplitude, width) {
        return amplitude * Math.exp(-((x - mean) ** 2) / (2 * width ** 2));
    }

    // EKG waveform generation
    const wavePositions = []; // To hold positions for P, Q, R, S, T waves
    for (let i = 0; i < numWaves; i++) {
        let start = Math.floor(i * (60 / heartRate) * samplingRate);
        let end = start + Math.floor((60 / heartRate) * samplingRate);
        let ekgBeat = Array(t.length).fill(0); // Initialize the EKG beat array

        // Define wave positions
        const pWaveStart = arrhythmias[arrhythmiaType].Pwave ? 0.2 * beatDuration : null; // P wave presence
        const qWaveStart = 0.4 * beatDuration; // Q wave position
        const rWaveStart = 0.45 * beatDuration; // R wave position
        const sWaveStart = 0.5 * beatDuration; // S wave position
        const tWaveStart = 0.7 * beatDuration; // T wave position

        // Store the positions for highlighting
        if (pWaveStart !== null) wavePositions.push({ type: 'P', start: start + Math.floor(pWaveStart * samplingRate), end: start + Math.floor((pWaveStart + 0.1 * beatDuration) * samplingRate) });
        wavePositions.push({ type: 'Q', start: start + Math.floor(qWaveStart * samplingRate), end: start + Math.floor((qWaveStart + 0.1 * beatDuration) * samplingRate) });
        wavePositions.push({ type: 'R', start: start + Math.floor(rWaveStart * samplingRate), end: start + Math.floor((rWaveStart + 0.1 * beatDuration) * samplingRate) });
        wavePositions.push({ type: 'S', start: start + Math.floor(sWaveStart * samplingRate), end: start + Math.floor((sWaveStart + 0.1 * beatDuration) * samplingRate) });
        wavePositions.push({ type: 'T', start: start + Math.floor(tWaveStart * samplingRate), end: start + Math.floor((tWaveStart + 0.2 * beatDuration) * samplingRate) });

        // Adjust for placement of P wave
        const pWavePlacement = arrhythmias[arrhythmiaType].Placement;

        // Add P wave based on its presence and placement
        if (pWaveStart !== null) {
            if (pWavePlacement) {
                ekgBeat = ekgBeat.map((y, i) => 
                    y + gaussianWave(t[i], rWaveStart + 0.1 * beatDuration, 0.1, 0.05 * beatDuration)
                );
            } else {
                ekgBeat = ekgBeat.map((y, i) => 
                    y + gaussianWave(t[i], pWaveStart, 0.1, 0.05 * beatDuration)
                );
            }
        }

        // Add QRS complex and T wave
        ekgBeat = ekgBeat.map((y, i) => 
            y -
            gaussianWave(t[i], qWaveStart, 0.15, 0.02 * beatDuration) + // Q wave
            gaussianWave(t[i], rWaveStart, 1.0, 0.01 * beatDuration) - // R wave
            gaussianWave(t[i], sWaveStart, 0.2, 0.02 * beatDuration) + // S wave
            gaussianWave(t[i], tWaveStart, 0.3, 0.1 * beatDuration) // T wave
        );

        // Adjust for inverted P wave in AVRT
        if (arrhythmias[arrhythmiaType].Ppositive === false && arrhythmias[arrhythmiaType].Pwave) {
            ekgBeat = ekgBeat.map((y, i) => 
                y - gaussianWave(t[i], pWaveStart, 0.1, 0.05 * beatDuration) // Inverted P wave
            );
        }

        // Add the EKG beat to the overall signal
        for (let j = start; j < end && j < ekgSignal.length; j++) {
            //ekgSignal[j] += ekgBeat[j - start] + 0.05 * (Math.random() - 0.1); // Add noise
            ekgSignal[j] += ekgBeat[j - start] + 0.05;
        }
    }

    // Trim the time and ekgSignal arrays to contain only the relevant data
    const trimmedEnd = Math.ceil(numWaves * (60 / heartRate) * samplingRate);
    return { t: t.slice(0, trimmedEnd), ekgSignal: ekgSignal.slice(0, trimmedEnd), wavePositions };
}

function EKGSimulator() {
    const [chartData, setChartData] = useState(null);
    const [showLabeledGraph, setShowLabeledGraph] = useState(false);
    const [userDiagnosis, setUserDiagnosis] = useState("");
    const [userReasoning, setUserReasoning] = useState("")
    const [chosenEKGType, setChosenEKGType] = useState("");
    const [numPulses, setNumPulses] = useState(3); // Default to 3 pulses
    const [wavePositions, setWavePositions] = useState([]);
    const [analysis, setAnalysis] = useState("")
    const [visibility, setVisibility] = useState(false)

    const handleDiagnosisChange = (event) => {
        setUserDiagnosis(event.target.value);
    };

    const handleReasoningChange = (event) => {
        setUserReasoning(event.target.value)
    }

    const handleNumPulsesChange = (event) => {
        const value = parseInt(event.target.value);
        if (value === 3 || value === 5) {
            setNumPulses(value);
        }
    };

    const checkDiagnosis = async () => {
        try {
            const response = await fetch("http://localhost:8000/analyze-response", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_answer: userDiagnosis,
                    correct_answer: chosenEKGType,
                    user_explanation: userReasoning,
                    ekg_attributes: arrhythmias[chosenEKGType].description
                })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch analysis");
            }

            const data = await response.json();
            setAnalysis(data.feedback);
            setVisibility(true)
        } catch (error) {
            console.error("Error fetching analysis:", error);
        }
    };


    const simulateRandomEKG = () => {
        setVisibility(false);
        setAnalysis("");
        setUserDiagnosis("");
        setUserReasoning("");
        const arrhythmiaTypes = Object.keys(arrhythmias);
        const randomType = arrhythmiaTypes[Math.floor(Math.random() * arrhythmiaTypes.length)];
        setChosenEKGType(randomType);

        const { heartRate } = arrhythmias[randomType];
        const { t, ekgSignal, wavePositions } = generateEKG(5, randomType, 1000, numPulses); // Generate based on arrhythmia type
        setWavePositions(wavePositions); // Save wave positions for background highlighting

        const data = {
            labels: t,
            datasets: [{
                label: `EKG Signal Below:`,
                data: ekgSignal,
                borderColor: "black", // Change the line color to black
                pointRadius: 0, // Remove bullet points
                showLine: true,  // Ensure line is shown
                fill: false
            }],
        };

        setChartData(data);
    };

    useEffect(() => {
        simulateRandomEKG();
    }, [numPulses]); 

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                    },
                },
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    callback: (value) => value.toFixed(2),
                    font: {
                        family: "'Inter', sans-serif",
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            annotation: {
                annotations: {},
            },
        },
    };

    // Add background highlights for P, QRS, and T waves
    if (chartData) {
        wavePositions.forEach(({ type, start, end }) => {
            const color = type === 'P' ? 'rgba(255, 223, 186, 0.5)' : type === 'T' ? 'rgba(186, 255, 233, 0.5)' : 'rgba(255, 186, 186, 0.5)';
            chartOptions.plugins.annotation.annotations[`highlight${type}`] = {
                type: 'box',
                xMin: start / 1000, // Convert to seconds
                xMax: end / 1000, // Convert to seconds
                yMin: -1, // Adjust these values based on the EKG scale
                yMax: 1,
                backgroundColor: color,
                borderWidth: 0,
            };
        });
    }

    return (
        <div className="App">
            <h1>EKG Simulator</h1>
            
            <div className="chart-container">
                {chartData && (
                    <div style={{ height: '400px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                )}
            </div>
            
            <div className="input-section">
                <div>
                    <label htmlFor="diagnosis">Your Diagnosis</label>
                    <input
                        id="diagnosis"
                        className="input-field"
                        type="text"
                        value={userDiagnosis}
                        onChange={handleDiagnosisChange}
                        placeholder="Enter your diagnosis..."
                    />
                </div>

                <div>
                    <label htmlFor="reasoning">Your Reasoning</label>
                    <textarea
                        id="reasoning"
                        className="input-field"
                        value={userReasoning}
                        onChange={handleReasoningChange}
                        placeholder="Explain your reasoning..."
                        rows="4"
                    />
                </div>

                <div>
                    <label htmlFor="pulses">Number of Pulses</label>
                    <select
                        id="pulses"
                        className="input-field"
                        value={numPulses}
                        onChange={handleNumPulsesChange}
                    >
                        <option value="3">3 Pulses</option>
                        <option value="5">5 Pulses</option>
                    </select>
                </div>

                <button className="button" onClick={checkDiagnosis}>
                    Submit Diagnosis
                </button>
                
                <button 
                    className="button" 
                    onClick={simulateRandomEKG}
                    style={{ marginTop: '1rem', backgroundColor: 'var(--text-secondary)' }}
                >
                    Generate New EKG
                </button>
            </div>

            {visibility && analysis && (
                <div className="analysis-section">
                    <h2>Analysis</h2>
                    <div className="analysis-content">
                        {analysis}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EKGSimulator;
