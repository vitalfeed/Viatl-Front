package com.veterinaire.formulaireveterinaire.Schedule;


import com.veterinaire.formulaireveterinaire.Enums.SubscriptionStatus;
import com.veterinaire.formulaireveterinaire.dao.SubscriptionRepository;
import com.veterinaire.formulaireveterinaire.entity.Subscription;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class SubscriptionStatusUpdater {
    private final SubscriptionRepository subscriptionRepository;

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionStatusUpdater.class);

    public SubscriptionStatusUpdater(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    /*@Scheduled(cron = "0 0 0 * * *") // Run daily at midnight*/
    @Scheduled(cron = "0 * * * * *") // Run every minute
    public void updateExpiredSubscriptions() {
        List<Subscription> subscriptions = subscriptionRepository.findAll();
        for (Subscription subscription : subscriptions) {
            if (subscription.getEndDate().isBefore(LocalDateTime.now()) &&
                    subscription.getStatus() != SubscriptionStatus.EXPIRED) {
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(subscription);
            }
            logger.info("Subscription with ID {} has been marked as EXPIRED. End date was: {}",
                    subscription.getId(), subscription.getEndDate());
        }
    }
}
