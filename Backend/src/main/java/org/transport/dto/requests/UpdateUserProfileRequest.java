package org.transport.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserProfileRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$", message = "invalid phone number format")
        String phoneNumber
) {
}
