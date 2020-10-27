import PropTypes from "prop-types";
import { settings } from "@mocks-server/admin-api-client-data-provider";

const CurrentBehaviorView = ({ behavior, fixture }) => {
  const setBehaviorBase = () => {
    settings.update({
      behavior: "base",
    });
  };

  const setBehaviorUser2 = () => {
    settings.update({
      behavior: "user2",
    });
  };

  return (
    <div className="content">
      <p className="content__title">
        Current Behavior: <span data-testid="current-behavior-name">{behavior.name}</span>
      </p>
      <p data-testid="current-behavior">{JSON.stringify(behavior)}</p>
      <p className="content__title">
        Current Fixture: <span data-testid="current-fixture-id">{fixture.id}</span>
      </p>
      <p data-testid="current-fixture">{JSON.stringify(fixture)}</p>
      <button onClick={setBehaviorBase} data-testid="set-behavior-base">
        Set behavior base
      </button>
      <button onClick={setBehaviorUser2} data-testid="set-behavior-user2">
        Set behavior user2
      </button>
    </div>
  );
};

CurrentBehaviorView.propTypes = {
  behavior: PropTypes.object,
  fixture: PropTypes.object,
};

export default CurrentBehaviorView;
