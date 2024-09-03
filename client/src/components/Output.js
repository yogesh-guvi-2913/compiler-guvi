import React from "react";

function Output({ output }) {
  return (
    <div className="output">
      <h2>Output:</h2>
      <pre>{output}</pre>
    </div>
  );
}

export default Output;
