// API端点
let MESSAGE_API = '/api/messages';
let COUNTDOWN_API = '/api/system/countdown';

// 全局变量
let targetDate = null;

// 全局计时器引用
let countdownTimer = null;
let countdownRefreshTimer = null; // 定期刷新倒计时的计时器

// DOM元素
let messageForm, messageContent, username, messageContainer, emptyMessage, notification;
let daysElement, hoursElement, minutesElement, secondsElement;

// 添加青春伤感的引用语数组
const youthQuotes = [
    "青春是一本太仓促的书，我们含着泪，一读再读。",
    "多少人曾爱慕你年轻时的容颜，可知谁愿承受岁月无情的变迁。",
    "时间就像一场雨，把我冲刷得很干净，再没有什么可以失去了。",
    "年轻时我们放弃，以为那只是一段感情，后来才知道，那是一生。",
    "曾经拥有的，不要忘记；已经失去的，更要珍惜；属于自己的，不要放弃。",
    "我们都是远行者，在时光的列车上，看着窗外匆匆滑过的风景和人生。",
    "青春是打开了就合不上的书，人生是踏上了就回不了头的路。",
    "岁月不饶人，但愿你能在喜欢的一切中找到生活的慰藉。",
    "时光静好，与君语；细水流年，与君同；繁华落尽，与君老。",
    "最好的年华里，我们走过，爱过，犯过的错，都变成了紫色的茧。"
];

// 初始化
async function init() {
    // 获取DOM元素
    // 检查并适配旧的HTML结构 (static/index.html) 或新的模板 (templates/index.html)
    messageForm = document.getElementById('messageForm') || document.getElementById('message-form');
    messageContent = document.getElementById('messageContent') || document.getElementById('message-content');
    username = document.getElementById('username');
    messageContainer = document.getElementById('messageContainer') || document.querySelector('.message-list-container');
    emptyMessage = document.getElementById('emptyMessage');
    notification = document.getElementById('notification');
    daysElement = document.getElementById('days');
    hoursElement = document.getElementById('hours');
    minutesElement = document.getElementById('minutes');
    secondsElement = document.getElementById('seconds');

    // 兼容旧的HTML结构
    const timerElement = document.getElementById('countdown') || document.getElementById('timer');
    if (timerElement && timerElement.id === 'timer') {
        // 如果是旧的HTML结构，我们需要手动创建天/时/分/秒的元素
        console.log('检测到旧版HTML结构，适配倒计时显示');
    }

    // 添加页面装饰元素
    addPageDecorations();

    console.log('DOM元素初始化:', {
        messageForm: !!messageForm,
        messageContent: !!messageContent,
        username: !!username,
        messageContainer: !!messageContainer,
        emptyMessage: !!emptyMessage,
        timerElement: !!timerElement
    });

    // 设置消息表单提交事件
    if (messageForm) {
        messageForm.addEventListener('submit', sendMessage);
    } else {
        console.error('找不到消息表单元素!');
    }
    
    // 如果找不到消息容器，创建一个临时的
    if (!messageContainer) {
        console.warn('找不到消息容器，创建临时容器');
        const messageList = document.querySelector('.message-list');
        if (messageList) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'message-list-container';
            messageList.appendChild(messageContainer);
        }
    }

    // 如果找不到空消息提示，创建一个
    if (!emptyMessage && messageContainer) {
        emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.id = 'emptyMessage';
        emptyMessage.innerHTML = '还没有任何留言，成为第一个分享心情的人吧！';
        messageContainer.appendChild(emptyMessage);
    }

    // 如果没有通知元素，创建一个
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        notification.id = 'notification';
        document.body.appendChild(notification);
    }
    
    // 加载所有现有消息
    await loadMessages();
    
    // 获取倒计时信息
    await fetchCountdown();
    
    // 设置定时刷新倒计时（每2分钟刷新一次）
    startCountdownRefreshTimer();
    
    // 设置页面加载动画效果
    document.querySelectorAll('.message-form, .message-list').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        setTimeout(() => {
            element.style.transition = 'all 0.8s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 300);
    });

    // 监听表单字段输入事件，添加动态效果
    if (messageContent) {
        messageContent.addEventListener('focus', () => {
            messageContent.parentElement.classList.add('input-active');
        });
        
        messageContent.addEventListener('blur', () => {
            messageContent.parentElement.classList.remove('input-active');
        });
    }
    
    // 监听滚动事件，添加视差效果
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const bgEffect = document.querySelector('.background-effect');
        const header = document.querySelector('header');
        
        if (bgEffect) bgEffect.style.transform = `translateY(${scrollY * 0.3}px)`;
        if (header) header.style.transform = `translateY(${scrollY * 0.1}px)`;
    });
}

