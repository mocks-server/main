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

const SettingsView = ({ settings }) => {
  return (
    <div className="content">
      <p className="content__title">Current Settings</p>
      <ul>
        {Object.keys(settings).map((key) => {
          return (
            <li key={key}>
              <b>{key}</b>: <span data-testid={`settings-${key}`}>{format(settings[key])}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

SettingsView.propTypes = {
  settings: PropTypes.object,
};

export default SettingsView;
