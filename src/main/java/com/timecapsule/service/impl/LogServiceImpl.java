package com.timecapsule.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.timecapsule.entity.OperationLog;
import com.timecapsule.mapper.OperationLogMapper;
import com.timecapsule.service.LogService;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

/**
 * 日志服务实现类
 */
@Service
public class LogServiceImpl extends ServiceImpl<OperationLogMapper, OperationLog> implements LogService {
    
    @Override
    public void logAddMessage(Long messageId, HttpServletRequest request) {
        saveLog("ADD_MESSAGE", messageId, "添加留言", request);
    }
    
    @Override
    public void logClearMessages(HttpServletRequest request) {
        saveLog("CLEAR_MESSAGES", null, "清空所有留言", request);
    }
    
    @Override
    public void logResetCountdown(HttpServletRequest request) {
        saveLog("RESET_COUNTDOWN", null, "重置倒计时", request);
    }
    
    /**
     * 保存操作日志
     *
     * @param operationType 操作类型
     * @param messageId     留言ID
     * @param description   描述
     * @param request       HTTP请求
     */
    private void saveLog(String operationType, Long messageId, String description, HttpServletRequest request) {
        OperationLog log = new OperationLog();
        log.setOperationType(operationType);
        log.setOperationTime(LocalDateTime.now());
        log.setMessageId(messageId);
        log.setDescription(description);
        
        // 获取客户端信息
        if (request != null) {
            log.setIpAddress(getClientIp(request));
            log.setDeviceInfo(request.getHeader("User-Agent"));
        }
        
        this.save(log);
    }
    
    /**
     * 获取客户端IP地址
     *
     * @param request HTTP请求
     * @return IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
} 