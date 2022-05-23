import PropTypes from "prop-types";

const RoutesView = ({ routes }) => {
  return (
    <div className="content">
      <p className="content__title">Routes</p>
      <ul>
        {routes.map((route) => {
          return (
            <li
              key={route.id}
              data-testid={`route-${route.id}`}
              className="routes-collection-item"
            >
              {JSON.stringify(route)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

RoutesView.propTypes = {
  routes: PropTypes.array,
};

export default RoutesView;
