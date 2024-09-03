import React from "react";
import { useParams } from "react-router-dom";
import Problem from "../components/Problem";
import "../styles/EditProblem.scss";

function EditProblem() {
  const { id } = useParams();
  return (
    <div className="Edit_Problem">
      <Problem id={id} />
    </div>
  );
}

export default EditProblem;
