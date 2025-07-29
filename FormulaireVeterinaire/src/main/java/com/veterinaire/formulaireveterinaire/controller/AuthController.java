package com.veterinaire.formulaireveterinaire.controller;

import com.veterinaire.formulaireveterinaire.Config.JwtUtil;
import com.veterinaire.formulaireveterinaire.Enums.SubscriptionStatus;
import com.veterinaire.formulaireveterinaire.dao.SubscriptionRepository;
import com.veterinaire.formulaireveterinaire.dao.UserRepository;
import com.veterinaire.formulaireveterinaire.dto.LoginDTO;
import com.veterinaire.formulaireveterinaire.entity.Subscription;
import com.veterinaire.formulaireveterinaire.entity.User;
import com.veterinaire.formulaireveterinaire.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;;
    private final UserService userService;


    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

            if (!user.isAdmin()) {
                // Check subscription only for non-admin users
                Subscription subscription = subscriptionRepository.findByUserEmail(email)
                        .orElseThrow(() -> new RuntimeException("No subscription found for user: " + email));
                if (subscription.getStatus() == SubscriptionStatus.EXPIRED ||
                        subscription.getEndDate().isBefore(LocalDateTime.now())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Collections.singletonMap("error", "Subscription expired"));
                }
            }

            String token = jwtUtil.generateToken(email, user.isAdmin());
            //String refreshToken = jwtUtil.generateRefreshToken(email);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            //response.put("refreshToken", refreshToken);
            response.put("mustResetPassword", user.isFirstLogin());

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Unauthorized: Bad credentials"));
        }
    }

}