// ProgressBar.jsx
const steps = [
  { label: "Upload Photos" },
  { label: "Assign Photos to POIs" },
  { label: "Name & Review Map" },
];

const ProgressBar = ({ step }) => (
  <ul className="steps w-full mb-6">
    {steps.map((s, idx) => (
      <li key={idx} className={`step ${idx + 1 <= step ? "step-primary" : ""}`}>
        {s.label}
      </li>
    ))}
  </ul>
);
export default ProgressBar;
