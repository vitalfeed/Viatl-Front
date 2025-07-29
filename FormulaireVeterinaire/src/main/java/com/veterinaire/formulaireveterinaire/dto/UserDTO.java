package com.veterinaire.formulaireveterinaire.dto;
public class UserDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String numVeterinaire;
    private Long demandeAccesId;
    private boolean isAdmin;
    private boolean isFirstLogin;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNumVeterinaire() {
        return numVeterinaire;
    }

    public void setNumVeterinaire(String numVeterinaire) {
        this.numVeterinaire = numVeterinaire;
    }

    public Long getDemandeAccesId() {
        return demandeAccesId;
    }

    public void setDemandeAccesId(Long demandeAccesId) {
        this.demandeAccesId = demandeAccesId;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public boolean isFirstLogin() {
        return isFirstLogin;
    }

    public void setFirstLogin(boolean firstLogin) {
        isFirstLogin = firstLogin;
    }
}