import React from "react";
import "../styles/TestCase.scss"; // Import your styles

const TestCase = ({ hiddenTestCases, results }) => {
  console.log(results);

  // Filter out only the enabled test cases from results
  const enabledTestCaseResults =
    Array.isArray(hiddenTestCases) && Array.isArray(results)
      ? results.filter((testCase, index) => hiddenTestCases[index]?.enabled)
      : [];

  console.log(enabledTestCaseResults);

  return (
    <div className="TestCase">
      {enabledTestCaseResults.length > 0 ? (
        enabledTestCaseResults.map((testCase, index) => {
          const expectedOutput = hiddenTestCases[index]?.output || "";
          const actualOutput = results[index]?.output || "";
          const isPassed = actualOutput === expectedOutput;

          return (
            <div
              key={index}
              className="test-case-item"
              style={{
                color: isPassed ? "green" : "red",
                backgroundColor: "transparent",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div>
                {isPassed ? (
                  <span className="status-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      width="20"
                      height="20"
                      style={{ marginLeft: "10px" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="status-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      width="20"
                      height="20"
                      style={{ marginLeft: "10px" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                )}
              </div>
              <div style={{ paddingTop: "2px" }}>Test Case {index + 1}</div>
              <div>
                Expected: {expectedOutput}, Got: {actualOutput}
              </div>
            </div>
          );
        })
      ) : (
        <p>No enabled hidden test cases to display.</p>
      )}
    </div>
  );
};

export default TestCase;
