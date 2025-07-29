package com.veterinaire.formulaireveterinaire.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder  // ✅ Génére builder()
@Table(name = "demande_acces", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class DemandeAcces {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String telephone;

    @Column(nullable = false)
    private String adresseCabinet;

    @Column(nullable = false)
    private LocalDateTime dateSoumission;

    @Column(nullable = false)
    private String numVeterinaire;
}