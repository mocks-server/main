function filterMockRoutesVariants(mockRoutesVariants, nextRoutesVariants) {
  return mockRoutesVariants.filter((mockRouteVariant) => {
    return !nextRoutesVariants.find((nextRouteVariant) => {
      return mockRouteVariant.routeId === nextRouteVariant.routeId;
    });
  });
}

function getMockRoutesVariants(mock, mocks, routesVariants, nextRoutesVariants = []) {
  const mockRoutesVariants = mock.routesVariants
    .map((routeId) => {
      const mockRoute = routesVariants.find((routeVariant) => routeVariant.variantId === routeId);
      if (!mockRoute) {
        // TODO, add alert
      }
      return mockRoute;
    })
    .filter((route) => !!route);
  if (mock.from) {
    const from = mocks.find((mockCandidate) => mockCandidate.id === mock.from);
    return getMockRoutesVariants(
      from,
      mocks,
      routesVariants,
      filterMockRoutesVariants(mockRoutesVariants, nextRoutesVariants).concat(nextRoutesVariants)
    );
  }
  return filterMockRoutesVariants(mockRoutesVariants, nextRoutesVariants).concat(
    nextRoutesVariants
  );
}

function getVariantId(routeId, variantId) {
  return `${routeId}:${variantId}`;
}

module.exports = {
  getMockRoutesVariants,
  getVariantId,
};
