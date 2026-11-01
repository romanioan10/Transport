package org.transport.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class JwtServiceTest {
    @Test
    void rejectsMissingOrWeakSecretAndNonPositiveLifetime() {
        assertThatThrownBy(() -> new JwtService(null, 60_000)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new JwtService(" ", 60_000)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new JwtService("too-short", 60_000)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new JwtService("test-signing-secret-at-least-32-bytes", 0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void tokenCannotAuthenticateAnotherEmail() {
        JwtService jwt = new JwtService("test-signing-secret-at-least-32-bytes", 60_000);
        String token = jwt.generateToken("one@example.com");
        assertThat(jwt.isTokenValid(token, "one@example.com")).isTrue();
        assertThat(jwt.isTokenValid(token, "two@example.com")).isFalse();
    }
}
