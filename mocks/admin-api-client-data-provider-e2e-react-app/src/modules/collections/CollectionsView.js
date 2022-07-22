import PropTypes from "prop-types";

const CollectionsView = ({ collections }) => {
  return (
    <div className="content">
      <p className="content__title">Mocks</p>
      <ul>
        {collections.map((collection) => {
          return (
            <li
              key={collection.id}
              data-testid={`collection-${collection.id}`}
              className="collections-collection-item"
            >
              {JSON.stringify(collection)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

CollectionsView.propTypes = {
  collections: PropTypes.array,
};

export default CollectionsView;
