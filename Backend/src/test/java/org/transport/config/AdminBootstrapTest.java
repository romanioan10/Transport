package org.transport.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.transport.model.User;
import org.transport.model.UserRole;
import org.transport.model.UserStatus;
import org.transport.repository.UserRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminBootstrapTest {
    private UserRepository users;
    private BCryptPasswordEncoder encoder;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        encoder = new BCryptPasswordEncoder();
    }

    @Test
    void createsInitialAdminWithHashedPassword() {
        new AdminBootstrap(users, encoder, "admin@example.com", "initial-password-123").run(null);
        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(saved.getValue().getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(encoder.matches("initial-password-123", saved.getValue().getPassword())).isTrue();
    }

    @Test
    void existingAdminIsNeverReset() {
        when(users.countByRole(UserRole.ADMIN)).thenReturn(1L);
        new AdminBootstrap(users, encoder, "", "").run(null);
        verify(users, never()).save(any());
    }

    @Test
    void existingClientIsNeverPromotedByBootstrap() {
        when(users.findByEmail("client@example.com")).thenReturn(Optional.of(new User()));
        assertThatThrownBy(() -> new AdminBootstrap(users, encoder, "client@example.com", "initial-password-123").run(null))
                .isInstanceOf(IllegalStateException.class);
        verify(users, never()).save(any());
    }

    @Test
    void missingWeakAndOversizedCredentialsFailWithoutWriting() {
        for (String password : new String[]{"", "short", "x".repeat(73)}) {
            assertThatThrownBy(() -> new AdminBootstrap(users, encoder, "admin@example.com", password).run(null))
                    .isInstanceOf(IllegalStateException.class);
        }
        assertThatThrownBy(() -> new AdminBootstrap(users, encoder, "invalid-email", "initial-password-123").run(null))
                .isInstanceOf(IllegalStateException.class);
        verify(users, never()).save(any());
    }
}
