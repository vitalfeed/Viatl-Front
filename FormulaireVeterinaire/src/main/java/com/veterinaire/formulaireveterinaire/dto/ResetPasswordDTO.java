package com.veterinaire.formulaireveterinaire.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordDTO(
        @NotBlank(message = "Le nouveau mot de passe est requis") String newPassword
) {}
