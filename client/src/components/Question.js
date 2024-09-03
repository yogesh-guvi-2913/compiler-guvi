import React from "react";
import "../styles/Question.scss";

function Question({ title, description, sampleIO }) {
  // Filter sampleIO to include only enabled test cases
  const enabledSampleIO = sampleIO.filter((sample) => sample.enabled);

  return (
    <div className="Question">
      {/* Render the title dynamically */}
      <div className="Question_title">{title}</div>

      {/* Render the description dynamically */}
      <div className="Question_content">{description}</div>

      {/* Render each enabled sample input/output dynamically */}
      {enabledSampleIO.length > 0 ? (
        enabledSampleIO.map((sample, index) => (
          <div className="Question_sample" key={index}>
            <div className="Question_sample_title">Example {index + 1}</div>
            <div className="Question_sample_body">
              <div className="Question_sample_body_items">
                <span>Input:</span> {sample.input}
              </div>
              <div className="Question_sample_body_items">
                <span>Output:</span> {sample.output}
              </div>
              <div className="Question_sample_body_items">
                <span>Explanation:</span> {sample.explanation}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No enabled test cases to display.</p>
      )}
    </div>
  );
}

export default Question;
