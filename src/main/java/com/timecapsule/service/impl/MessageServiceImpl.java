package com.timecapsule.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.timecapsule.dto.MessageDTO;
import com.timecapsule.entity.Message;
import com.timecapsule.mapper.MessageMapper;
import com.timecapsule.service.CountdownService;
import com.timecapsule.service.MessageService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 留言服务实现类
 */
@Service
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message> implements MessageService {
    
    @Autowired
    private CountdownService countdownService;
    
    @Override
    public List<MessageDTO> getAllMessages() {
        // 按创建时间降序排列
        LambdaQueryWrapper<Message> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByDesc(Message::getCreateTime);
        
        // 转换为DTO
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return this.list(queryWrapper).stream()
                .map(message -> {
                    MessageDTO dto = new MessageDTO();
                    BeanUtils.copyProperties(message, dto);
                    dto.setFormattedTime(message.getCreateTime().format(formatter));
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public MessageDTO addMessage(Message message) {
        // 设置创建时间
        message.setCreateTime(LocalDateTime.now());
        
        // 保存留言
        this.save(message);
        
        // 重置倒计时
        countdownService.resetCountdown();
        
        // 转换为DTO
        MessageDTO dto = new MessageDTO();
        BeanUtils.copyProperties(message, dto);
        dto.setFormattedTime(message.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        return dto;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAllMessages() {
        this.remove(null);
    }
    
    @Override
    public boolean shouldResetCountdown() {
        LocalDateTime lastMessageTime = this.baseMapper.findLastMessageTime();
        return lastMessageTime != null;
    }
} 