// 添加页面装饰元素
function addPageDecorations() {
    // 移除倒计时标题
    const countdownTitle = document.querySelector('.countdown-title');
    if (countdownTitle) {
        countdownTitle.remove();
    }
    
    // 移除timer-info中的伤感提示
    const timerInfo = document.querySelector('.timer-info');
    if (timerInfo) {
        timerInfo.innerHTML = '';
    }
    
    // 在header中移除青春标语，只保留主标题和副标题
    const youthSlogan = document.querySelector('.youth-slogan');
    if (youthSlogan) {
        youthSlogan.remove();
    }
    
    // 移除消息表单中的伤感提示
    const formQuote = document.querySelector('.message-form .youth-quote');
    if (formQuote) {
        formQuote.remove();
    }
    
    // 添加24小时无人留言清除提示
    const timerContainer = document.querySelector('.timer-container');
    if (timerContainer) {
        const clearNotice = document.createElement('div');
        clearNotice.className = 'countdown-notice';
        clearNotice.textContent = '24小时无人驻足，青春痕迹随风消散';
        clearNotice.style.fontSize = '0.9rem';
        clearNotice.style.color = 'white';
        clearNotice.style.marginTop = '5px';
        clearNotice.style.textAlign = 'center';
        clearNotice.style.padding = '0 10px';
        timerContainer.appendChild(clearNotice);
    }
}

// 加载消息
async function loadMessages() {
    try {
        console.log('正在从API获取消息：', MESSAGE_API);
        const response = await fetch(MESSAGE_API);
        if (!response.ok) {
            throw new Error(`HTTP错误状态: ${response.status}`);
        }
        
        // 解析响应
        const responseData = await response.json();
        console.log('获取到响应数据:', responseData);
        
        // 确定消息数组的位置
        // 可能的情况：
        // 1. 直接返回数组: responseData 就是消息数组
        // 2. 返回对象，数据在 data 字段: responseData.data 是消息数组
        // 3. 返回对象，带有 code 和 data: responseData.data 是消息数组
        let messages = responseData;
        
        if (responseData && typeof responseData === 'object') {
            // 检查是否有 data 字段
            if (responseData.data !== undefined) {
                messages = responseData.data;
                console.log('从 responseData.data 提取消息');
            } 
            // 检查是否为分页对象
            else if (responseData.records !== undefined) {
                messages = responseData.records;
                console.log('从 responseData.records 提取消息');
            }
            // 检查是否为包装对象但没有明确的数据字段
            else if (!Array.isArray(responseData)) {
                // 尝试找到数组类型的字段
                for (const key in responseData) {
                    if (Array.isArray(responseData[key])) {
                        messages = responseData[key];
                        console.log(`从 responseData.${key} 提取消息`);
                        break;
                    }
                }
            }
        }
        
        // 确保 messages 是数组
        if (!Array.isArray(messages)) {
            console.warn('无法识别消息数组，使用空数组', messages);
            messages = [];
        }
        
        console.log('获取到消息数量:', messages.length);
        
        if (!messageContainer) {
            console.error('消息容器不存在，无法显示消息');
            return;
        }
        
        if (messages.length === 0) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            
            // 如果无法找到emptyMessage元素，则创建一个临时的空消息提示
            if (!emptyMessage) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'empty-message';
                emptyEl.textContent = '还没有任何留言，成为第一个分享心情的人吧！';
                messageContainer.appendChild(emptyEl);
            }
        } else {
            if (emptyMessage) emptyMessage.style.display = 'none';
            
            // 清空现有消息
            while (messageContainer.firstChild) {
                messageContainer.removeChild(messageContainer.firstChild);
            }
            
            // 添加消息到容器中（倒序展示，最新的在最上面）
            const messagesToDisplay = [...messages]; // 创建一个副本以避免修改原始数组
            messagesToDisplay.reverse().forEach((message, index) => {
                const messageElement = createMessageElement(message);
                messageElement.style.animationDelay = `${index * 0.1}s`;
                messageContainer.appendChild(messageElement);
            });
        }
    } catch (error) {
        showNotification('无法加载消息，请稍后重试', 'error');
        console.error('加载消息失败:', error);
    }
}

