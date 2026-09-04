package org.transport.repository;

import org.transport.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.transport.model.UserRole;
import org.transport.model.UserStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    long countByRole(UserRole role);
    long countByRoleAndStatus(UserRole role, UserStatus status);

    @Query("""
            SELECT u FROM User u
            WHERE (:role IS NULL OR u.role = :role)
              AND (:status IS NULL OR u.status = :status)
              AND (:q IS NULL OR :q = ''
                   OR LOWER(u.email)     LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(u.lastName)  LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY u.id
            """)
    List<User> search(@Param("role") UserRole role,
                      @Param("status") UserStatus status,
                      @Param("q") String query);
}