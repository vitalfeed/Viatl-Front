package com.veterinaire.formulaireveterinaire.dao;

import com.veterinaire.formulaireveterinaire.Enums.SubscriptionStatus;
import com.veterinaire.formulaireveterinaire.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserIdAndStatus(Long userId, String status);
    List<Subscription> findAllByStatus(String status);

    @Query("SELECT s FROM Subscription s WHERE s.user.email = :email AND s.status = 'ACTIVE'")
    Optional<Subscription> findByUserEmail(String email);

    List<Subscription> findAllByStatus(SubscriptionStatus status);

}
