import React from "react";
import PropTypes from "prop-types";

const FirstBehaviorView = ({ behavior }) => {
  return (
    <div className="content">
      <p className="content__title">First Behavior</p>
      <p>{JSON.stringify(behavior)}</p>
    </div>
  );
};

FirstBehaviorView.propTypes = {
  behavior: PropTypes.object
};

export default FirstBehaviorView;
