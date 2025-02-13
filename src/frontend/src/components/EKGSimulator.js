// src/components/EKGSimulator.js
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { generateEKG } from "../utils/ekgUtils";
import "./EKGSimulator.css";

// Arrhythmias data structure
const arrhythmias = {
    "Sinus Tachycardia": { heartRate: 100, pWave: true, description: "Sinus tachycardia is characterized by a regular rhythm with a P wave preceding every QRS complex. The heart rate is typically above 100 bpm." },
    "Afib with RVR": { heartRate: 150, pWave: false, variableRR: true, description: "Atrial fibrillation with rapid ventricular response lacks distinct P waves, and the R-R interval varies irregularly due to uncoordinated atrial activity." },
    "Aflutter": { heartRate: 150, flutterRatio: 2, pWave: false, description: "Atrial flutter has a characteristic 'sawtooth' pattern due to rapid atrial flutter waves, with a consistent R-R interval and a ventricular rate around 150 bpm." },
    "AVRT": { heartRate: 220, retrogradeP: true, variableRR: true, description: "Atrioventricular reentrant tachycardia shows a very fast ventricular rate (200-300 bpm), with retrograde P waves and some variability in R wave amplitude." },
    "AVNRT": { heartRate: 180, retrogradeP: true, pWave: false, description: "Atrioventricular nodal reentrant tachycardia has a fast rate of 140-280 bpm, with a short PR interval and often overlapping P and QRS waves." },
    "Multifocal Atrial Tachycardia": { heartRate: 100, variableRR: true, pWave: true, description: "Multifocal atrial tachycardia features P waves with at least 3 different morphologies and variable P-P, P-R, and R-R intervals, with some P waves not followed by QRS complexes." }
};

function EKGSimulator() {
    const [chartData, setChartData] = useState(null);
    const [userDiagnosis, setUserDiagnosis] = useState("");
    const [chosenEKGType, setChosenEKGType] = useState("");

    const handleDiagnosisChange = (event) => {
        setUserDiagnosis(event.target.value);
    };

    const checkDiagnosis = () => {
        if (userDiagnosis.toLowerCase() === chosenEKGType.toLowerCase()) {
            alert("Correct! Well done!");
        } else {
            alert(`Incorrect. The correct answer was '${chosenEKGType}'.`);
        }
    };

    const simulateRandomEKG = () => {
        const arrhythmiaTypes = Object.keys(arrhythmias);
        const randomType = arrhythmiaTypes[Math.floor(Math.random() * arrhythmiaTypes.length)];
        setChosenEKGType(randomType);

        const { heartRate, ...params } = arrhythmias[randomType];
        const { t, ekgSignal } = generateEKG(5, heartRate, 1000, params);
        setChartData({
            labels: t,
            datasets: [{
                label: "EKG Signal",
                data: ekgSignal,
                borderColor: "blue",
                fill: false
            }]
        });
    };

    useEffect(() => {
        simulateRandomEKG();
    }, []);

    return (
        <div className="EKGSimulator">
            <h1>EKG Simulator</h1>
            <div className="controls">
                <input
                    type="text"
                    value={userDiagnosis}
                    onChange={handleDiagnosisChange}
                    placeholder="Enter your diagnosis"
                />
                <button onClick={checkDiagnosis}>Submit Diagnosis</button>
                <button onClick={simulateRandomEKG}>Next EKG</button>
            </div>
            {chartData && <Line data={chartData} />}
        </div>
    );
}

export default EKGSimulator;
