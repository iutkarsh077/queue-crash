"use client";

import { useState } from "react";
import { CreateOrderPanel } from "@/components/create-order-panel";
import { OwnerOrderList } from "@/components/owner-order-list";

export function OwnerWorkspace({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [createdOrder, setCreatedOrder] = useState(null);

  function onCreated(order) {
    if (!order?.id) {
      return;
    }
    setCreatedOrder(order);
    const row = {
      id: order.id,
      tokenNumber: order.tokenNumber,
      status: order.status,
      label: order.label || "",
    };
    setOrders((current) => [row, ...current.filter((item) => item.id !== row.id)]);
  }

  function onStatus(id, status) {
    setCreatedOrder((current) =>
      current?.id === id ? { ...current, status } : current,
    );
    setOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  return (
    <>
      <div className="mt-6">
        <CreateOrderPanel
          order={createdOrder}
          onCreated={onCreated}
          onStatus={onStatus}
        />
      </div>
      <OwnerOrderList orders={orders} onStatus={onStatus} />
    </>
  );
}
