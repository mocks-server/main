import PropTypes from "prop-types";
import { config } from "@mocks-server/admin-api-client-data-provider";

const CurrentRouteVariantView = ({ collection, variant }) => {
  const setBehaviorBase = () => {
    config.update({
      mock: {
        collections: {
          selected: "base",
        },
      },
    });
  };

  const setBehaviorUser2 = () => {
    config.update({
      mock: {
        collections: {
          selected: "user2",
        },
      },
    });
  };

  return (
    <div className="content">
      <p className="content__title">
        Current Collection: <span data-testid="current-collection-id">{collection.id}</span>
      </p>
      <p data-testid="current-collection">{JSON.stringify(collection)}</p>
      <p className="content__title">
        Current Route Variant: <span data-testid="current-variant-id">{variant.id}</span>
      </p>
      <p data-testid="current-variant">{JSON.stringify(variant)}</p>
      <button onClick={setBehaviorBase} data-testid="set-collection-base">
        Set collection base
      </button>
      <button onClick={setBehaviorUser2} data-testid="set-collection-user2">
        Set collection user2
      </button>
    </div>
  );
};

CurrentRouteVariantView.propTypes = {
  collection: PropTypes.object,
  variant: PropTypes.object,
};

export default CurrentRouteVariantView;
