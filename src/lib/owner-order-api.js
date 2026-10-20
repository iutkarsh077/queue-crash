export async function patchOrderStatus(id, status) {
  const response = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Order update failed. Try again.");
  }
  return data;
}
