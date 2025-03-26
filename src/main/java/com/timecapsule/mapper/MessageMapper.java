package com.timecapsule.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.timecapsule.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;

/**
 * 留言Mapper接口
 */
@Mapper
public interface MessageMapper extends BaseMapper<Message> {
    
    /**
     * 查询最后一条留言的时间
     *
     * @return 最后留言时间
     */
    @Select("SELECT MAX(create_time) FROM message")
    LocalDateTime findLastMessageTime();
} 