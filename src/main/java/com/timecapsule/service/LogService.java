package com.timecapsule.service;

import javax.servlet.http.HttpServletRequest;

/**
 * 日志服务接口
 */
public interface LogService {
    
    /**
     * 记录添加留言操作
     *
     * @param messageId 留言ID
     * @param request   HTTP请求
     */
    void logAddMessage(Long messageId, HttpServletRequest request);
    
    /**
     * 记录清空留言操作
     *
     * @param request HTTP请求
     */
    void logClearMessages(HttpServletRequest request);
    
    /**
     * 记录重置倒计时操作
     *
     * @param request HTTP请求
     */
    void logResetCountdown(HttpServletRequest request);
} 