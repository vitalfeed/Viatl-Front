package com.veterinaire.formulaireveterinaire.service;


import com.veterinaire.formulaireveterinaire.DTO.Cart.CartItemDto;
import com.veterinaire.formulaireveterinaire.DTO.Cart.CartItemRequest;
import com.veterinaire.formulaireveterinaire.DTO.Cart.CartResponse;


public interface CartService {
    CartResponse getCart(Long userId);
    CartItemDto addItem(Long userId, CartItemRequest req);
    CartItemDto updateItem(Long userId, Long itemId, Integer quantity);
    void removeItem(Long userId, Long itemId);
    void clearCart(Long userId);
    String checkout(Long userId);
}
