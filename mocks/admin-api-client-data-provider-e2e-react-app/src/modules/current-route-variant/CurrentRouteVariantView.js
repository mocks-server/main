import PropTypes from "prop-types";
import { settings } from "@mocks-server/admin-api-client-data-provider";

const CurrentRouteVariantView = ({ mock, routeVariant }) => {
  const setBehaviorBase = () => {
    settings.update({
      mock: "base",
    });
  };

  const setBehaviorUser2 = () => {
    settings.update({
      mock: "user2",
    });
  };

  return (
    <div className="content">
      <p className="content__title">
        Current Mock: <span data-testid="current-mock-id">{mock.id}</span>
      </p>
      <p data-testid="current-mock">{JSON.stringify(mock)}</p>
      <p className="content__title">
        Current Route Variant:{" "}
        <span data-testid="current-route-variant-id">{routeVariant.id}</span>
      </p>
      <p data-testid="current-route-variant">{JSON.stringify(routeVariant)}</p>
      <button onClick={setBehaviorBase} data-testid="set-mock-base">
        Set mock base
      </button>
      <button onClick={setBehaviorUser2} data-testid="set-mock-user2">
        Set mock user2
      </button>
    </div>
  );
};

CurrentRouteVariantView.propTypes = {
  mock: PropTypes.object,
  routeVariant: PropTypes.object,
};

export default CurrentRouteVariantView;
