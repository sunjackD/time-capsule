package com.timecapsule.service.impl;

import com.timecapsule.dto.CountdownStatus;
import com.timecapsule.mapper.SystemConfigMapper;
import com.timecapsule.service.CountdownService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * 倒计时服务实现类
 */
@Service
public class CountdownServiceImpl implements CountdownService {
    
    @Autowired
    private SystemConfigMapper systemConfigMapper;
    
    @Value("${time-capsule.countdown.hours:24}")
    private Integer countdownHours;
    
    @Override
    public CountdownStatus getCountdownStatus() {
        CountdownStatus status = new CountdownStatus();
        
        // 获取倒计时结束时间
        LocalDateTime endTime = systemConfigMapper.getCountdownEndTime();
        if (endTime == null) {
            // 初始化倒计时
            endTime = LocalDateTime.now().plusHours(countdownHours);
            systemConfigMapper.updateCountdownEndTime(endTime);
        }
        
        // 计算剩余时间
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(endTime)) {
            // 倒计时已过期
            status.setIsActive(false);
            status.setRemainingSeconds(0L);
            status.setHours(0);
            status.setMinutes(0);
            status.setSeconds(0);
        } else {
            // 计算剩余时间
            Duration duration = Duration.between(now, endTime);
            long totalSeconds = duration.getSeconds();
            
            status.setIsActive(true);
            status.setRemainingSeconds(totalSeconds);
            status.setHours((int) (totalSeconds / 3600));
            status.setMinutes((int) ((totalSeconds % 3600) / 60));
            status.setSeconds((int) (totalSeconds % 60));
        }
        
        status.setEndTime(endTime);
        return status;
    }
    
    @Override
    public void resetCountdown() {
        LocalDateTime newEndTime = LocalDateTime.now().plusHours(countdownHours);
        systemConfigMapper.updateCountdownEndTime(newEndTime);
    }
    
    @Override
    public boolean isCountdownExpired() {
        LocalDateTime endTime = systemConfigMapper.getCountdownEndTime();
        if (endTime == null) {
            return false;
        }
        return LocalDateTime.now().isAfter(endTime);
    }
} 