/** Orders vehicles for display. "featured" keeps the order the server sent. */
export function sortVehicles(vehicles, mode) {
  if (mode === 'price-asc') return [...vehicles].sort((a, b) => a.price - b.price);
  if (mode === 'price-desc') return [...vehicles].sort((a, b) => b.price - a.price);
  return vehicles;
}