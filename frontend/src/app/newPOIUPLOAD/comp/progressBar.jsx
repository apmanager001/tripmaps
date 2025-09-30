// ProgressBar.jsx
const steps = [
  { label: "Upload Photos" },
  { label: "Assign Photos to POIs" },
  { label: "Name & Review Map" },
];

const ProgressBar = ({ step, total }) => (
  <div className="flex items-center mb-6">
    {steps.map((s, idx) => (
      <div key={idx} className="flex flex-col md:flex-row items-center justify-center">
        <div
          className={`w-8 h-8 flex  items-center justify-center rounded-full 
            ${
              idx + 1 <= step
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-500"
            }`}
        >
          {idx + 1}
        </div>
        <span className="ml-2 mr-4 text-center">{s.label}</span>
        {idx < total - 1 && <div className="w-8 h-1 bg-gray-300 mx-2 hidden md:block"></div>}
      </div>
    ))}
  </div>
);
export default ProgressBar;
