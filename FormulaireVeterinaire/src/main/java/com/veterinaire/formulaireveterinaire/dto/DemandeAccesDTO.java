package com.veterinaire.formulaireveterinaire.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DemandeAccesDTO(

         Long id,
        @NotBlank(message = "Le nom est requis") String nom,
        @NotBlank(message = "Le prénom est requis") String prenom,
        @NotBlank(message = "L'email est requis") @Email(message = "Email invalide") String email,
        @NotBlank(message = "Le téléphone est requis") String telephone,
        @NotBlank(message = "L'adresse du cabinet est requise") String adresseCabinet,
        @NotBlank(message = "Le numéro de vétérinaire est requis") String numVeterinaire
) {}
