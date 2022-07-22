import { useMemo } from "react";

import PropTypes from "prop-types";

const format = (value) => {
  return typeof value === "boolean" ? value.toString() : value;
};

const AboutView = ({ about }) => {
  const versions = useMemo(() => {
    return (about && about.versions) || {};
  }, [about]);

  return (
    <div className="content">
      <p className="content__title">About</p>
      <ul>
        {Object.keys(versions).map((key) => {
          return (
            <li key={key}>
              <b>{key}</b>:
              <span data-testid={`about-version-${key}`}>{format(versions[key])}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

AboutView.propTypes = {
  about: PropTypes.object,
};

export default AboutView;
