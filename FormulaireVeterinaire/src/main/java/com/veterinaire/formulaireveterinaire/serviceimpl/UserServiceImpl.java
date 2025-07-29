package com.veterinaire.formulaireveterinaire.serviceimpl;

import com.veterinaire.formulaireveterinaire.Enums.SubscriptionStatus;
import com.veterinaire.formulaireveterinaire.Enums.SubscriptionType;
import com.veterinaire.formulaireveterinaire.dao.DemandeAccesRepository;
import com.veterinaire.formulaireveterinaire.dao.SubscriptionRepository;
import com.veterinaire.formulaireveterinaire.dao.UserRepository;
import com.veterinaire.formulaireveterinaire.dto.UserDTO;
import com.veterinaire.formulaireveterinaire.entity.DemandeAcces;
import com.veterinaire.formulaireveterinaire.entity.Subscription;
import com.veterinaire.formulaireveterinaire.entity.User;
import com.veterinaire.formulaireveterinaire.service.UserService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final DemandeAccesRepository demandeAccesRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public UserServiceImpl(UserRepository userRepository, SubscriptionRepository subscriptionRepository,
                           DemandeAccesRepository demandeAccesRepository, PasswordEncoder passwordEncoder,
                           JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.demandeAccesRepository = demandeAccesRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }


    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setNom(user.getNom());
            userDTO.setPrenom(user.getPrenom());
            userDTO.setEmail(user.getEmail());
            userDTO.setPassword(user.getPassword());
            userDTO.setNumVeterinaire(user.getNumVeterinaire());
            userDTO.setDemandeAccesId(user.getDemandeAcces() != null ? user.getDemandeAcces().getId() : null);
            userDTO.setAdmin(user.isAdmin());
            userDTO.setFirstLogin(user.isFirstLogin());
            return userDTO;
        }).collect(Collectors.toList());
    }


    @Override
    public void createUserFromDemande(Long demandeId, SubscriptionType subscriptionType) {
        DemandeAcces demande = demandeAccesRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        // Vérifier si l'utilisateur existe déjà
        if (userRepository.findByEmail(demande.getEmail()).isPresent()) {
            throw new RuntimeException("Un utilisateur avec cet e-mail existe déjà");
        }

        // Générer un mot de passe temporaire
        String temporaryPassword = UUID.randomUUID().toString().substring(0, 8);
        String encodedPassword = passwordEncoder.encode(temporaryPassword);

        User user = User.builder()
                .email(demande.getEmail())
                .password(encodedPassword)
                .nom(demande.getNom())
                .prenom(demande.getPrenom())
                .numVeterinaire(demande.getNumVeterinaire())
                .isAdmin(false)
                .isFirstLogin(true)
                .demandeAcces(demande)
                .build();

        userRepository.save(user);

        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = subscriptionType == SubscriptionType.SIX_MONTHS
                ? startDate.plusMonths(6)
                : startDate.plusYears(1);

        Subscription subscription = Subscription.builder()
                .user(user)
                .subscriptionType(subscriptionType)
                .startDate(startDate)
                .endDate(endDate)
                .status(SubscriptionStatus.ACTIVE)
                .build();

        subscriptionRepository.save(subscription);

        // Envoyer un e-mail avec le mot de passe temporaire

       // envoyerEmailMotDePasse(demande.getEmail(), temporaryPassword);
        envoyerEmailMotDePasse(demande.getEmail(), temporaryPassword, demande.getPrenom());

    }

    private void envoyerEmailMotDePasse(String email, String password, String prenom) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Bienvenue sur la plateforme Vétérinaire");
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
                        .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
                        .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Bienvenue sur Notre plateforme VitalNutri</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour %s,</p>
                            <p>Nous sommes ravis de vous accueillir sur notre plateforme dédiée aux vétérinaires, conçue pour simplifier la gestion des consultations pour vos chats et chiens.</p>
                            <p>Votre compte a été créé avec succès. Voici vos informations de connexion :</p>
                            <ul>
                                <li><strong>Email :</strong> %s</li>
                                <li><strong>Mot de passe temporaire :</strong> %s</li>
                            </ul>
                            <p>Pour des raisons de sécurité, veuillez modifier votre mot de passe lors de votre première connexion.</p>
                            <p><a href="http://localhost:8080/login" class="button">Se connecter maintenant</a></p>
                            <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe.</p>
                            <p>Cordialement,<br>L'équipe VitalNutri</p>
                        </div>
                        <div class="footer">
                            <p>Plateforme Vétérinaire | Support : support@veterinaire.com</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(prenom, email, password);

            helper.setText(htmlContent, true); // true indicates HTML content
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
