import PropTypes from "prop-types";

const format = (value) => {
  if (typeof value === "boolean") {
    return value.toString();
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
};

const SettingsView = ({ config }) => {
  return (
    <div className="content">
      <p className="content__title">Current Config</p>
      <ul>
        {Object.keys(config).map((key) => {
          return (
            <li key={key}>
              <b>{key}</b>: <span data-testid={`config-${key}`}>{format(config[key])}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

SettingsView.propTypes = {
  config: PropTypes.object,
};

export default SettingsView;
