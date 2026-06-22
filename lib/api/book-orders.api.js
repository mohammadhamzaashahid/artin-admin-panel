import { api } from "@/lib/api/axios";

export async function listBookOrders(params = {}) {
  const res = await api.get("/api/admin/orders/books", { params });
  return res.data;
}

export async function getBookOrder(orderId) {
  const res = await api.get(`/api/admin/orders/books/${orderId}`);
  return res.data;
}

export async function updateBookOrderStatus(orderId, payload) {
  const res = await api.patch(`/api/admin/orders/books/${orderId}/status`, payload);
  return res.data;
}
