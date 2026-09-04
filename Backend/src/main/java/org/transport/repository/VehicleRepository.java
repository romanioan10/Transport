package org.transport.repository;

import org.transport.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    boolean existsByLicensePlate(String licensePlate);

    @Query("""
            SELECT v FROM Vehicle v
            WHERE (:active IS NULL OR v.active = :active)
              AND (:plate IS NULL OR :plate = ''
                   OR LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :plate, '%')))
              AND (:model IS NULL OR :model = ''
                   OR LOWER(v.model) LIKE LOWER(CONCAT('%', :model, '%')))
            ORDER BY v.id
            """)
    List<Vehicle> search(@Param("active") Boolean active,
                         @Param("plate") String plate,
                         @Param("model") String model);
}