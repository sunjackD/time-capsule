package com.timecapsule.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 留言实体类
 */
@Data
@TableName("message")
public class Message {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    private String content;
    
    private String username;
    
    private LocalDateTime createTime;
    
    private String ipAddress;
    
    private String deviceInfo;
} 