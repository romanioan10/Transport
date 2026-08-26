package org.transport.dto;

import org.transport.model.User;

public record UserDto(Long id,
                      String email,
                      String firstName,
                      String lastName,
                      String phoneNumber,
                      String role) {

    public static UserDto from(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getRole().name()
        );
    }
}