// 加载验证码
function loadCaptcha() {
    const captchaImage = document.getElementById('captchaImage');
    if (!captchaImage) {
        console.warn('验证码图片元素不存在');
        return;
    }
    
    // 添加时间戳防止缓存
    const timestamp = new Date().getTime();
    captchaImage.src = `${MESSAGE_API}/captcha?t=${timestamp}`;
    console.log('重新加载验证码图片:', `${MESSAGE_API}/captcha?t=${timestamp}`);
}

// 发送消息
async function sendMessage(event) {
    event.preventDefault();
    
    const content = messageContent.value.trim();
    const name = username.value.trim() || '匿名用户';
    
    if (!content) {
        showNotification('请输入留言内容', 'warning');
        messageContent.focus();
        return;
    }
    
    // 禁用表单
    const submitButton = messageForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> 发送中...';
    submitButton.classList.add('sending');
    
    try {
        // 构建请求数据
        const requestData = {
            content: content,
            username: name
        };
        
        console.log('发送留言数据:', { 
            ...requestData, 
            content: requestData.content.length > 20 ? requestData.content.substring(0, 20) + '...' : requestData.content 
        });
        
        const response = await fetch(MESSAGE_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
            // 清空表单
            messageContent.value = '';
            
            // 重新加载消息
            await loadMessages();
            
            // 重新获取倒计时信息
            await fetchCountdown(true);
            
            // 添加一点动画效果
            const messageList = document.querySelector('.message-list');
            if (messageList) {
                messageList.classList.add('highlight');
                setTimeout(() => {
                    messageList.classList.remove('highlight');
                }, 1000);
            }
        } else {
            // 尝试解析错误消息
            let errorMsg = '服务器响应错误';
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMsg = errorData.message;
                } else if (errorData && errorData.error) {
                    errorMsg = errorData.error;
                } else if (errorData && typeof errorData === 'string') {
                    errorMsg = errorData;
                }
            } catch (parseError) {
                console.error('解析错误响应失败:', parseError);
                errorMsg = `服务器响应: ${response.status} ${response.statusText}`;
            }
            
            throw new Error(errorMsg);
        }
    } catch (error) {
        showNotification(error.message || '发送留言失败，请稍后重试', 'error');
        console.error('发送留言失败:', error);
    } finally {
        // 恢复表单
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        submitButton.classList.remove('sending');
    }
}

