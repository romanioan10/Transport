package org.transport.Service;

import org.transport.Model.User;
import org.transport.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email-ul este deja folosit!");
        }
        return userRepository.save(user);
    }

    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Userul nu a fost gasit!"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Parola gresita!");
        }

        return user;
    }
}