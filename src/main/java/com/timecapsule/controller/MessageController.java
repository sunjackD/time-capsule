package com.timecapsule.controller;

import com.timecapsule.entity.Message;
import com.timecapsule.service.CountdownService;
import com.timecapsule.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 消息控制器
 */
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {
    
    private final MessageService messageService;
    private final CountdownService countdownService;
    
    /**
     * 获取所有留言
     */
    @GetMapping
    public List<Message> getAllMessages() {
        return messageService.list();
    }
    
    /**
     * 根据ID获取留言
     */
    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable Long id) {
        Message message = messageService.getById(id);
        if (message != null) {
            return ResponseEntity.ok(message);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 添加新留言
     */
    @PostMapping
    public ResponseEntity<Object> createMessage(@RequestBody Map<String, Object> request) {
        HttpServletRequest servletRequest = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        
        // 获取请求参数
        String content = (String) request.get("content");
        String username = (String) request.get("username");
        
        if (content == null || content.trim().isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "留言内容不能为空");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // 创建消息对象
        Message message = new Message();
        message.setContent(content);
        message.setUsername(username != null && !username.trim().isEmpty() ? username : "匿名用户");
        message.setCreateTime(LocalDateTime.now());
        
        // 添加IP地址和设备信息
        message.setIpAddress(getClientIp(servletRequest));
        message.setDeviceInfo(servletRequest.getHeader("User-Agent"));
        
        // 保存消息
        messageService.save(message);
        
        // 重置倒计时
        countdownService.resetCountdown();
        log.info("用户发布新留言，倒计时已重置");
        
        return ResponseEntity.ok(message);
    }
    
    /**
     * 获取客户端IP地址
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