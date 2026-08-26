package org.transport.dto.Requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank @Email
        String email,
        @NotBlank
        String password,
        @NotBlank
        String firstName,
        @NotBlank
        String lastName,
        @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$", message = "invalid phone number format")
        String phoneNumber
) {
}