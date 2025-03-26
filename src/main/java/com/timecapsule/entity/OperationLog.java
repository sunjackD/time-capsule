package com.timecapsule.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 操作日志实体类
 */
@Data
@TableName("operation_log")
public class OperationLog {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    private String operationType;
    
    private LocalDateTime operationTime;
    
    private String ipAddress;
    
    private String deviceInfo;
    
    private Long messageId;
    
    private String description;
} 