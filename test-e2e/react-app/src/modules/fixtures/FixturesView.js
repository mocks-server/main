import React from "react";
import PropTypes from "prop-types";

const FixturesView = ({ fixtures }) => {
  return (
    <div className="content">
      <p className="content__title">Current Fixtures</p>
      <ul>
        {fixtures.map(fixture => {
          return <li key={fixture.id}>{JSON.stringify(fixture)}</li>;
        })}
      </ul>
    </div>
  );
};

FixturesView.propTypes = {
  fixtures: PropTypes.array
};

export default FixturesView;
