import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import "../styles/Problem.scss";
import { useNavigate } from "react-router-dom";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  Tabs,
  Tab,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Add } from "@mui/icons-material";

function Problem({ id }) {
  const navigate = useNavigate();
  const [problemTitle, setProblemTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sampleIO, setSampleIO] = useState([
    { input: "", output: "", explanation: "", enabled: true },
  ]);
  const [hiddenIO, setHiddenIO] = useState([
    { input: "", output: "", enabled: true },
  ]);
  const [languageIO, setLanguageIO] = useState([
    { language: "", mainfunc: "", userfunc: "", enabled: true },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [enableError, setEnableError] = useState(""); // New state for enable error
  const [openDialog, setOpenDialog] = useState(false);
  const [testCaseType, setTestCaseType] = useState(""); // "sample" or "hidden"
  const [testcaseToDelete, setTestcaseToDelete] = useState(null);
  const [value, setValue] = useState(0);
  const [langValue, setLangValue] = useState(0);
  const [sampValue, setSampValue] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollLeftLang, setScrollLeftLang] = useState(0);
  const [scrollLeftSamp, setScrollLeftSamp] = useState(0);
  const tabsContainerRef = React.useRef(null);
  const tabsContainerLangRef = React.useRef(null);
  const tabsContainerSampRef = React.useRef(null);

  const sampleRefs = useRef([]); // Refs for sample test cases
  const hiddenRefs = useRef([]); // Refs for hidden test cases
  const languageRefs = useRef([]);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchProblem = async () => {
        try {
          const response = await fetch(
            `http://localhost/practice/server/php/getProblem.php?id=${id}`
          );
          //66d44e520635acc6f00316d4
          const data = await response.json();
          if (!data.error) {
            setProblemTitle(data.title);
            setDescription(data.description);
            setSampleIO(
              data.sampleIO.length > 0
                ? data.sampleIO
                : [{ input: "", output: "", explanation: "", enabled: true }]
            );
            setHiddenIO(
              data.hiddenIO.length > 0
                ? data.hiddenIO
                : [{ input: "", output: "", enabled: true }]
            );
            setLanguageIO(
              data.languageIO.length > 0
                ? data.languageIO
                : [{ language: "", mainfunc: "", userfunc: "", enabled: true }]
            );
          } else {
            console.error(data.error);
          }
        } catch (error) {
          console.error("Error fetching problem:", error);
        }
      };

      fetchProblem();
    } else {
      setIsEditing(false);
    }
  }, [id]);

  const validateFields = () => {
    const newErrors = {};
    setEnableError(""); // Reset the enable error message

    if (!problemTitle) newErrors.problemTitle = "Problem title is required.";
    if (!description) newErrors.description = "Description is required.";

    // Check sample I/O fields
    sampleIO.forEach((sample, index) => {
      if (sample.enabled) {
        if (!sample.output)
          newErrors[`sampleOutput${index}`] = "Output is required.";
        if (!sample.explanation)
          newErrors[`sampleExplanation${index}`] = "Explanation is required.";
      }
    });

    // Check hidden I/O fields
    hiddenIO.forEach((hidden, index) => {
      if (hidden.enabled && !hidden.output)
        newErrors[`hiddenOutput${index}`] = "Hidden output is required.";
    });

    // Validate that at least one sample I/O and one hidden I/O are enabled
    const sampleEnabled = sampleIO.some((sample) => sample.enabled);
    const hiddenEnabled = hiddenIO.some((hidden) => hidden.enabled);

    if (!sampleEnabled) {
      newErrors.sampleIO = "At least one sample I/O must be enabled.";
    }
    if (!hiddenEnabled) {
      newErrors.hiddenIO = "At least one hidden I/O must be enabled.";
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length === 0 && sampleEnabled && hiddenEnabled
    );
  };

  const handleSampleChange = (index, field, value) => {
    const updatedSampleIO = [...sampleIO];
    updatedSampleIO[index][field] = value;
    setSampleIO(updatedSampleIO);
  };

  const handleHiddenChange = (index, field, value) => {
    const updatedHiddenIO = [...hiddenIO];
    updatedHiddenIO[index][field] = value;
    setHiddenIO(updatedHiddenIO);
  };

  const handleLanguageChange = (index, field, value) => {
    if (field === "language") {
      // Check for duplicate languages
      if (
        languageIO.some((lang, i) => lang.language === value && i !== index)
      ) {
        toast.error("Language already selected. Please choose another.");
        setErrors((prevErrors) => ({
          ...prevErrors,
          [`language${index}`]:
            "Language already selected. Please choose another.",
        }));
        return; // Do not update the state if there's a duplicate
      } else {
        // Clear any previous error for this index
        setErrors((prevErrors) => ({
          ...prevErrors,
          [`language${index}`]: "",
        }));
      }
    }

    const updatedLanguageIO = [...languageIO];
    updatedLanguageIO[index][field] = value;
    setLanguageIO(updatedLanguageIO);
  };

  const handleDeleteSampTestcase = (type, index) => {
    setTestCaseType(type);
    setTestcaseToDelete(index);
    setOpenDialog(true);
  };

  const handleDeleteTestcase = (type, index) => {
    setTestCaseType(type);
    setTestcaseToDelete(index);
    setOpenDialog(true);
  };

  const handleDeleteLanguage = (type, index) => {
    setTestCaseType(type);
    setTestcaseToDelete(index);
    setOpenDialog(true);
  };

  const removeTestCase = () => {
    const testcase = testcaseToDelete;
    if (testCaseType === "sample") {
      if (sampleIO.length > 1) {
        const updatedSampleIO = sampleIO.filter((_, i) => i !== testcase);
        setSampleIO(updatedSampleIO);
      }
    } else if (testCaseType === "hidden") {
      if (hiddenIO.length > 1) {
        const updatedHiddenIO = hiddenIO.filter((_, i) => i !== testcase);
        setHiddenIO(updatedHiddenIO);
      }
    } else if (testCaseType === "lang") {
      if (languageIO.length > 1) {
        const updatedLanguageIO = languageIO.filter((_, i) => i !== testcase);
        setLanguageIO(updatedLanguageIO);
      }
    }
    setOpenDialog(false);
  };

  const handleSampChange = (event, newValue) => {
    setSampValue(newValue);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLangChange = (event, newValue) => {
    setLangValue(newValue);
  };

  const handleAddSampTestCase = () => {
    addSampleIO(); // Function to add a new test case
    setSampValue(sampleIO.length); // Set the new tab as active
  };

  const handleAddTestCase = () => {
    addHiddenIO(); // Function to add a new test case
    setValue(hiddenIO.length); // Set the new tab as active
  };

  const handleAddLanguage = () => {
    addLanguageIO(); // Function to add a new test case
    setLangValue(languageIO.length); // Set the new tab as active
  };

  const handleDeleteSampTestcaseWithNavigation = (index) => {
    // Determine new tab index
    const newIndex = index === sampleIO.length - 1 ? index - 1 : index;
    handleDeleteSampTestcase("sample", index); // Perform deletion
    setSampValue(Math.max(newIndex, 0)); // Set new active tab
  };

  const handleDeleteTestcaseWithNavigation = (index) => {
    // Determine new tab index
    const newIndex = index === hiddenIO.length - 1 ? index - 1 : index;
    handleDeleteTestcase("hidden", index); // Perform deletion
    setValue(Math.max(newIndex, 0)); // Set new active tab
  };

  const handleDeleteLangWithNavigation = (index) => {
    // Determine new tab index
    const newIndex = index === languageIO.length - 1 ? index - 1 : index;
    handleDeleteLanguage("lang", index); // Perform deletion
    setLangValue(Math.max(newIndex, 0)); // Set new active tab
  };

  const scrollTabsSample = (direction) => {
    if (tabsContainerSampRef.current) {
      const container = tabsContainerSampRef.current;
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollLeftSamp += scrollAmount;
      setScrollLeftSamp(container.scrollLeftSamp);
    }
  };

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollLeft += scrollAmount;
      setScrollLeft(container.scrollLeft);
    }
  };

  const scrollTabsLang = (direction) => {
    if (tabsContainerLangRef.current) {
      const container = tabsContainerLangRef.current;
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollLeftLang += scrollAmount;
      setScrollLeftLang(container.scrollLeftLang);
    }
  };

  const addSampleIO = () => {
    setSampleIO([
      ...sampleIO,
      { input: "", output: "", explanation: "", enabled: true },
    ]);
    setTimeout(() => {
      sampleRefs.current[sampleIO.length]?.scrollIntoView({
        behavior: "smooth",
      });
    }, 0);
  };

  const addHiddenIO = () => {
    setHiddenIO([...hiddenIO, { input: "", output: "", enabled: true }]);
    setTimeout(() => {
      hiddenRefs.current[hiddenIO.length]?.scrollIntoView({
        behavior: "smooth",
      });
    }, 0);
  };

  const addLanguageIO = () => {
    setLanguageIO([
      ...languageIO,
      { language: "", mainfunc: "", userfunc: "", enabled: true },
    ]);
    setTimeout(() => {
      languageRefs.current[languageIO.length]?.scrollIntoView({
        behavior: "smooth",
      });
    }, 0);
  };

  const toggleSampleIO = (index) => {
    setSampleIO((prev) => {
      // Count how many test cases are currently enabled
      const enabledTestCases = prev.filter((sample) => sample.enabled).length;

      // Check if the current sample is the last enabled one
      if (enabledTestCases === 1 && prev[index].enabled) {
        toast("At least one sample testcase must be enabled.", {
          icon: "⚠️",
          style: {
            padding: "16px",
            color: "black",
            background: "white",
          },
        });
        return prev; // Return the previous state without changes
      }

      // Toggle the enabled state of the selected sample
      return prev.map((sample, i) =>
        i === index ? { ...sample, enabled: !sample.enabled } : sample
      );
    });
  };

  const toggleHiddenIO = (index) => {
    setHiddenIO((prev) => {
      // Count how many test cases are currently enabled
      const enabledTestCases = prev.filter((hidden) => hidden.enabled).length;

      // Check if the current hidden testcase is the last enabled one
      if (enabledTestCases === 1 && prev[index].enabled) {
        toast("At least one hidden testcase must be enabled.", {
          icon: "⚠️",
          style: {
            padding: "16px",
            color: "black",
            background: "white",
          },
        });
        return prev; // Return the previous state without changes
      }

      // Toggle the enabled state of the selected hidden testcase
      return prev.map((hidden, i) =>
        i === index ? { ...hidden, enabled: !hidden.enabled } : hidden
      );
    });
  };

  const toggleLangIO = (index) => {
    setLanguageIO((prev) => {
      // Count how many test cases are currently enabled
      const enabledLanguage = prev.filter(
        (language) => language.enabled
      ).length;

      // Check if the current hidden testcase is the last enabled one
      if (enabledLanguage === 1 && prev[index].enabled) {
        toast("At least one language must be enabled.", {
          icon: "⚠️",
          style: {
            padding: "16px",
            color: "black",
            background: "white",
          },
        });
        return prev; // Return the previous state without changes
      }

      // Toggle the enabled state of the selected hidden testcase
      return prev.map((language, i) =>
        i === index ? { ...language, enabled: !language.enabled } : language
      );
    });
  };

  // Check for duplicate sample inputs
  const hasDuplicateSampleInputs = () => {
    const inputs = sampleIO
      .map((sample) => sample.input.trim())
      .filter((input) => input !== "");
    return new Set(inputs).size !== inputs.length;
  };

  // Check for duplicate hidden inputs
  const hasDuplicateHiddenInputs = () => {
    const inputs = hiddenIO
      .map((hidden) => hidden.input.trim())
      .filter((input) => input !== "");
    return new Set(inputs).size !== inputs.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Ensure that there are no duplicate test cases (if required)
    if (
      sampleIO.some((sample) => sample.input.trim() !== "") &&
      hasDuplicateSampleInputs()
    ) {
      toast.error("Duplicate sample inputs are not allowed.");
      return;
    }

    if (
      hiddenIO.some((hidden) => hidden.input.trim() !== "") &&
      hasDuplicateHiddenInputs()
    ) {
      toast.error("Duplicate hidden inputs are not allowed.");
      return;
    }
    const trimString = (str) => (typeof str === "string" ? str.trim() : str);

    const trimObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map((item) => trimObject(item));
      } else if (typeof obj === "object" && obj !== null) {
        return Object.keys(obj).reduce((acc, key) => {
          acc[key] = trimObject(obj[key]);
          return acc;
        }, {});
      }
      return trimString(obj);
    };

    const problemData = {
      title: problemTitle,
      description,
      sampleIO, // Include both enabled and disabled sample test cases
      hiddenIO, // Include both enabled and disabled hidden test cases
      languageIO,
    };

    const trimmedProblemData = trimObject(problemData);

    // Save trimmedProblemData or move to the next step

    console.log("Problem Data to be sent:", problemData); // Log the data

    try {
      const response = await fetch(
        `http://localhost/practice/server/php/${
          isEditing ? "updateProblem.php" : "addProblem.php"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...trimmedProblemData, id }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.success) {
        toast.success(
          `Problem ${isEditing ? "updated" : "saved"} successfully!`
        );
        navigate("/");
      } else {
        toast(data.error);
        navigate("/");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while saving the problem.");
    }
  };

  return (
    <div className="Problem">
      <form className="Form_Container" onSubmit={handleSubmit}>
        <div className="Form_Header">
          <button
            type="button"
            className="back_btn"
            onClick={() => navigate(-1)} // Navigate back when clicked
          >
            <span className="material-icons">arrow_back</span>
          </button>
          <p className="Form_Title">
            {isEditing ? "Edit Problem" : "Create a Problem"}
          </p>
        </div>
        <div className="Problem_Title">
          <label className="Problem_title_label">Problem Title :</label>
          <div className="input_feild">
            <input
              placeholder="Enter Problem Title"
              type="text"
              value={problemTitle}
              onChange={(e) => {
                setProblemTitle(e.target.value);
              }}
              className={`input ${errors.problemTitle ? "error" : ""}`}
            />
            {errors.problemTitle && (
              <p className="error_message">{errors.problemTitle}</p>
            )}
          </div>
        </div>
        <div className="Problem_Description">
          <label className="Problem_description_label">Description :</label>
          <div className="input_feild">
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className={`input ${
                errors.description ? "error" : ""
              } textarea_description`}
            />
            {errors.description && (
              <p className="error_message">{errors.description}</p>
            )}
          </div>
        </div>

        <Box>
          <Box
            fontSize={20}
            fontWeight={500}
            paddingTop={1.5}
            paddingLeft={2}
            paddingBottom={2}
          >
            Sample Testcase
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => scrollTabsSample("left")}
              disabled={scrollLeftSamp <= 0}
            ></IconButton>
            <Box ref={tabsContainerSampRef} flexGrow={1} overflow="auto">
              <Tabs
                value={sampValue}
                onChange={handleSampChange}
                aria-label="hidden test cases tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {sampleIO.map((_, index) => (
                  <Tab
                    key={index}
                    label={`Testcase ${index + 1}`}
                    sx={{ "&:hover": { backgroundColor: "transparent" } }}
                  />
                ))}
                <Tab
                  icon={<Add />}
                  onClick={handleAddSampTestCase}
                  sx={{ "&:hover": { backgroundColor: "transparent" } }}
                />
              </Tabs>
            </Box>
            <IconButton onClick={() => scrollTabsSample("right")}></IconButton>
          </Box>
          <Box>
            {sampleIO.map((sample, index) => (
              <div
                key={index}
                hidden={sampValue !== index}
                className={`sample_feild ${sample.enabled ? "" : "disabled"}`}
              >
                <div className="headio">
                  <h4 className="sample_input_head"></h4>
                  <div className="siohio_btn">
                    {sampleIO.length > 0 && (
                      <div className="remove_btn_div">
                        <button
                          className="remove_btn"
                          type="button"
                          onClick={() =>
                            handleDeleteSampTestcaseWithNavigation(index)
                          }
                          disabled={sampleIO.length === 1}
                        >
                          <span className="material-icons">delete_forever</span>
                        </button>
                      </div>
                    )}
                    <div className="toggle_btn_div">
                      <button
                        type="button"
                        className={`toggle_btn ${
                          sample.enabled ? "enabled" : "disabled"
                        }`}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={sample.enabled}
                              onChange={() => toggleSampleIO(index)}
                            />
                          }
                          label={sample.enabled ? "Enabled" : "Disabled"}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <Box className="sample_input_output hidden_body">
                  <Box className="sample_input">
                    <label className="sample_input_label">Input :</label>
                    <div className="input_feild">
                      <textarea
                        placeholder="Sample Input"
                        value={sample.input}
                        onChange={(e) =>
                          handleSampleChange(index, "input", e.target.value)
                        }
                        disabled={!sample.enabled}
                        fullWidth
                        multiline
                      />
                    </div>
                  </Box>
                  <Box className="sample_output">
                    <label className="sample_output_label">Output :</label>
                    <div className="input_feild">
                      <textarea
                        placeholder="Output"
                        value={sample.output}
                        onChange={(e) =>
                          handleSampleChange(index, "output", e.target.value)
                        }
                        className={`input ${
                          errors[`sampleOutput${index}`] ? "error" : ""
                        }`}
                        error={Boolean(errors[`sampleOutput${index}`])}
                        helperText={errors[`sampleOutput${index}`]}
                        disabled={!sample.enabled}
                        fullWidth
                        multiline
                      />
                      {errors[`sampleOutput${index}`] && (
                        <p className="error_message">
                          {errors[`sampleOutput${index}`]}
                        </p>
                      )}
                    </div>
                  </Box>
                  <Box className="sample_output">
                    <label className="sample_output_label">
                      Explaination :
                    </label>
                    <div className="input_feild">
                      <textarea
                        placeholder="Explanation"
                        value={sample.explanation}
                        onChange={(e) =>
                          handleSampleChange(
                            index,
                            "explanation",
                            e.target.value
                          )
                        }
                        className={`input ${
                          errors[`sampleExplanation${index}`] ? "error" : ""
                        }`}
                        error={Boolean(errors[`sampleExplanation${index}`])}
                        helperText={errors[`sampleExplanation${index}`]}
                        disabled={!sample.enabled}
                        fullWidth
                        multiline
                      />
                      {errors[`sampleExplanation${index}`] && (
                        <p className="error_message">
                          {errors[`sampleExplanation${index}`]}
                        </p>
                      )}
                    </div>
                  </Box>
                </Box>
              </div>
            ))}
          </Box>
        </Box>

        <Box>
          <Box
            fontSize={20}
            fontWeight={500}
            paddingTop={1.5}
            paddingLeft={2}
            paddingBottom={2}
          >
            Hidden Testcase
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => scrollTabs("left")}
              disabled={scrollLeft <= 0}
            ></IconButton>
            <Box ref={tabsContainerRef} flexGrow={1} overflow="auto">
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="hidden test cases tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {hiddenIO.map((_, index) => (
                  <Tab
                    key={index}
                    label={`Testcase ${index + 1}`}
                    sx={{ "&:hover": { backgroundColor: "transparent" } }}
                  />
                ))}
                <Tab
                  icon={<Add />}
                  onClick={handleAddTestCase}
                  sx={{ "&:hover": { backgroundColor: "transparent" } }}
                />
              </Tabs>
            </Box>
            <IconButton onClick={() => scrollTabs("right")}></IconButton>
          </Box>
          <Box>
            {hiddenIO.map((hidden, index) => (
              <div
                key={index}
                hidden={value !== index}
                className={`sample_feild ${hidden.enabled ? "" : "disabled"}`}
              >
                <div className="headio">
                  <h4 className="sample_input_head"></h4>
                  <div className="siohio_btn">
                    {hiddenIO.length > 0 && (
                      <div className="remove_btn_div">
                        <button
                          className="remove_btn"
                          type="button"
                          onClick={() =>
                            handleDeleteTestcaseWithNavigation(index)
                          }
                          disabled={hiddenIO.length === 1}
                        >
                          <span className="material-icons">delete_forever</span>
                        </button>
                      </div>
                    )}
                    <div className="toggle_btn_div">
                      <button
                        type="button"
                        className={`toggle_btn ${
                          hidden.enabled ? "enabled" : "disabled"
                        }`}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={hidden.enabled}
                              onChange={() => toggleHiddenIO(index)}
                            />
                          }
                          label={hidden.enabled ? "Enabled" : "Disabled"}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <Box className="sample_input_output hidden_body">
                  <Box className="sample_input">
                    <label className="sample_input_label">Input :</label>
                    <div className="input_feild">
                      <textarea
                        placeholder="Hidden Input"
                        value={hidden.input}
                        onChange={(e) =>
                          handleHiddenChange(index, "input", e.target.value)
                        }
                        disabled={!hidden.enabled}
                        fullWidth
                        multiline
                      />
                    </div>
                  </Box>
                  <Box className="sample_output">
                    <label className="sample_output_label">Output :</label>
                    <div className="input_feild">
                      <textarea
                        placeholder="Explaination"
                        value={hidden.output}
                        onChange={(e) =>
                          handleHiddenChange(index, "output", e.target.value)
                        }
                        className={`input ${
                          errors[`hiddenOutput${index}`] ? "error" : ""
                        }`}
                        error={Boolean(errors[`hiddenOutput${index}`])}
                        helperText={errors[`hiddenOutput${index}`]}
                        disabled={!hidden.enabled}
                        fullWidth
                        multiline
                      />
                      {errors[`hiddenOutput${index}`] && (
                        <p className="error_message">
                          {errors[`hiddenOutput${index}`]}
                        </p>
                      )}
                    </div>
                  </Box>
                </Box>
              </div>
            ))}
          </Box>
        </Box>

        <Box>
          <Box
            fontSize={20}
            fontWeight={500}
            paddingTop={1.5}
            paddingLeft={2}
            paddingBottom={2}
          >
            Code Basic
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => scrollTabsLang("left")}
              disabled={scrollLeftLang <= 0}
            ></IconButton>
            <Box ref={tabsContainerLangRef} flexGrow={1} overflow="auto">
              <Tabs
                value={langValue}
                onChange={handleLangChange}
                aria-label="hidden test cases tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {languageIO.map((_, index) => (
                  <Tab
                    key={index}
                    label={`Language ${index + 1}`}
                    sx={{ "&:hover": { backgroundColor: "transparent" } }}
                  />
                ))}
                <Tab
                  icon={<Add />}
                  onClick={handleAddLanguage}
                  sx={{ "&:hover": { backgroundColor: "transparent" } }}
                />
              </Tabs>
            </Box>
            <IconButton onClick={() => scrollTabsLang("right")}></IconButton>
          </Box>
          <Box>
            {languageIO.map((language, index) => (
              <div
                key={index}
                hidden={langValue !== index}
                className={`sample_feild ${language.enabled ? "" : "disabled"}`}
              >
                <div className="headio">
                  <h4 className="sample_input_head"></h4>
                  <div className="siohio_btn">
                    {languageIO.length > 0 && (
                      <div className="remove_btn_div">
                        <button
                          className="remove_btn"
                          type="button"
                          onClick={() => handleDeleteLangWithNavigation(index)}
                          disabled={languageIO.length === 1}
                        >
                          <span className="material-icons">delete_forever</span>
                        </button>
                      </div>
                    )}
                    <div className="toggle_btn_div">
                      <button
                        type="button"
                        className={`toggle_btn ${
                          language.enabled ? "enabled" : "disabled"
                        }`}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={language.enabled}
                              onChange={() => toggleLangIO(index)}
                            />
                          }
                          label={language.enabled ? "Enabled" : "Disabled"}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <Box className="sample_input_output hidden_body">
                  <Box className="select_language sample_input">
                    <label className="select_language_label">
                      Select Language:
                    </label>
                    <div className="input_field">
                      <select
                        value={language.language}
                        onChange={(e) =>
                          handleLanguageChange(
                            index,
                            "language",
                            e.target.value
                          )
                        }
                        disabled={!language.enabled}
                      >
                        <option value="">Select a language</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                      </select>
                      {errors[`language${index}`] && (
                        <p className="error_message">
                          {errors[`language${index}`]}
                        </p>
                      )}
                    </div>
                  </Box>
                  <Box className="sample_input">
                    <label className="sample_input_label">
                      Main Function :
                    </label>
                    <div className="input_feild">
                      <textarea
                        className="function_code"
                        placeholder="Main Function"
                        value={language.mainfunc}
                        onChange={(e) =>
                          handleLanguageChange(
                            index,
                            "mainfunc",
                            e.target.value
                          )
                        }
                        disabled={!language.enabled}
                        fullWidth
                        multiline
                      />
                    </div>
                  </Box>
                  <Box className="sample_output">
                    <label className="sample_output_label">
                      User Function :
                    </label>
                    <div className="input_feild">
                      <textarea
                        placeholder="User Function"
                        value={language.userfunc}
                        onChange={(e) =>
                          handleLanguageChange(
                            index,
                            "userfunc",
                            e.target.value
                          )
                        }
                        className={`function_code input ${
                          errors[`hiddenOutput${index}`] ? "error" : ""
                        }`}
                        error={Boolean(errors[`hiddenOutput${index}`])}
                        helperText={errors[`hiddenOutput${index}`]}
                        disabled={!language.enabled}
                        fullWidth
                        multiline
                      />
                      {errors[`hiddenOutput${index}`] && (
                        <p className="error_message">
                          {errors[`hiddenOutput${index}`]}
                        </p>
                      )}
                    </div>
                  </Box>
                </Box>
              </div>
            ))}
          </Box>
        </Box>

        <div className="create_btn_div">
          <button className="create_btn" type="submit">
            {isEditing ? "Update Problem" : "Create Problem"}
          </button>
        </div>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Confirm Deletion"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this testcase?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} className="cancel">
              Cancel
            </Button>
            <Button onClick={removeTestCase} className="delete1" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    </div>
  );
}

export default Problem;
