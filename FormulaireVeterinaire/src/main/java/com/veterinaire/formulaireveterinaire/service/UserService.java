package com.veterinaire.formulaireveterinaire.service;

import com.veterinaire.formulaireveterinaire.Enums.SubscriptionType;
import com.veterinaire.formulaireveterinaire.dto.UserDTO;
import com.veterinaire.formulaireveterinaire.entity.DemandeAcces;
import com.veterinaire.formulaireveterinaire.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    void createUserFromDemande(Long demandeId, SubscriptionType subscriptionType);
    Optional<User> findByEmail(String email);

    List<UserDTO> getAllUsers();



}
