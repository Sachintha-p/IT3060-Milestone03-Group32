package com.library.smart_campus_backend.feature1.repository;

import com.library.smart_campus_backend.feature1.model.Reservation;
import com.library.smart_campus_backend.feature1.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    @EntityGraph(attributePaths = {"space"})
    List<Reservation> findByReservationDateAndStatusIn(LocalDate date, List<ReservationStatus> statuses);
    
    List<Reservation> findBySpaceIdAndReservationDateAndStatusIn(Long spaceId, LocalDate date, List<ReservationStatus> statuses);

    List<Reservation> findByUserIdAndReservationDateAndStatusIn(Long userId, LocalDate date, List<ReservationStatus> statuses);

    @EntityGraph(attributePaths = {"space", "user"})
    List<Reservation> findByUserIdAndStatusInOrderByReservationDateAscStartTimeAsc(Long userId, List<ReservationStatus> statuses);

    boolean existsBySpaceIdAndReservationDateAndStartTimeAndStatusIn(Long spaceId, LocalDate date, LocalTime startTime, List<ReservationStatus> statuses);

    boolean existsByUserIdAndReservationDateAndStartTimeAndStatusIn(Long userId, LocalDate date, LocalTime startTime, List<ReservationStatus> statuses);

    boolean existsBySpaceIdAndReservationDateAndStartTimeAndStatusInAndIdNot(Long spaceId, LocalDate date, LocalTime startTime, List<ReservationStatus> statuses, Long id);

    boolean existsByUserIdAndReservationDateAndStartTimeAndStatusInAndIdNot(Long userId, LocalDate date, LocalTime startTime, List<ReservationStatus> statuses, Long id);
}
