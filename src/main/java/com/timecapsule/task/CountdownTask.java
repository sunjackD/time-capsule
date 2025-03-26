package com.timecapsule.task;

import com.timecapsule.service.BackupService;
import com.timecapsule.service.CountdownService;
import com.timecapsule.service.LogService;
import com.timecapsule.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 倒计时定时任务
 */
@Component
@Slf4j
public class CountdownTask {
    
    @Autowired
    private CountdownService countdownService;
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private LogService logService;
    
    @Autowired
    private BackupService backupService;
    
    /**
     * 定时检查倒计时是否过期
     * 每分钟执行一次
     */
    @Scheduled(fixedDelayString = "${time-capsule.countdown.check-interval:60000}")
    public void checkCountdownStatus() {
        log.info("执行倒计时检查任务...");
        
        // 检查倒计时是否过期
        if (countdownService.isCountdownExpired()) {
            log.info("倒计时已过期，开始清理留言...");
            
            // 先备份留言数据
            String backupFilePath = backupService.backupMessagesToSql();
            if (backupFilePath != null) {
                log.info("留言数据已备份到: {}", backupFilePath);
            } else {
                log.warn("留言数据备份失败，但将继续清理留言");
            }
            
            // 清空所有留言
            messageService.deleteAllMessages();
            
            // 记录日志
            logService.logClearMessages(null);
            
            // 重置倒计时
            countdownService.resetCountdown();
            
            log.info("留言清理完成，已重置倒计时");
        }
    }
} 