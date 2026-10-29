package com.example.ecommerce.order.dto;
    import jakarta.validation.constraints.*;
import java.math.BigDecimal;

    public class OrderRequest {
        @NotNull @Positive
    private Long userId;
    @NotNull @Positive
    private Long productId;
    @NotNull @Min(1)
    private Integer quantity;
        public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
