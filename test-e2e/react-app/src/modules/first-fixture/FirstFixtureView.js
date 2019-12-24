import React from "react";
import PropTypes from "prop-types";

const FirstFixtureView = ({ fixture }) => {
  return (
    <div className="content">
      <p className="content__title">First Fixture</p>
      <p>{JSON.stringify(fixture)}</p>
    </div>
  );
};

FirstFixtureView.propTypes = {
  fixture: PropTypes.object
};

export default FirstFixtureView;
