package com.timecapsule.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.timecapsule.entity.SystemConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;

/**
 * 系统配置Mapper接口
 */
@Mapper
public interface SystemConfigMapper extends BaseMapper<SystemConfig> {
    
    /**
     * 根据配置键获取配置值
     *
     * @param configKey 配置键
     * @return 配置值
     */
    @Select("SELECT config_value FROM system_config WHERE config_key = #{configKey}")
    String getConfigValueByKey(String configKey);
    
    /**
     * 更新倒计时结束时间
     *
     * @param endTime 结束时间
     * @return 影响行数
     */
    @Update("UPDATE system_config SET countdown_end_time = #{endTime}, last_message_time = NOW() WHERE config_key = 'COUNTDOWN_HOURS'")
    int updateCountdownEndTime(LocalDateTime endTime);
    
    /**
     * 获取当前倒计时结束时间
     *
     * @return 倒计时结束时间
     */
    @Select("SELECT countdown_end_time FROM system_config WHERE config_key = 'COUNTDOWN_HOURS'")
    LocalDateTime getCountdownEndTime();
} 