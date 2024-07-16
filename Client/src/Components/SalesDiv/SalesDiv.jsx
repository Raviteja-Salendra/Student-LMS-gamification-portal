import React from "react";

const SalesDiv = ({ Icon, Title, Number }) => {
  return (
    <center>
      <li style={{ display: "flex" }}>
        {/* <div>{Icon}</div> */}
        <span className="text">
          <h2>{Number}</h2>
          <p>{Title}</p>
        </span>
      </li>
    </center>
  );
};

export default SalesDiv;
