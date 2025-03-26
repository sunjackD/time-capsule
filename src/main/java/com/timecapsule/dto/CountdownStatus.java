package com.timecapsule.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 倒计时状态数据传输对象
 */
@Data
public class CountdownStatus {
    private LocalDateTime endTime;
    private Long remainingSeconds;
    private Integer hours;
    private Integer minutes;
    private Integer seconds;
    private Boolean isActive;
} 