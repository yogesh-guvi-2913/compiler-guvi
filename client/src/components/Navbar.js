import React from "react";
import "../styles/Home.scss";
import logo from "../assets/guvi_logo.png";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const handleCreateProblem = () => {
    navigate("/problem");
  };

  const handleTakeTest = async () => {
    try {
      const response = await fetch(
        "http://localhost/practice/server/php/takeTest.php"
      );
      const problemIds = await response.json();

      if (problemIds.length === 0) {
        alert("No problems found.");
        return;
      }

      const randomId =
        problemIds[Math.floor(Math.random() * problemIds.length)];
      navigate(`/test/${randomId}`);
    } catch (error) {
      console.error("Error fetching problem IDs:", error);
      alert("An error occurred while fetching problem IDs.");
    }
  };
  return (
    <div className="nav_content">
      <div className="nav_img">
        <img src={logo} alt="logo" width={50} height={50} />
        <p className="logo_name">Guvi</p>
      </div>
      <div className="home_top">
        <div className="home_button">
          <button className="button_home-pro" onClick={handleCreateProblem}>
            Create Problem
          </button>
          <button className="button_home-test1" onClick={handleTakeTest}>
            Take Test
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
