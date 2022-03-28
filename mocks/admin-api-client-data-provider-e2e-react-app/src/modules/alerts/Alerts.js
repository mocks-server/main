import { useData } from "@data-provider/react";
import { alerts } from "@mocks-server/admin-api-client-data-provider";

const Alerts = () => {
  const data = useData(alerts);
  return (
    <div className="content">
      <p className="content__title">Alerts</p>
      <ul>
        {data.map((alertModel) => {
          return (
            <li
              key={alertModel.id}
              data-testid={`alert-${alertModel.id}`}
              className="alerts-collection-item"
            >
              {JSON.stringify(alertModel)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Alerts;
