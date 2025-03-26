package com.timecapsule.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 留言数据传输对象
 */
@Data
public class MessageDTO {
    private Long id;
    private String content;
    private String username;
    private LocalDateTime createTime;
    private String formattedTime; // 用于前端显示
} 