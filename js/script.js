document.addEventListener('DOMContentLoaded', () => {
    // 模拟数据 - 在真实环境会从后端获取
    let mockMessages = [
        {
            id: 1,
            content: "岁月如歌，留下美好回忆。",
            username: "往事随风",
            timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString() // 2小时前
        },
        {
            id: 2,
            content: "时光荏苒，我们在这里留下足迹。感谢这个平台让我能分享自己的想法和心情。",
            username: "时光旅人",
            timestamp: new Date(Date.now() - 3600000).toLocaleString() // 1小时前
        },
        {
            id: 3,
            content: "希望多年以后再回来看，依然能找到当初的感动。",
            username: "未来访客",
            timestamp: new Date().toLocaleString() // 现在
        }
    ];

    // 从本地存储加载消息
    const loadMessagesFromStorage = () => {
        const storedMessages = localStorage.getItem('messages');
        if (storedMessages) {
            try {
                mockMessages = JSON.parse(storedMessages);
            } catch (e) {
                console.error('Failed to parse stored messages', e);
            }
        }
    };

    // 保存消息到本地存储
    const saveMessagesToStorage = () => {
        localStorage.setItem('messages', JSON.stringify(mockMessages));
    };

    // 尝试从本地存储加载消息
    loadMessagesFromStorage();

    // 渲染留言列表
    const messageListEl = document.querySelector('.message-list-container');
    
    function renderMessages() {
        if (mockMessages.length === 0) {
            messageListEl.innerHTML = '<div class="empty-message">还没有留言，快来说点什么吧！</div>';
            return;
        }
        
        messageListEl.innerHTML = '';
        mockMessages.forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = 'message';
            messageEl.innerHTML = `
                <div class="message-content">${message.content}</div>
                <div class="message-meta">
                    <span class="username">${message.username}</span>
                    <span class="timestamp">${message.timestamp}</span>
                </div>
            `;
            messageListEl.appendChild(messageEl);
            
            // 添加淡入动画效果
            setTimeout(() => {
                messageEl.style.opacity = 1;
            }, 10);
        });
    }
    
    renderMessages();
    
    // 提交新留言
    const messageForm = document.getElementById('message-form');
    const messageContent = document.getElementById('message-content');
    const usernameInput = document.getElementById('username');
    
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const content = messageContent.value.trim();
        const username = usernameInput.value.trim() || '匿名用户';
        
        if (!content) {
            showNotification('请输入留言内容！', 'error');
            return;
        }
        
        // 添加新留言
        const newMessage = {
            id: Date.now(),
            content,
            username,
            timestamp: new Date().toLocaleString()
        };
        
        mockMessages.unshift(newMessage); // 添加到开头
        
        // 保存到本地存储
        saveMessagesToStorage();
        
        // 更新UI
        renderMessages();
        
        // 显示成功通知
        showNotification('留言成功！', 'success');
        
        // 清空表单
        messageContent.value = '';
        usernameInput.value = '';
        
        // 重置倒计时
        resetTimer();
    });
    
    // 通知函数
    function showNotification(message, type) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动移除通知
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // 倒计时
    const timerEl = document.getElementById('timer');
    let hours = 23;
    let minutes = 59;
    let seconds = 59;
    let timerInterval;
    
    // 从本地存储加载倒计时
    const loadTimerFromStorage = () => {
        const storedTimer = localStorage.getItem('timer');
        if (storedTimer) {
            try {
                const { h, m, s, lastUpdate } = JSON.parse(storedTimer);
                
                // 计算经过的时间
                const now = Date.now();
                const elapsed = Math.floor((now - lastUpdate) / 1000);
                
                if (elapsed < 24 * 60 * 60) {
                    // 更新倒计时
                    let totalSeconds = h * 3600 + m * 60 + s - elapsed;
                    if (totalSeconds < 0) totalSeconds = 0;
                    
                    hours = Math.floor(totalSeconds / 3600);
                    minutes = Math.floor((totalSeconds % 3600) / 60);
                    seconds = totalSeconds % 60;
                } else {
                    // 超过24小时，清空消息
                    clearMessages();
                }
            } catch (e) {
                console.error('Failed to parse stored timer', e);
            }
        }
    };
    
    // 保存倒计时到本地存储
    const saveTimerToStorage = () => {
        localStorage.setItem('timer', JSON.stringify({
            h: hours,
            m: minutes,
            s: seconds,
            lastUpdate: Date.now()
        }));
    };
    
    // 尝试从本地存储加载倒计时
    loadTimerFromStorage();
    
    function updateTimer() {
        timerEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 更改颜色以反映紧急程度
        if (hours < 1) {
            timerEl.style.color = '#e74c3c'; // 红色表示少于1小时
        } else if (hours < 5) {
            timerEl.style.color = '#f39c12'; // 橙色表示少于5小时
        } else {
            timerEl.style.color = 'var(--primary-color)'; // 默认颜色
        }
        
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            
            if (minutes < 0) {
                minutes = 59;
                hours--;
                
                if (hours < 0) {
                    // 时间到，清空留言
                    clearMessages();
                    
                    // 重置为24小时
                    resetTimer();
                }
            }
        }
        
        // 每分钟保存一次倒计时状态
        if (seconds === 0) {
            saveTimerToStorage();
        }
    }
    
    function resetTimer() {
        hours = 23;
        minutes = 59;
        seconds = 59;
        saveTimerToStorage();
    }
    
    function clearMessages() {
        mockMessages = [];
        saveMessagesToStorage();
        renderMessages();
        showNotification('24小时内无新留言，系统已自动清理历史数据！', 'warning');
    }
    
    // 启动定时器
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // 立即更新一次
    
    // 添加页面可见性检测，避免在后台时计时不准确
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // 页面可见时，重新加载数据
            loadMessagesFromStorage();
            loadTimerFromStorage();
            renderMessages();
            
            // 重启计时器
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
            updateTimer();
        } else {
            // 页面不可见时，保存状态并清除计时器
            saveMessagesToStorage();
            saveTimerToStorage();
            clearInterval(timerInterval);
        }
    });
    
    // 在页面关闭或刷新前保存状态
    window.addEventListener('beforeunload', () => {
        saveMessagesToStorage();
        saveTimerToStorage();
    });
}); 