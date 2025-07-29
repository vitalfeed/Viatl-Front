package com.veterinaire.formulaireveterinaire.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "num_veterinaire", nullable = false)
    private String numVeterinaire;

    @Column(name = "is_admin", nullable = false)
    private boolean isAdmin;

    @Column(name = "is_first_login", nullable = false)
    private boolean isFirstLogin;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "demande_acces_id", referencedColumnName = "id")
    private DemandeAcces demandeAcces;

}