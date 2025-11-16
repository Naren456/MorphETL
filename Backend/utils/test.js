import { detectBlocks } from "./pareseMe.js"

let ra = `
PATIENT DAILY ROUNDS – MORNING SHIFT
Patient reports mild chest tightness since early morning.
Nurse observed slight tremors while patient stood up for vitals check.
No dizziness reported. Patient able to walk with assistance.
Family informed about the abnormal ECG overnight.

PATIENT_ID: 992144
NAME: "Arvind Kumar"
AGE: 58
GENDER: Male
WARD: "Cardiology-Block B"
BED: 07
DIAGNOSIS: "NSTEMI – Under Observation"
RISK_FACTORS:
  - hypertension
  - type2_diabetes
  - high_cholesterol

MEDICATION_PLAN:
  morning:
    - name: "Aspirin"
      dose: "75 mg"
      route: oral
    - name: "Atorvastatin"
      dose: "40 mg"
      route: oral
  evening:
    - name: "Metoprolol"
      dose: "25 mg"
      route: oral
    - name: "Nitroglycerin"
      dose: "2.6 mg"
      route: oral

VITAL_LOGS:
  - time: "2025-11-15T06:30:00Z"
    bp: "138/92"
    pulse: 102
    temp: "98.2 F"
    spo2: "94%"
  - time: "2025-11-15T07:30:00Z"
    bp: "134/88"
    pulse: 98
    temp: "98.1 F"
    spo2: "95%"
  - time: "2025-11-15T08:30:00Z"
    bp: "140/95"
    pulse: 105
    temp: "98.3 F"
    spo2: "93%"

<html>
  <body>
    <h2>Interventional Cardiology Procedure Summary</h2>
    <p>Procedure: Coronary Angiography</p>
    <p>Date: 2025-11-15</p>
    <p>Findings:</p>
    <ul>
      <li>Proximal LAD – 60% blockage</li>
      <li>Mid RCA – 40% blockage</li>
      <li>LCX – Normal</li>
    </ul>
    <p>No complications observed during the procedure.</p>
    <table>
      <tr><th>Vessel</th><th>Blockage (%)</th><th>Comments</th></tr>
      <tr><td>LAD</td><td>60</td><td>Moderate</td></tr>
      <tr><td>RCA</td><td>40</td><td>Mild</td></tr>
      <tr><td>LCX</td><td>0</td><td>Normal</td></tr>
    </table>
  </body>
</html>

<html>
  <body>
    <h3>Nursing Shift Notes – Afternoon</h3>
    <p>Patient complained of breathlessness while resting.</p>
    <p>Oxygen mask applied at 4 L/min for 20 minutes.</p>
    <p>Repeat ECG scheduled for 4:00 PM.</p>
  </body>
</html>

Test,Result,Unit,Reference Range,Collected At
Troponin I,0.84,ng/mL,<0.04,2025-11-15 06:10
CK-MB,28,U/L,0-25,2025-11-15 06:10
LDH,512,U/L,140-280,2025-11-15 06:10
D-Dimer,1.6,mg/L,<0.5,2025-11-15 06:10
WBC,10.8,k/uL,4.5-11,2025-11-15 06:10
Platelets,210000,cells/uL,150000-450000,2025-11-15 06:10

Medication,Route,Dose,Start Time
Aspirin,Oral,75 mg,2025-11-15 06:00
Heparin,IV,5000 units,2025-11-15 06:15
Nitroglycerin,Oral,2.6 mg,2025-11-15 06:20
Metoprolol,Oral,25 mg,2025-11-15 08:00

{
  "monitoring": {
    "ecg_events": [
      {
        "timestamp": "2025-11-15T02:13:00Z",
        "type": "ST_depression",
        "severity": "moderate",
        "lead": "V3-V4"
      },
      {
        "timestamp": "2025-11-15T03:27:00Z",
        "type": "ventricular_bigeminy",
        "severity": "high",
        "lead": "V2"
      }
    ],
    "spo2_trend": {
      "min": 92,
      "max": 97,
      "average": 94.5
    },
    "hr_trend": [88, 92, 95, 101, 98, 104]
  },
  "alerts": [
    {
      "category": "ECG",
      "message": "ST changes detected",
      "level": "critical"
    },
    {
      "category": "Respiratory",
      "message": "Low SpO2 event at 03:40 AM",
      "level": "moderate"
    }
  ]
}

{
  "insurance": {
    "provider": "CarePlus Health",
    "policy_no": "CPL-77812893",
    "valid_till": "2026-07-12",
    "coverage": {
      "total_limit": "7,50,000 INR",
      "room_limit": "6000 INR/day",
      "icu_limit": "15000 INR/day"
    }
  },
  "billing": {
    "items": [
      { "name": "Coronary Angiography", "cost": 17500 },
      { "name": "ICU Monitoring", "cost": 6000 },
      { "name": "Blood Tests Panel", "cost": 3200 },
      { "name": "Medications", "cost": 1800 }
    ],
    "total": 28500,
    "currency": "INR"
  }
}

ADMISSION_FILE:
  patient: "Arvind Kumar"
  admitted_on: "2025-11-14T22:40:00Z"
  reason: "Chest Pain – Possible Cardiac Event"
  emergency_details:
    brought_by: "Family"
    triage_priority: "High"
    initial_assessment:
      bp: "150/100"
      pulse: 118
      spo2: 93
  notes:
    - "Patient experienced severe chest pain at home"
    - "Was given aspirin before coming to hospital"
    - "BMI indicates overweight"

FOLLOW_UP_PLAN:
  required:
    - Repeat Troponin in 6 hrs
    - Repeat ECG
    - Monitor urine output
    - Blood sugar monitoring Q4H
  consults:
    cardiology: "Daily"
    endocrinology: "As needed"
    physiotherapy: "After stabilization"
`

console.log(detectBlocks(ra))