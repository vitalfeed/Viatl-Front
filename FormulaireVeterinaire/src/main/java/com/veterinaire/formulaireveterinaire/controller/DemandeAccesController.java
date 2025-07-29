package com.veterinaire.formulaireveterinaire.controller;



import com.veterinaire.formulaireveterinaire.dto.DemandeAccesDTO;
import com.veterinaire.formulaireveterinaire.service.DemandeAccesService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/demandes")
public class DemandeAccesController {

    private final DemandeAccesService demandeAccesService;

    public DemandeAccesController(DemandeAccesService demandeAccesService) {
        this.demandeAccesService = demandeAccesService;
    }

    @PostMapping
    public ResponseEntity<?> soumettreDemande(@Valid @RequestBody DemandeAccesDTO demandeDTO) {
        try {
            demandeAccesService.soumettreDemande(demandeDTO);
            return ResponseEntity.ok(Map.of(
                    "message", "Demande soumise avec succès. Vous serez contacté pour finaliser votre inscription."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Une erreur est survenue."));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<DemandeAccesDTO>> getAllDemandes() {
        List<DemandeAccesDTO> demandes = demandeAccesService.getAllDemandes();
        return ResponseEntity.ok(demandes);
    }
}
