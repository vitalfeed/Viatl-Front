package com.veterinaire.formulaireveterinaire.Config;

import com.veterinaire.formulaireveterinaire.Enums.SubscriptionStatus;
import com.veterinaire.formulaireveterinaire.dao.SubscriptionRepository;
import com.veterinaire.formulaireveterinaire.dao.UserRepository;
import com.veterinaire.formulaireveterinaire.entity.Subscription;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;



    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            try {
                email = jwtUtil.extractEmail(token);
            } catch (Exception e) {
                logger.error("Failed to extract email from token", e);
                filterChain.doFilter(request, response);
                return;
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            final String finalEmail = email;
            UserDetails userDetails = userDetailsService.loadUserByUsername(finalEmail);

            if (userDetails != null && jwtUtil.validateToken(token, finalEmail)) {

                // 🔽 Charger le User complet (pour accéder à isAdmin)
                com.veterinaire.formulaireveterinaire.entity.User user =
                        userRepository.findByEmail(finalEmail)
                                .orElseThrow(() -> new RuntimeException("User not found: " + finalEmail));

                // 🔁 Si ce n'est PAS un admin, vérifier l'abonnement
                if (!user.isAdmin()) {
                    Subscription subscription = subscriptionRepository.findByUserEmail(finalEmail)
                            .orElseThrow(() -> new RuntimeException("No subscription found for user: " + finalEmail));

                    if (subscription.getStatus() == SubscriptionStatus.EXPIRED ||
                            subscription.getEndDate().isBefore(LocalDateTime.now())) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\": \"Subscription expired\"}");
                        return;
                    }
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

}