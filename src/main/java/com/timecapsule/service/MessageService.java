package com.timecapsule.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.timecapsule.dto.MessageDTO;
import com.timecapsule.entity.Message;

import java.util.List;

/**
 * 留言服务接口
 */
public interface MessageService extends IService<Message> {
    
    /**
     * 获取所有留言
     *
     * @return 留言列表
     */
    List<MessageDTO> getAllMessages();
    
    /**
     * 添加留言
     *
     * @param message 留言实体
     * @return 添加后的留言DTO
     */
    MessageDTO addMessage(Message message);
    
    /**
     * 删除所有留言
     */
    void deleteAllMessages();
    
    /**
     * 检查最后留言时间
     *
     * @return 是否需要重置倒计时
     */
    boolean shouldResetCountdown();
} 