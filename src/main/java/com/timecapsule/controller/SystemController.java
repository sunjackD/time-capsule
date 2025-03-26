package com.timecapsule.controller;

import com.timecapsule.dto.CountdownStatus;
import com.timecapsule.dto.Result;
import com.timecapsule.service.BackupService;
import com.timecapsule.service.CountdownService;
import com.timecapsule.service.LogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

/**
 * 系统控制器
 */
@RestController
@RequestMapping("/api/system")
@Slf4j
public class SystemController {
    
    @Autowired
    private CountdownService countdownService;
    
    @Autowired
    private LogService logService;
    
    @Autowired
    private BackupService backupService;
    
    /**
     * 获取倒计时状态
     */
    @GetMapping("/countdown")
    public Result<CountdownStatus> getCountdownStatus() {
        try {
            CountdownStatus status = countdownService.getCountdownStatus();
            return Result.success(status);
        } catch (Exception e) {
            log.error("获取倒计时状态失败", e);
            return Result.failed("获取倒计时状态失败");
        }
    }
    
    /**
     * 手动重置倒计时（仅用于测试）
     */
    @PostMapping("/reset-countdown")
    public Result<String> resetCountdown(HttpServletRequest request) {
        try {
            countdownService.resetCountdown();
            logService.logResetCountdown(request);
            return Result.success("重置倒计时成功");
        } catch (Exception e) {
            log.error("重置倒计时失败", e);
            return Result.failed("重置倒计时失败");
        }
    }
    
    /**
     * 手动备份留言数据
     */
    @PostMapping("/backup-messages")
    public Result<String> backupMessages(HttpServletRequest request) {
        try {
            String backupFilePath = backupService.backupMessagesToSql();
            if (backupFilePath != null) {
                return Result.success("留言数据备份成功，备份文件路径：" + backupFilePath);
            } else {
                return Result.failed("留言数据备份失败");
            }
        } catch (Exception e) {
            log.error("备份留言数据失败", e);
            return Result.failed("备份留言数据失败：" + e.getMessage());
        }
    }
} 