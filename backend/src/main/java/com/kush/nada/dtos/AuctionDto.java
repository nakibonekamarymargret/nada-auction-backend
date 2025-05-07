package com.kush.nada.dtos;


import com.kush.nada.enums.AuctionStatus;

import java.time.LocalDateTime;

public class AuctionDto {
    private Long id;
    private AuctionStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
  
    public AuctionDto() {}

    public AuctionDto(Long id, AuctionStatus status, LocalDateTime startTime, LocalDateTime endTime) {
        this.id = id;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AuctionStatus getStatus() { return status; }
    public void setStatus(AuctionStatus status) { this.status = status; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}