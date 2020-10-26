import PropTypes from "prop-types";

const format = (value) => {
  return typeof value === "boolean" ? value.toString() : value;
};

const AboutView = ({ about }) => {
  return (
    <div className="content">
      <p className="content__title">About</p>
      <ul>
        {Object.keys(about).map((key) => {
          return (
            <li key={key}>
              <b>{key}</b>: <span data-testid={`about-${key}`}>{format(about[key])}</span>
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
