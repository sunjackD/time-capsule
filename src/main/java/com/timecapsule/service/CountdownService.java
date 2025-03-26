package com.timecapsule.service;

import com.timecapsule.dto.CountdownStatus;

/**
 * 倒计时服务接口
 */
public interface CountdownService {
    
    /**
     * 获取倒计时状态
     *
     * @return 倒计时状态
     */
    CountdownStatus getCountdownStatus();
    
    /**
     * 重置倒计时
     */
    void resetCountdown();
    
    /**
     * 检查倒计时是否过期
     *
     * @return 是否过期
     */
    boolean isCountdownExpired();
} 