package com.veterinaire.formulaireveterinaire.controller;

import com.veterinaire.formulaireveterinaire.Enums.SubscriptionType;
import com.veterinaire.formulaireveterinaire.dto.UserDTO;
import com.veterinaire.formulaireveterinaire.entity.User;
import com.veterinaire.formulaireveterinaire.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/create-from-demande/{demandeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createUserFromDemande(@PathVariable Long demandeId,
                                                        @RequestParam String subscriptionType) {
        SubscriptionType type;
        try {
            type = SubscriptionType.valueOf(subscriptionType);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Type d'abonnement invalide. Utilisez SIX_MONTHS ou ONE_YEAR.");
        }
        userService.createUserFromDemande(demandeId, type);
        return ResponseEntity.ok("Utilisateur créé avec succès");
    }
}
