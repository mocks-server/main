import { useData } from "@data-provider/react";
import { alerts } from "@mocks-server/admin-api-client-data-provider";

const Alerts = () => {
  const data = useData(alerts);
  return (
    <div className="content">
      <p className="content__title">Alerts</p>
      <ul>
        {data.map((alert) => {
          return (
            <li
              key={alert.id}
              data-testid={`alert-${alert.id}`}
              className="alerts-collection-item"
            >
              {JSON.stringify(alert)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Alerts;
