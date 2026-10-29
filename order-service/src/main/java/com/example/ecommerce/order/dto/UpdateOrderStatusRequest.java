package com.example.ecommerce.order.dto;
import com.example.ecommerce.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
public class UpdateOrderStatusRequest {
  @NotNull private OrderStatus status;
  public OrderStatus getStatus() { return status; }
  public void setStatus(OrderStatus status) { this.status = status; }
}
