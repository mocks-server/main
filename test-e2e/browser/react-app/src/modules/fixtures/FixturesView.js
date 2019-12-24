import React from "react";
import PropTypes from "prop-types";

const FixturesView = ({ fixtures }) => {
  return (
    <div className="content">
      <p className="content__title">Fixtures</p>
      <ul>
        {fixtures.map(fixture => {
          return (
            <li
              key={fixture.id}
              data-testid={`fixture-${fixture.id}`}
              className="fixtures-collection-item"
            >
              {JSON.stringify(fixture)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

FixturesView.propTypes = {
  fixtures: PropTypes.array
};

export default FixturesView;
