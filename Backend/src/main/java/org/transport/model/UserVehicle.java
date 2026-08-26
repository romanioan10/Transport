package org.transport.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "user_vehicle")
public class UserVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Setter
    @Column(nullable = false)
    private boolean active;

    private LocalDateTime assignedAt;

    private LocalDateTime unassignedAt;


    public UserVehicle() {}

    public UserVehicle(User user, Vehicle vehicle, boolean active) {
        this.user = user;
        this.vehicle = vehicle;
        this.active = active;
    }
}