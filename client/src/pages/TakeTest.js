import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "../styles/TakeTest.scss"; // Import your styles
import Question from "../components/Question";
import Testcase from "../components/TestCase";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import toast from "react-hot-toast";

const TakeTest = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the problem ID from the route
  const [showTestCase, setShowTestCase] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [language, setLanguage] = useState(""); // Default language can be set here if needed
  const [problemData, setProblemData] = useState(null); // State to store problem details
  const [code, setCode] = useState(""); // State to store code in the editor
  const [mainfunc, setMainfunc] = useState(""); // State to store mainfunc
  const [runClicked, setRunClicked] = useState(false); // State to track if Run Code is clicked
  const [openDialog, setOpenDialog] = useState(false);
  const [testCases, setTestCases] = useState([]); // State to store fetched test cases
  const [testCaseResults, setTestCaseResults] = useState([]); // State to store execution results

  useEffect(() => {
    // Fetch problem details from the backend using the problem ID
    const fetchProblemDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost/practice/server/php/problemDetails.php?id=${id}`
        );
        const data = await response.json();
        setProblemData(data);
        setLanguages(data.languageIO);

        // Set the code for the default language
        if (data.languageIO.length > 0) {
          const defaultLanguage = data.languageIO[0].language;
          setLanguage(defaultLanguage);
          const defaultLang = data.languageIO.find(
            (lang) => lang.language === defaultLanguage
          );
          setMainfunc(defaultLang?.mainfunc || "");
          setCode(defaultLang?.userfunc || ""); // Initialize with userfunc
        }

        // Set test cases
        if (data.hiddenIO) {
          setTestCases(data.hiddenIO);
        }
      } catch (error) {
        console.error("Error fetching problem details:", error);
      }
    };

    fetchProblemDetails();
  }, [id]);

  // Toggle the bottom panel up and down
  const toggleTestCase = () => {
    setShowTestCase((prev) => !prev); // Toggle the test case panel
  };

  const handleConformSubmit = () => {
    setOpenDialog(true);
  };

  const confirmSubmit = () => {
    navigate("/");
    toast.success("Problem Submitted Successfully");
  };

  // Handle language change and update the code editor
  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);

    const selectedLang = problemData?.languageIO.find(
      (lang) => lang.language === selectedLanguage
    );
    setMainfunc(selectedLang?.mainfunc || "");
    setCode(selectedLang?.userfunc || ""); // Update code with userfunc
  };

  const handleRunCode = async () => {
    setShowTestCase(true); // Show the test case when "Run Code" is clicked
    setRunClicked(true); // Enable the down icon after Run Code is clicked

    const combinedCode = `${code}\n${mainfunc}`;

    try {
      const response = await fetch(
        "http://localhost/practice/server/php/runCode.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code: combinedCode,
            language: language,
            testCases: JSON.stringify(testCases),
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        console.error("Error executing code:", result.error);
      } else {
        console.log("Execution result:", result);
        setTestCaseResults(result); // Store the results
        console.log(testCaseResults);
      }
    } catch (error) {
      console.error("Error running code:", error);
    }
  };

  return (
    <div className="container1">
      <div className="left-panel">
        {/* Pass title, description, and sample IO to the Question component */}
        {problemData && (
          <Question
            title={problemData.title}
            description={problemData.description}
            sampleIO={problemData.sampleIO}
          />
        )}
      </div>
      <div className="right-panel">
        {/* Language Selector */}
        <div className="language-selector">
          <label htmlFor="language">Select Language: </label>
          <select
            id="language"
            onChange={handleLanguageChange}
            value={language}
            disabled={languages.length === 0}
          >
            {languages.map((lang) => (
              <option key={lang.language} value={lang.language}>
                {lang.language}
              </option>
            ))}
          </select>
        </div>

        <div className="code-editor">
          <Editor
            height="90vh"
            language={language} // Dynamic language setting
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-light" // Use a light theme
            options={{
              automaticLayout: true,
              wordWrap: "on",
              minimap: { enabled: false },
              fontSize: 14,
              contextmenu: false, // Disable context menu
            }}
          />
        </div>

        {/* Bottom panel for test case results */}
        <div className={`bottom-panel ${showTestCase ? "expanded" : ""}`}>
          <div className="buttons">
            <button
              className="btn_down"
              onClick={toggleTestCase}
              disabled={!runClicked} // Disable the button until Run Code is clicked
              style={{ opacity: runClicked ? 1 : 0.5 }} // Optionally style the disabled button
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{
                  transform: showTestCase ? "rotate(0deg)" : "rotate(180deg)", // Rotate icon based on panel state
                  transition: "transform 0.3s ease",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div className="button_in">
              <button className="run_btn" onClick={handleRunCode}>
                Run Code
              </button>
              <button className="sub_btn" onClick={handleConformSubmit}>
                Submit
              </button>
            </div>
          </div>
          {showTestCase && problemData && (
            <Testcase
              hiddenTestCases={problemData.hiddenIO}
              results={testCaseResults}
            />
          )}
        </div>
      </div>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Submission"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to submit this problem?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} className="cancel1">
            Cancel
          </Button>
          <Button onClick={confirmSubmit} className="Submit1" autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TakeTest;
