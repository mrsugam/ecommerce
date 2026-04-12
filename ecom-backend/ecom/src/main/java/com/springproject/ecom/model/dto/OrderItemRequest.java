package com.springproject.ecom.model.dto;

public record OrderItemRequest(
        int productId,
        int quantity
) {
}
