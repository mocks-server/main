import PropTypes from "prop-types";

const format = (value) => {
  return typeof value === "boolean" ? value.toString() : value;
};

const SettingsView = ({ settings }) => {
  return (
    <div className="content">
      <p className="content__title">Current Settings</p>
      <ul>
        {Object.keys(settings).map((key) => {
          return (
            <li key={key}>
              <b>{key}</b>: <span data-testid={`settings-${key}`}>{format(settings[key])}</span>
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
