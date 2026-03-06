package com.veterinaire.formulaireveterinaire.DTO.Cart;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartItemDto {
    private Long itemId;
    private Long productId;
    private Integer quantity;
    private String productName;
    private String imageUrl;
    private BigDecimal price;
    private BigDecimal subTotal;
}