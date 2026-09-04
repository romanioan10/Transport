package org.transport.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.transport.dto.UserDto;
import org.transport.dto.requests.CreateUserRequest;
import org.transport.dto.requests.UpdateUserProfileRequest;
import org.transport.exception.BadRequestException;
import org.transport.exception.ConflictException;
import org.transport.exception.NotFoundException;
import org.transport.model.User;
import org.transport.model.UserRole;
import org.transport.model.UserStatus;
import org.transport.repository.UserRepository;
import org.transport.repository.UserVehicleRepository;

import java.util.List;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserVehicleRepository userVehicleRepository;
    private final PasswordEncoder passwordEncoder;

    public User getCurrentUserEntity(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public UserDto getCurrentUser(Authentication auth) {
        return UserDto.from(getCurrentUserEntity(auth));
    }

    public UserDto getById(Long id) {
        return UserDto.from(findEntity(id));
    }

    public List<UserDto> getClients() {
        return userRepository.findByRole(UserRole.CLIENT).stream()
                .map(UserDto::from)
                .toList();
    }

    public List<UserDto> getDrivers() {
        return userRepository.findByRole(UserRole.DRIVER).stream()
                .map(UserDto::from)
                .toList();
    }

    public List<UserDto> search(UserRole role, UserStatus status, String query) {
        String normalizedQuery = (query == null || query.isBlank()) ? null : query.trim();
        return userRepository.search(role, status, normalizedQuery).stream()
                .map(UserDto::from)
                .toList();
    }

    @Transactional
    public UserDto updateProfile(Long id, UpdateUserProfileRequest request) {
        User user = findEntity(id);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhoneNumber(request.phoneNumber());
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto updateOwnProfile(Authentication auth, UpdateUserProfileRequest request) {
        User me = getCurrentUserEntity(auth);
        return updateProfile(me.getId(), request);
    }

    @Transactional
    public UserDto updateRole(Long id, UserRole role) {
        User user = findEntity(id);

        if (user.getRole() == UserRole.ADMIN && role != UserRole.ADMIN) {
            long remainingAdmins = userRepository.countByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE);
            if (remainingAdmins <= 1) {
                throw new BadRequestException("Cannot demote the last active admin");
            }
        }

        user.setRole(role);
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto updateStatus(Long id, UserStatus status) {
        User user = findEntity(id);

        if (user.getRole() == UserRole.ADMIN
                && user.getStatus() == UserStatus.ACTIVE
                && status != UserStatus.ACTIVE) {
            long remainingAdmins = userRepository.countByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE);
            if (remainingAdmins <= 1) {
                throw new BadRequestException("Cannot disable the last active admin");
            }
        }

        user.setStatus(status);
        return UserDto.from(userRepository.save(user));
    }

    private User findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ConflictException("Email already in use");
        }

        UserStatus status = request.status() == null ? UserStatus.ACTIVE : request.status();

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phoneNumber(request.phoneNumber())
                .role(request.role())
                .status(status)
                .build();

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id, Authentication auth) {
        User user = findEntity(id);

        User me = getCurrentUserEntity(auth);
        if (me.getId().equals(user.getId())) {
            throw new BadRequestException("You cannot delete your own account");
        }

        if (user.getRole() == UserRole.ADMIN) {
            long remainingAdmins = userRepository.countByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE);
            if (remainingAdmins <= 1 && user.getStatus() == UserStatus.ACTIVE) {
                throw new BadRequestException("Cannot delete the last active admin");
            }
        }

        userVehicleRepository.deleteAll(
                userVehicleRepository.findByUserOrderByAssignedAtDesc(user)
        );

        userRepository.delete(user);
    }
}