package org.transport.dto;

import org.transport.model.User;
import org.transport.model.UserStatus;

import java.time.Instant;

public record UserDto(Long id,
                      String email,
                      String firstName,
                      String lastName,
                      String phoneNumber,
                      String role,
                      UserStatus status,
                      Instant createdAt) {

    public static UserDto from(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}