// 获取倒计时信息
async function fetchCountdown(afterMessageSubmit = false) {
    try {
        console.log('获取倒计时信息，API路径:', COUNTDOWN_API);
        const response = await fetch(COUNTDOWN_API, {
            // 添加缓存控制，确保获取最新数据
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误状态: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('获取到倒计时数据:', responseData);
        
        // 清除现有计时器
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        
        // 保存旧的目标时间（用于检测是否有变化）
        const oldTargetDate = targetDate ? new Date(targetDate) : null;
        
        // 提取目标时间，API可能有不同的返回格式
        let targetTimeStr = null;
        
        // 尝试不同的格式
        if (responseData && typeof responseData === 'object') {
            // 1. 直接包含targetTime字段
            if (responseData.targetTime) {
                targetTimeStr = responseData.targetTime;
            } 
            // 2. 包含在data字段中
            else if (responseData.data && responseData.data.targetTime) {
                targetTimeStr = responseData.data.targetTime;
            }
            // 3. 使用endTime字段
            else if (responseData.endTime) {
                targetTimeStr = responseData.endTime;
            }
            // 4. 使用data.endTime字段
            else if (responseData.data && responseData.data.endTime) {
                targetTimeStr = responseData.data.endTime;
            }
            // 5. 使用countdown_end_time字段
            else if (responseData.countdown_end_time) {
                targetTimeStr = responseData.countdown_end_time;
            }
            // 6. 使用data.countdown_end_time字段
            else if (responseData.data && responseData.data.countdown_end_time) {
                targetTimeStr = responseData.data.countdown_end_time;
            }
            // 7. 尝试寻找time、date结尾的字段
            else {
                for (const key in responseData) {
                    if (key.endsWith('Time') || key.endsWith('time') || 
                        key.endsWith('Date') || key.endsWith('date')) {
                        const value = responseData[key];
                        if (typeof value === 'string' || value instanceof Date) {
                            targetTimeStr = value;
                            console.log(`从字段 ${key} 提取倒计时时间:`, targetTimeStr);
                            break;
                        }
                    }
                }
                
                // 如果还没找到，尝试在data对象中寻找
                if (!targetTimeStr && responseData.data) {
                    for (const key in responseData.data) {
                        if (key.endsWith('Time') || key.endsWith('time') || 
                            key.endsWith('Date') || key.endsWith('date')) {
                            const value = responseData.data[key];
                            if (typeof value === 'string' || value instanceof Date) {
                                targetTimeStr = value;
                                console.log(`从字段 data.${key} 提取倒计时时间:`, targetTimeStr);
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        // 如果找不到时间，创建一个24小时后的时间
        if (!targetTimeStr) {
            console.warn('无法从API响应中提取倒计时时间，使用默认24小时');
            const defaultDate = new Date();
            defaultDate.setHours(defaultDate.getHours() + 24);
            targetTimeStr = defaultDate.toISOString();
        }
        
        console.log('设置倒计时目标时间:', targetTimeStr);
        
        // 设置目标日期
        targetDate = new Date(targetTimeStr);
        
        // 检查倒计时是否有变化
        let countdownChanged = false;
        if (oldTargetDate) {
            // 如果新旧时间差异超过1秒，认为倒计时已更新
            countdownChanged = Math.abs(targetDate - oldTargetDate) > 1000;
            console.log('倒计时是否变化:', countdownChanged, 
                        '旧时间:', oldTargetDate.toISOString(), 
                        '新时间:', targetDate.toISOString());
        }
        
        // 更新倒计时
        updateCountdown();
        
        // 如果倒计时有变化，添加动画效果
        if (countdownChanged) {
            // 获取倒计时元素
            const timerElement = document.getElementById('countdown') || document.getElementById('timer');
            const timerContainer = document.querySelector('.timer-container');
            
            // 添加更新动画
            if (timerElement) {
                timerElement.classList.add('timer-updated');
                setTimeout(() => {
                    timerElement.classList.remove('timer-updated');
                }, 1500);
            } else if (timerContainer) {
                timerContainer.classList.add('timer-updated');
                setTimeout(() => {
                    timerContainer.classList.remove('timer-updated');
                }, 1500);
            }
            
            // 只在提交留言后显示倒计时更新通知
            if (afterMessageSubmit) {
                showNotification('留言已成功发送！倒计时已更新', 'success');
            }
        } else if (afterMessageSubmit) {
            // 如果是在提交留言后但倒计时没变，仍然显示留言成功
            showNotification('留言已成功发送', 'success');
        }
        
        // 每秒更新倒计时
        countdownTimer = setInterval(updateCountdown, 1000);
    } catch (error) {
        console.error('获取倒计时信息失败:', error);
        
        // 获取倒计时元素
        const countdown = document.getElementById('countdown');
        const timer = document.getElementById('timer');
        
        // 显示错误消息
        if (countdown) {
            countdown.textContent = '无法获取倒计时信息';
        }
        if (timer) {
            timer.textContent = '--:--:--';
        }
        
        // 创建默认倒计时（24小时后）
        const defaultDate = new Date();
        defaultDate.setHours(defaultDate.getHours() + 24);
        targetDate = defaultDate;
        
        // 更新倒计时，并每秒更新一次
        updateCountdown();
        countdownTimer = setInterval(updateCountdown, 1000);
        
        // 留言后发生错误，显示留言成功但倒计时更新失败
        if (afterMessageSubmit) {
            showNotification('留言已发送，但无法更新倒计时', 'warning');
        }
    }
}

// 更新倒计时显示
function updateCountdown() {
    if (!targetDate) return;
    
    const now = new Date();
    const difference = targetDate - now;
    
    // 获取倒计时元素（兼容新旧两种HTML结构）
    const timerElement = document.getElementById('countdown') || document.getElementById('timer');
    
    // 检查倒计时是否已结束
    if (difference <= 0) {
        // 处理新版HTML结构
        if (daysElement && hoursElement && minutesElement && secondsElement) {
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
        } 
        // 处理旧版HTML结构
        else if (timerElement) {
            timerElement.textContent = '00:00:00';
        }
        
        if (timerElement) {
            timerElement.style.color = '#e74c3c';
        }
        
        showNotification('倒计时已结束，所有消息已清除', 'warning');
        return;
    }
    
    // 计算时间差
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    // 为数字添加前导零
    const formatTime = (num) => num.toString().padStart(2, '0');
    
    // 更新新版HTML结构
    if (daysElement && hoursElement && minutesElement && secondsElement) {
        daysElement.textContent = formatTime(days);
        hoursElement.textContent = formatTime(hours);
        minutesElement.textContent = formatTime(minutes);
        secondsElement.textContent = formatTime(seconds);
        
        // 更新倒计时结构，使用时间单位样式
        const updateTimeUnit = (element, value, label) => {
            const parent = element.parentElement;
            if (parent && !parent.classList.contains('time-unit')) {
                // 创建时间单位结构
                const wrapper = document.createElement('div');
                wrapper.className = 'time-unit';
                
                // 将元素包装起来
                parent.replaceChild(wrapper, element);
                wrapper.appendChild(element);
                
                // 添加标签
                const labelElement = document.createElement('span');
                labelElement.className = 'label';
                labelElement.textContent = label;
                wrapper.appendChild(labelElement);
                
                // 给值添加一个class
                element.className = 'value';
            }
        };
        
        // 更新各个时间单位的结构
        updateTimeUnit(daysElement, days, '天');
        updateTimeUnit(hoursElement, hours, '时');
        updateTimeUnit(minutesElement, minutes, '分');
        updateTimeUnit(secondsElement, seconds, '秒');
    } 
    // 更新旧版HTML结构
    else if (timerElement) {
        // 旧版HTML中显示时:分:秒格式
        const displayHours = days * 24 + hours; // 将天数转换为小时
        timerElement.textContent = `${formatTime(displayHours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
    }
    
    // 根据剩余时间设置颜色
    if (timerElement) {
        if (days === 0 && hours < 6) {
            timerElement.style.color = '#e74c3c';
            // 添加一个脉冲动画效果
            if (!timerElement.classList.contains('pulse')) {
                timerElement.classList.add('pulse');
            }
        } else if (days === 0 && hours < 24) {
            timerElement.style.color = '#f39c12';
            // 移除脉冲效果
            timerElement.classList.remove('pulse');
        } else {
            timerElement.style.color = '#3498db';
            // 移除脉冲效果
            timerElement.classList.remove('pulse');
        }
    }
}

// 创建消息元素
function createMessageElement(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // 防止空消息对象导致错误
    if (!message) {
        console.error('消息对象为空');
        messageElement.innerHTML = '<div class="message-content">无效的消息数据</div>';
        return messageElement;
    }
    
    console.log('创建消息元素，消息数据:', message);
    
    // 获取消息内容
    let content = message.content || '';
    
    // 处理后端返回"<<BLOB>>"标记的特殊情况
    if (content === '<<BLOB>>' || (typeof content === 'string' && content.includes('<<BLOB>>'))) {
        console.warn('检测到BLOB标记内容，尝试通过单独API请求获取完整内容');
        content = '该消息内容为长文本或特殊格式，正在加载...';
        
        // 如果有消息ID，可以尝试单独获取内容
        if (message.id) {
            const messageId = message.id;
            // 创建对消息内容的异步加载
            setTimeout(async () => {
                try {
                    // 尝试通过单独API获取完整内容
                    const response = await fetch(`${MESSAGE_API}/${messageId}`);
                    if (response.ok) {
                        const messageData = await response.json();
                        // 确定内容字段的位置
                        let fullContent = '';
                        if (messageData.content) {
                            fullContent = messageData.content;
                        } else if (messageData.data && messageData.data.content) {
                            fullContent = messageData.data.content;
                        }
                        
                        // 更新消息内容
                        if (fullContent && fullContent !== '<<BLOB>>') {
                            const contentEl = messageElement.querySelector('.message-content');
                            if (contentEl) {
                                contentEl.innerHTML = formatContent(fullContent);
                            }
                        }
                    }
                } catch (error) {
                    console.error('无法获取消息完整内容:', error);
                }
            }, 500);
        }
    }
    
    // 获取用户名，如果没有则显示"匿名用户"
    const username = message.username || '匿名用户';
    
    // 尝试获取创建时间
    let createTimeStr = '';
    let createTimeDate = null;
    
    // 尝试多种可能的时间字段名
    if (message.createTime) {
        createTimeStr = message.createTime;
    } else if (message.create_time) {
        createTimeStr = message.create_time;
    } else if (message.createdAt) {
        createTimeStr = message.createdAt;
    } else if (message.created_at) {
        createTimeStr = message.created_at;
    } else if (message.timestamp) {
        createTimeStr = message.timestamp;
    } else if (message.time) {
        createTimeStr = message.time;
    }
    
    // 尝试解析日期
    try {
        if (createTimeStr) {
            createTimeDate = new Date(createTimeStr);
        } else {
            // 如果没有找到时间字段，使用当前时间
            createTimeDate = new Date();
        }
    } catch (e) {
        console.warn('无法解析消息时间:', createTimeStr, e);
        createTimeDate = new Date(); // 使用当前时间作为后备
    }
    
    // 格式化日期
    let formattedDate = '';
    try {
        formattedDate = createTimeDate.toLocaleString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.warn('无法格式化日期:', e);
        formattedDate = createTimeStr || '未知时间';
    }
    
    // 检测使用哪种图标
    const usingBootstrapIcons = document.querySelector('link[href*="bootstrap-icons"]') !== null;
    const clockIcon = usingBootstrapIcons ? '<i class="bi bi-clock"></i>' : '<i class="fas fa-clock"></i>';
    
    // 构建消息HTML，移除伤感语录
    messageElement.innerHTML = `
        <div class="message-content">${formatContent(content)}</div>
        <div class="message-meta">
            <span class="username">${username}</span>
            <span class="timestamp">${clockIcon} ${formattedDate}</span>
        </div>
    `;
    
    return messageElement;
}

// 格式化消息内容（处理换行符和安全性）
function formatContent(content) {
    // 处理空内容
    if (!content) return '';
    
    // 如果内容是Blob或二进制对象
    if (typeof content !== 'string') {
        // 尝试将内容转换为字符串
        try {
            if (content instanceof Blob) {
                console.warn('内容是Blob对象，尝试转换为文本');
                // 这里我们返回一个提示，不进行Blob转换（这需要异步操作）
                return '[Blob内容] - 请刷新页面查看完整内容';
            } else {
                return String(content);
            }
        } catch (e) {
            console.error('无法转换内容到字符串:', e);
            return '[无法显示的内容]';
        }
    }
    
    // 对HTML进行编码，防止XSS攻击
    const safeContent = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    
    // 处理换行符
    return safeContent.replace(/\n/g, '<br>');
}

// 显示通知
function showNotification(message, type = 'success') {
    // 如果没有找到通知元素，创建一个临时的
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        notification.id = 'notification';
        document.body.appendChild(notification);
    }
    
    // 清除现有类名，重置状态
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('show');
    
    // 确定使用哪种图标库 (bootstrap-icons 或 font-awesome)
    const usingBootstrapIcons = document.querySelector('link[href*="bootstrap-icons"]') !== null;
    
    // 添加适当的图标
    if (usingBootstrapIcons) {
        // 使用 Bootstrap Icons
        switch(type) {
            case 'success':
                notification.innerHTML = `<i class="bi bi-check-circle"></i> ${message}`;
                break;
            case 'error':
                notification.innerHTML = `<i class="bi bi-x-circle"></i> ${message}`;
                break;
            case 'warning':
                notification.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${message}`;
                break;
        }
    } else {
        // 使用 Font Awesome
        switch(type) {
            case 'success':
                notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
                break;
            case 'error':
                notification.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
                break;
            case 'warning':
                notification.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
                break;
        }
    }
    
    // 设置动画
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 设置定时刷新倒计时（每2分钟刷新一次）
function startCountdownRefreshTimer() {
    // 先清除已有的刷新计时器
    if (countdownRefreshTimer) {
        clearInterval(countdownRefreshTimer);
        countdownRefreshTimer = null;
    }
    
    console.log('启动倒计时自动刷新计时器，间隔为 2 分钟');
    
    // 设置新的刷新计时器，每2分钟刷新一次
    countdownRefreshTimer = setInterval(async () => {
        console.log('执行定时倒计时刷新');
        try {
            await fetchCountdown();
            console.log('倒计时自动刷新成功');
        } catch (error) {
            console.error('倒计时自动刷新失败:', error);
        }
    }, 2 * 60 * 1000); // 2分钟
    
    // 页面关闭或刷新时清除计时器
    window.addEventListener('beforeunload', () => {
        if (countdownRefreshTimer) {
            clearInterval(countdownRefreshTimer);
        }
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }
    });
}

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 