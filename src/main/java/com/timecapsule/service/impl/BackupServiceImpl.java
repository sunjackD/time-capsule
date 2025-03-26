package com.timecapsule.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.timecapsule.entity.Message;
import com.timecapsule.service.BackupService;
import com.timecapsule.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 数据备份服务实现
 */
@Service
@Slf4j
public class BackupServiceImpl implements BackupService {

    @Autowired
    private MessageService messageService;
    
    @Value("${time-capsule.backup.path:./backup}")
    private String backupPath;
    
    @Override
    public String backupMessagesToSql() {
        try {
            // 确保备份目录存在
            File backupDir = new File(backupPath);
            if (!backupDir.exists()) {
                backupDir.mkdirs();
            }
            
            // 生成备份文件名
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String backupFileName = String.format("message_backup_%s.sql", timestamp);
            File backupFile = new File(backupDir, backupFileName);
            
            // 获取所有留言
            List<Message> messages = messageService.list();
            
            // 生成SQL文件
            try (FileWriter writer = new FileWriter(backupFile)) {
                // 写入SQL头
                writer.write("-- 留言数据备份\n");
                writer.write("-- 备份时间: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
                writer.write("-- 留言数量: " + messages.size() + "\n\n");
                
                writer.write("-- 备份表结构\n");
                writer.write("CREATE TABLE IF NOT EXISTS message_backup_" + timestamp + " (\n");
                writer.write("    id BIGINT PRIMARY KEY,\n");
                writer.write("    content TEXT NOT NULL,\n");
                writer.write("    username VARCHAR(50) NOT NULL,\n");
                writer.write("    create_time DATETIME NOT NULL,\n");
                writer.write("    ip_address VARCHAR(50),\n");
                writer.write("    device_info VARCHAR(255)\n");
                writer.write(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n");
                
                writer.write("-- 备份数据\n");
                for (Message message : messages) {
                    String sql = String.format(
                            "INSERT INTO message_backup_%s (id, content, username, create_time, ip_address, device_info) VALUES (%d, '%s', '%s', '%s', '%s', '%s');\n",
                            timestamp,
                            message.getId(),
                            escapeSql(message.getContent()),
                            escapeSql(message.getUsername()),
                            message.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                            escapeSql(message.getIpAddress()),
                            escapeSql(message.getDeviceInfo())
                    );
                    writer.write(sql);
                }
            }
            
            log.info("留言数据已备份到: {}", backupFile.getAbsolutePath());
            return backupFile.getAbsolutePath();
            
        } catch (IOException e) {
            log.error("备份留言数据失败", e);
            return null;
        }
    }
    
    /**
     * SQL字符串转义
     */
    private String escapeSql(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("'", "''").replace("\\", "\\\\");
    }
} 