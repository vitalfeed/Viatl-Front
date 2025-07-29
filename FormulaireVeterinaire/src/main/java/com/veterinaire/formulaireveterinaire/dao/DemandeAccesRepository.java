package com.veterinaire.formulaireveterinaire.dao;

import com.veterinaire.formulaireveterinaire.entity.DemandeAcces;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemandeAccesRepository extends JpaRepository<DemandeAcces, Long> {

    boolean existsByEmail(String email);

}
