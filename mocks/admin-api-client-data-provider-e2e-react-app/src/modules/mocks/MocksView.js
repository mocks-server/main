import PropTypes from "prop-types";

const MocksView = ({ mocks }) => {
  return (
    <div className="content">
      <p className="content__title">Mocks</p>
      <ul>
        {mocks.map((mock) => {
          return (
            <li key={mock.id} data-testid={`mock-${mock.id}`} className="mocks-collection-item">
              {JSON.stringify(mock)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

MocksView.propTypes = {
  mocks: PropTypes.array,
};

export default MocksView;
