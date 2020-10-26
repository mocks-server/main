import PropTypes from "prop-types";

const BehaviorsView = ({ behaviors }) => {
  return (
    <div className="content">
      <p className="content__title">Behaviors</p>
      <ul>
        {behaviors.map((behavior) => {
          return (
            <li
              key={behavior.name}
              data-testid={`behavior-${behavior.name}`}
              className="behaviors-collection-item"
            >
              {JSON.stringify(behavior)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

BehaviorsView.propTypes = {
  behaviors: PropTypes.array,
};

export default BehaviorsView;
