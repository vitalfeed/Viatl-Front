package com.veterinaire.formulaireveterinaire.Schedule;

import com.veterinaire.formulaireveterinaire.Enums.SubscriptionStatus;
import com.veterinaire.formulaireveterinaire.dao.SubscriptionRepository;
import com.veterinaire.formulaireveterinaire.entity.Subscription;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ReminderScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final JavaMailSender mailSender;

    private static final Logger logger = LoggerFactory.getLogger(ReminderScheduler.class);


    // In-memory Set to track subscriptions for which reminders have been sent
    private final Set<Long> sentReminderIds = new HashSet<>();

    public ReminderScheduler(SubscriptionRepository subscriptionRepository, JavaMailSender mailSender) {
        this.subscriptionRepository = subscriptionRepository;
        this.mailSender = mailSender;
    }

    @Scheduled(cron = "0 * * * * *") // Exécute chaque minute
    /*@Scheduled(cron = "0 0 0 * * *") // Run daily at midnight*/
    public void checkExpiredSubscriptions() {
        List<Subscription> subscriptions = subscriptionRepository.findAllByStatus(SubscriptionStatus.ACTIVE);
        LocalDateTime now = LocalDateTime.now();

        for (Subscription subscription : subscriptions) {
            String email = subscription.getUser().getEmail();
            String prenom = subscription.getUser().getPrenom();
            Long subscriptionId = subscription.getId();

            if (subscription.getEndDate().isBefore(now)) {
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(subscription);
                sentReminderIds.remove(subscriptionId); // Remove from set when expired (optional)
                logger.info("Abonnement ID {} expiré pour l'utilisateur {} ({})", subscriptionId, prenom, email);
            } else if (subscription.getEndDate().isBefore(now.plusDays(7)) && !sentReminderIds.contains(subscriptionId)) {
                logger.info("Envoi du mail de rappel pour abonnement ID {} à l'utilisateur {} ({})", subscriptionId, prenom, email);
                try {
                    envoyerEmailRappelHTML(email, prenom);
                    sentReminderIds.add(subscriptionId); // Mark reminder as sent
                } catch (RuntimeException e) {
                    logger.error("Échec de l'envoi du mail de rappel pour abonnement ID {}: {}", subscriptionId, e.getMessage());
                }
            }
        }
    }

    private void envoyerEmailRappelHTML(String email, String prenom) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Rappel : Votre abonnement arrive bientôt à expiration");
            helper.setFrom("damino.awadi@gmail.com");

            String htmlContent = """
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f39c12; color: white; padding: 10px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
                        .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Rappel d'expiration</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour %s,</p>
                            <p>Nous vous rappelons que votre abonnement à Notre plateforme VitalNutri arrivera à expiration dans moins de 7 jours.</p>
                            <p>Pour éviter toute interruption de service, veuillez renouveler votre abonnement avant la date d’expiration.</p>
                            <p>Merci pour votre confiance.</p>
                            <p>Cordialement,<br>L'équipe VitalNutri</p>
                        </div>
                        <div class="footer">
                            <p>Plateforme Vétérinaire | Support : support@veterinaire.com</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(prenom);

            helper.setText(htmlContent, true); // true = HTML
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de rappel HTML", e);
        }
    }
}
