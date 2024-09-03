import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/Home.scss";
import Navbar from "../components/Navbar";
import { Tooltip } from "@mui/material";

const theme = createTheme();

function Home() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expanded, setExpanded] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProblems = async () => {
      try {
        const response = await fetch(
          "http://localhost/practice/server/php/getProblems.php"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (!data.error && isMounted) {
          // Check if component is still mounted before updating state
          const problemsWithId = data.map((problem) => ({
            ...problem,
            id: problem._id,
          }));
          setProblems(problemsWithId);
          if (problemsWithId.length > 0) {
            setExpanded(problemsWithId[0].id); // Default to expanding the first accordion
          }
        } else if (data.error) {
          console.error(data.error);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching problems:", error);
        }
      }
    };

    fetchProblems();

    return () => {
      isMounted = false; // Clean up to avoid updating state after unmount
    };
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = problems.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(problems.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePlayProblem = (id) => {
    navigate(`/test/${id}`);
  };

  const handleEditProblem = (id) => {
    navigate(`/update/${id}`);
  };

  const handleDeleteProblem = (id) => {
    setProblemToDelete(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        "http://localhost/practice/server/php/deleteProblem.php",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: problemToDelete }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Problem deleted successfully.");
        setProblems(
          problems.filter((problem) => problem.id !== problemToDelete)
        );
      } else {
        toast.error(
          result.error || "An error occurred while deleting the problem."
        );
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
      toast.error("An error occurred while deleting the problem.");
    } finally {
      setOpenDialog(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className="home">
      <Navbar />
      <div className="home_content">
        <div className="home_table">
          <div>
            <p className="acc_tit">List of Problems</p>
          </div>
          {currentItems.map((item, index) => (
            <Accordion
              key={item.id}
              expanded={expanded === item.id}
              onChange={handleAccordionChange(item.id)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${item.id}-content`}
                id={`panel${item.id}-header`}
              >
                <Typography>
                  {indexOfFirstItem + index + 1}. {item.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{item.description}</Typography>
                <div className="accordion-actions">
                  <Tooltip title="Test" arrow>
                    <IconButton onClick={() => handlePlayProblem(item.id)}>
                      <PlayCircleIcon className="play" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit" arrow>
                    <IconButton onClick={() => handleEditProblem(item.id)}>
                      <EditIcon className="edit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete" arrow>
                    <IconButton onClick={() => handleDeleteProblem(item.id)}>
                      <DeleteIcon className="delete" />
                    </IconButton>
                  </Tooltip>
                </div>
              </AccordionDetails>
            </Accordion>
          ))}

          <div className="home_table_down">
            <div className="home_table_down_page">
              <label htmlFor="itemsPerPage" className="form-label">
                Items per page:
              </label>
              <select
                id="itemsPerPage"
                className="form-select"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            <ThemeProvider theme={theme}>
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  variant="outlined"
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "black",
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                      backgroundColor: "#24172c",
                      color: "white",
                      border: "1px solid white",
                    },
                    "& .MuiPaginationItem-root:hover": {
                      backgroundColor: "#24172c !important",
                      color: "white",
                    },
                    "& .MuiPaginationItem-ellipsis": {
                      color: "black",
                    },
                  }}
                />
              </Stack>
            </ThemeProvider>
          </div>
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
              Are you sure you want to delete this problem?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} className="cancel">
              Cancel
            </Button>
            <Button onClick={confirmDelete} className="delete1" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default Home;
