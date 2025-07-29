package com.veterinaire.formulaireveterinaire.service;


import com.veterinaire.formulaireveterinaire.dto.DemandeAccesDTO;

import java.util.List;

public interface DemandeAccesService {
    void soumettreDemande(DemandeAccesDTO demandeDTO);
    List<DemandeAccesDTO> getAllDemandes();
}