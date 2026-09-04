package org.transport.dto.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.transport.model.UserRole;
import org.transport.model.UserStatus;

public record CreateUserRequest(
        @NotBlank @Email
        String email,
        @NotBlank @Size(min = 6, message = "password must be at least 6 characters")
        String password,
        @NotBlank
        String firstName,
        @NotBlank
        String lastName,
        @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$", message = "invalid phone number format")
        String phoneNumber,
        @NotNull
        UserRole role,
        UserStatus status
) {
}
