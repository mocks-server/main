import React from "react";
import PropTypes from "prop-types";

const BehaviorsView = ({ behaviors }) => {
  return (
    <div className="content">
      <p className="content__title">Current Behaviors</p>
      <ul>
        {behaviors.map(behavior => {
          return <li key={behavior.name}>{JSON.stringify(behavior)}</li>;
        })}
      </ul>
    </div>
  );
};

BehaviorsView.propTypes = {
  behaviors: PropTypes.array
};

export default BehaviorsView;
