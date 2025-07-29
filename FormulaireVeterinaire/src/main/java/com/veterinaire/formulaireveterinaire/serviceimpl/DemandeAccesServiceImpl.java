package com.veterinaire.formulaireveterinaire.serviceimpl;



import com.veterinaire.formulaireveterinaire.dao.DemandeAccesRepository;
import com.veterinaire.formulaireveterinaire.dto.DemandeAccesDTO;
import com.veterinaire.formulaireveterinaire.entity.DemandeAcces;
import com.veterinaire.formulaireveterinaire.service.DemandeAccesService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeAccesServiceImpl implements DemandeAccesService {

    private final DemandeAccesRepository demandeAccesRepository; // Changement ici
    private final JavaMailSender mailSender;

    public DemandeAccesServiceImpl(DemandeAccesRepository demandeAccesRepository, JavaMailSender mailSender) { // Changement ici
        this.demandeAccesRepository = demandeAccesRepository;
        this.mailSender = mailSender;
    }

    @Override
    public void soumettreDemande(DemandeAccesDTO demandeDTO) {
        // Vérifier si l'email est déjà utilisé
        if (demandeAccesRepository.existsByEmail(demandeDTO.email())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé pour une demande d'accès.");
        }

        // Mapper le DTO vers l'entité
        DemandeAcces demande = DemandeAcces.builder()
                .nom(demandeDTO.nom())
                .prenom(demandeDTO.prenom())
                .email(demandeDTO.email())
                .telephone(demandeDTO.telephone())
                .adresseCabinet(demandeDTO.adresseCabinet())
                .dateSoumission(LocalDateTime.now())
                .numVeterinaire(demandeDTO.numVeterinaire())
                .build();

        // Sauvegarder dans la base de données
        demandeAccesRepository.save(demande);

        // Envoyer un e-mail de confirmation
        try {
           // envoyerEmailConfirmation(demandeDTO.email());
            envoyerEmailConfirmation(demandeDTO.email(), demandeDTO.prenom());
        } catch (Exception e) {
            // Facultatif : log + relancer une exception ou continuer
            throw new RuntimeException("La demande a été enregistrée, mais l'e-mail n'a pas pu être envoyé.", e);
        }
    }


    @Override
    public List<DemandeAccesDTO> getAllDemandes() {
        return demandeAccesRepository.findAll().stream()
                .map(demande -> new DemandeAccesDTO(
                        demande.getId(),
                        demande.getNom(),
                        demande.getPrenom(),
                        demande.getEmail(),
                        demande.getTelephone(),
                        demande.getAdresseCabinet(),
                        demande.getNumVeterinaire()

                ))
                .collect(Collectors.toList());
    }


//    private void envoyerEmailConfirmation(String email) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(email);
//        message.setSubject("Confirmation de votre demande d'accès");
//        message.setText("Bonjour,\n\nVotre demande d'accès à l'application vétérinaire a été reçue. " +
//                "Nous vous contacterons bientôt pour finaliser votre inscription et organiser le paiement.\n\nCordialement,\nL'équipe Vétérinaire");
//        message.setFrom("damino.awadi@gmail.com"); // Remplacer par votre email
//        mailSender.send(message);
//    }

    private void envoyerEmailConfirmation(String email, String prenom) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Confirmation de votre demande d'accès à la plateforme Vétérinaire");
            helper.setFrom("damino.awadi@gmail.com");

            // HTML content for the email
            String htmlContent = """
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
                        .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Confirmation De Votre Demande</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour %s,</p>
                            <p>Merci d'avoir soumis votre demande d'accès à notre plateforme dédiée aux vétérinaires. Nous avons bien reçu votre demande et sommes ravis de vous accompagner dans la gestion des consultations pour vos  chats et chiens.</p>
                            <p><strong>Prochaines étapes :</strong></p>
                            <ul>
                                <li>Notre équipe examinera votre demande dans les plus brefs délais.</li>
                                <li>Nous vous contacterons bientôt pour finaliser votre inscription et organiser les modalités de paiement.</li>
                            </ul>
                            <p>Si vous avez des questions ou souhaitez accélérer le processus, n'hésitez pas à nous contacter à l'adresse ci-dessous.</p>
                            <p>Cordialement,<br>L'équipe VitalNutri </p>
                        </div>
                        <div class="footer">
                            <p>Plateforme Vétérinaire | Support : support@veterinaire.com</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(prenom);

            helper.setText(htmlContent, true); // true indicates HTML content
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de confirmation", e);
        }
    }
}