package com.timecapsule.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统配置实体类
 */
@Data
@TableName("system_config")
public class SystemConfig {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    private LocalDateTime lastMessageTime;
    
    private Boolean resetCountdown;
    
    private LocalDateTime countdownEndTime;
    
    private String configKey;
    
    private String configValue;
} 