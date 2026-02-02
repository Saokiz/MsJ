        // 背景音乐
        const bgMusic = new Audio('music/匿名好友.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.5;

        function tryAutoPlay() {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    console.log('音乐自动播放成功');
                }).catch(error => {
                    console.log('自动播放被阻止，等待用户交互');
                });
            }
        }

        // 页面点击时播放（浏览器需要用户交互）
        document.addEventListener('click', () => {
            if (bgMusic.paused) {
                tryAutoPlay();
            }
        });

        // 页面可见性变化时尝试播放
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && bgMusic.paused) {
                tryAutoPlay();
            }
        });

        // 分页功能
        let currentPage = 0;
        const itemsPerPage = 3;
        const largeWidgets = document.querySelectorAll('[data-widget="large"]');
        const totalPages = Math.ceil(largeWidgets.length / itemsPerPage);

        function updatePagination() {
            largeWidgets.forEach((widget, index) => {
                const pageIndex = Math.floor(index / itemsPerPage);
                if (pageIndex === currentPage) {
                    widget.classList.remove('hidden');
                } else {
                    widget.classList.add('hidden');
                }
            });

            document.getElementById('currentPageNum').textContent = currentPage + 1;
            document.getElementById('totalPageNum').textContent = totalPages;
            document.getElementById('prevPageBtn').disabled = currentPage === 0;
            document.getElementById('nextPageBtn').disabled = currentPage === totalPages - 1;
        }

        document.getElementById('prevPageBtn').addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                updatePagination();
            }
        });

        document.getElementById('nextPageBtn').addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                updatePagination();
            }
        });

        updatePagination();

        // 转盘抽奖
        const wheelCanvas = document.getElementById('wheelCanvas');
        const wheelCtx = wheelCanvas.getContext('2d');
        const wheelItems = ['大奖', '谢谢', '中奖', '再试', '幸运', '加油', '惊喜', '你好'];
        const wheelColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
        let wheelRotation = 0;
        let isSpinning = false;

        function drawWheel() {
            const centerX = wheelCanvas.width / 2;
            const centerY = wheelCanvas.height / 2;
            const radius = wheelCanvas.width / 2 - 5;
            const sliceAngle = (2 * Math.PI) / wheelItems.length;

            wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

            for (let i = 0; i < wheelItems.length; i++) {
                const startAngle = wheelRotation + i * sliceAngle;
                const endAngle = startAngle + sliceAngle;

                wheelCtx.beginPath();
                wheelCtx.moveTo(centerX, centerY);
                wheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
                wheelCtx.closePath();
                wheelCtx.fillStyle = wheelColors[i];
                wheelCtx.fill();
                wheelCtx.strokeStyle = 'white';
                wheelCtx.lineWidth = 2;
                wheelCtx.stroke();

                wheelCtx.save();
                wheelCtx.translate(centerX, centerY);
                wheelCtx.rotate(startAngle + sliceAngle / 2);
                wheelCtx.fillStyle = 'white';
                wheelCtx.font = 'bold 14px Arial';
                wheelCtx.textAlign = 'center';
                wheelCtx.fillText(wheelItems[i], radius - 20, 5);
                wheelCtx.restore();
            }

            wheelCtx.beginPath();
            wheelCtx.moveTo(centerX, centerY);
            wheelCtx.lineTo(centerX, 5);
            wheelCtx.strokeStyle = '#333';
            wheelCtx.lineWidth = 3;
            wheelCtx.stroke();
        }

        document.getElementById('spinWheel').addEventListener('click', () => {
            if (isSpinning) return;
            isSpinning = true;
            const spins = 5 + Math.random() * 5;
            const targetRotation = wheelRotation + spins * 2 * Math.PI;
            const duration = 3000;
            const startTime = Date.now();
            const startRotation = wheelRotation;

            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                wheelRotation = startRotation + (targetRotation - startRotation) * easeOut;
                drawWheel();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    isSpinning = false;
                    const normalizedRotation = (wheelRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
                    const selectedIndex = Math.floor((2 * Math.PI - normalizedRotation) / ((2 * Math.PI) / wheelItems.length)) % wheelItems.length;
                    document.getElementById('wheelResult').textContent = '🎉 恭喜你抽中: ' + wheelItems[selectedIndex];
                }
            }
            animate();
        });
        drawWheel();

        // 绘画板
        const drawCanvas = document.getElementById('drawCanvas');
        const drawCtx = drawCanvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
        drawCtx.fillStyle = 'white';
        drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

        drawCanvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = drawCanvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
        });

        drawCanvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = drawCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            drawCtx.beginPath();
            drawCtx.moveTo(lastX, lastY);
            drawCtx.lineTo(x, y);
            drawCtx.strokeStyle = document.getElementById('drawColor').value;
            drawCtx.lineWidth = document.getElementById('brushSize').value;
            drawCtx.stroke();

            lastX = x;
            lastY = y;
        });

        drawCanvas.addEventListener('mouseup', () => isDrawing = false);
        drawCanvas.addEventListener('mouseout', () => isDrawing = false);

        document.getElementById('clearCanvas').addEventListener('click', () => {
            drawCtx.fillStyle = 'white';
            drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        });

        document.getElementById('saveCanvas').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'my-drawing.png';
            link.href = drawCanvas.toDataURL();
            link.click();
        });

        // 随机笑话
        const jokes = [
            '程序员为什么总是分不清万圣节和圣诞节？因为 Oct 31 = Dec 25。',
            '一个程序员的妻子让他去超市："买一瓶奶，如果有鸡蛋，买十瓶。"程序员回家时带了十瓶奶。妻子问："为什么买这么多？"程序员回答："他们有鸡蛋。"',
            '程序员最讨厌的两个数字：1.0 和 0.1，因为这会变成浮点数比较问题。',
            '为什么程序员分不清左手和右手？因为都是"side"。',
            '程序员说他很忙，因为他有99个bug还没修，修复了一个，现在有100个bug。',
            '为什么Java程序员要戴眼镜？因为他们看不清C#。',
            '程序员说："我的代码没有bug！"上帝笑了。',
            '为什么程序员讨厌户外？因为那里太多Bug了。',
            '程序员在海滩上，别人捡了几个贝壳，他却捡了一个shell。',
            '老婆让程序员去买包烟，如果有西瓜，就买一个。程序员回家了，老婆问："怎么买了个西瓜？"程序员说："他们有烟。"',
            '为什么程序员不喜欢大自然？因为那里没有Ctrl+Z。',
            '程序员的三个愿望：1. 更快的电脑 2. 更多内存 3. 还要写代码。',
            '程序员说："我已经优化了代码，现在只需要两个程序员就能读懂。"'
        ];
        let jokeCount = 0;
        let shownJokes = [];

        function getRandomJoke() {
            const availableJokes = jokes.filter((_, index) => !shownJokes.includes(index));
            if (availableJokes.length === 0) {
                shownJokes = [];
                return jokes[Math.floor(Math.random() * jokes.length)];
            }
            const randomIndex = jokes.indexOf(availableJokes[Math.floor(Math.random() * availableJokes.length)]);
            shownJokes.push(randomIndex);
            return jokes[randomIndex];
        }

        document.getElementById('jokeContent').textContent = getRandomJoke();

        document.getElementById('getJoke').addEventListener('click', () => {
            jokeCount++;
            document.getElementById('jokeCount').textContent = jokeCount;
            document.getElementById('jokeContent').textContent = getRandomJoke();
        });

        // 计数器1
        let count = 0;
        document.getElementById('btn').addEventListener('click', () => {
            count++;
            document.getElementById('count').textContent = count;
        });
        document.getElementById('not').addEventListener('click', () => {
            count--;
            document.getElementById('count').textContent = count;
        });

        // 计数器2
        let secondCount = 0;
        const counter = document.getElementById('counter');
        document.getElementById('increment').addEventListener('click', () => {
            secondCount++;
            counter.textContent = secondCount;
            counter.style.color = secondCount > 0 ? '#4caf50' : '#666';
        });
        document.getElementById('decrement').addEventListener('click', () => {
            secondCount--;
            counter.textContent = secondCount;
            counter.style.color = secondCount < 0 ? '#f44336' : '#666';
        });

        // 用户注册
        document.getElementById('user').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const result = document.getElementById('result-form');
            if (name && email.includes('@')) {
                result.innerHTML = '<div><h3 style="color: #4caf50;">注册成功</h3><p style="color: #666;">姓名: ' + name + '</p><p style="color: #666;">邮箱邮箱: ' + email + '</p></div>';
            } else {
                result.innerHTML = '<p style="color: #f44336;">请输入有效的用户名和邮箱!</p>';
            }
        });

        // 选项卡
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                document.querySelectorAll('.tab-pane').forEach(pane => { pane.classList.remove('active'); });
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContent.classList.add('active');
                button.classList.add('active');
            });
        });

        // 计算器
        document.getElementById('calculate').addEventListener('click', () => {
            const num1 = parseFloat(document.getElementById('num1').value);
            const num2 = parseFloat(document.getElementById('num2').value);
            const operator = document.getElementById('operator').value;
            const resultElement = document.getElementById('result');
            resultElement.classList.remove('success', 'error');
            if (isNaN(num1) || isNaN(num2)) {
                resultElement.textContent = '请输入有效的数字';
                resultElement.classList.add('error');
                return;
            }
            let result;
            switch(operator) {
                case '+': result = num1 + num2; break;
                case '-': result = num1 - num2; break;
                case '*': result = num1 * num2; break;
                case '/': result = num2 !== 0 ? num1 / num2 : '除数不能为零'; break;
            }
            resultElement.textContent = '= ' + result;
            resultElement.classList.add('success');
        });

        // 图片画廊
        let isTetrisGameActive = false;
        const images = ['https://picsum.photos/600/400?random=1', 'https://picsum.photos/600/400?random=2', 'https://picsum.photos/600/400?random=3', 'https://picsum.photos/600/400?random=4', 'https://picsum.photos/600/400?random=5'];
        let currentIndex = 0;
        const galleryImage = document.getElementById('galleryImage');
        const imageInfo = document.getElementById('imageInfo');
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeValue = document.getElementById('sizeValue');
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        images.forEach((src, index) => {
            const thumb = document.createElement('img');
            thumb.src = src;
            thumb.style.width = '80px';
            thumb.style.height = '60px';
            thumb.style.objectFit = 'cover';
            thumb.style.borderRadius = '6px';
            thumb.style.cursor = 'pointer';
            thumb.style.opacity = index === currentIndex ? 1 : 0.5;
            thumb.style.border = index === currentIndex ? '2px solid #4caf50' : '2px solid #f0f0f0';
            thumb.style.transition = 'all 0.3s ease';
            thumb.addEventListener('mouseenter', () => { thumb.style.transform = 'scale(1.05)'; });
            thumb.addEventListener('mouseleave', () => { thumb.style.transform = 'scale(1)'; });
            thumb.addEventListener('click', () => { currentIndex = index; updateGallery(); });
            thumbnailContainer.appendChild(thumb);
        });
        function updateGallery() {
            galleryImage.src = images[currentIndex];
            galleryImage.style.transform = 'scale(1)';
            sizeSlider.value = 100;
            sizeValue.textContent = '100%';
            imageInfo.textContent = '图片 ' + (currentIndex + 1) + ' / ' + images.length;
            document.querySelectorAll('#thumbnailContainer img').forEach((thumb, index) => {
                thumb.style.opacity = index === currentIndex ? 1 : 0.5;
                thumb.style.border = index === currentIndex ? '2px solid #4caf50' : '2px solid #f0f0f0';
            });
        }
        document.getElementById('prevBtn').addEventListener('click', () => { currentIndex = (currentIndex - 1 + images.length) % images.length; updateGallery(); });
        document.getElementById('nextBtn').addEventListener('click', () => { currentIndex = (currentIndex + 1) % images.length; updateGallery(); });
        sizeSlider.addEventListener('input', () => { const size = sizeSlider.value / 100; galleryImage.style.transform = `scale(${size})`; sizeValue.textContent = sizeSlider.value + '%'; });
        document.addEventListener('keydown', (e) => { if (isTetrisGameActive) return; if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + images.length) % images.length; updateGallery(); } else if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % images.length; updateGallery(); } });
        updateGallery();
        document.getElementById('f5').addEventListener('click', function() { window.location.reload(); });

        // 员工搜索
        const employees = [
            { id: 1, name: '张三', position: '前端工程师', department: '技术部', email: 'zhangsan@company.com', hireDate: '2020-03-15' },
            { id: 2, name: '李四', position: '后端工程师', department: '技术部', email: 'lisi@company.com', hireDate: '2019-07-22' },
            { id: 3, name: '王五', position: 'UI设计师', department: '技术部', email: 'wangwu@company.com', hireDate: '2021-01-10' },
            { id: 4, name: '赵六', position: '市场经理', department: '市场部', email: 'zhaoliu@company.com', hireDate: '2018-11-05' },
            { id: 5, name: '钱七', position: '销售专员', department: '市场部', email: 'qianqi@company.com', hireDate: '2022-02-28' },
            { id: 6, name: '孙八', position: 'HR经理', department: '人力资源', email: 'sunba@company.com', hireDate: '2017-09-14' },
            { id: 7, name: '周九', position: '招聘专员', department: '人力资源', email: 'zhoujiu@company.com', hireDate: '2020-08-19' },
            { id: 8, name: '吴十', position: '财务总监', department: '财务部', email: 'wushi@company.com', hireDate: '2016-12-01' }
        ];

        function renderEmployees(filterText = '', department = '') {
            const employeeList = document.getElementById('employeeList');
            const employeeCount = document.getElementById('employeeCount');

            const filtered = employees.filter(emp => {
                const matchText = filterText === '' ||
                                  emp.name.includes(filterText) ||
                                  emp.position.includes(filterText) ||
                                  emp.department.includes(filterText);
                const matchDept = department === '' || emp.department === department;
                return matchText && matchDept;
            });

            employeeList.innerHTML = '';

            filtered.forEach(emp => {
                const row = document.createElement('tr');
                const deptColors = {
                    '技术部': '#4caf50',
                    '市场部': '#ff9800',
                    '人力资源': '#2196f3',
                    '财务部': '#9c27b0'
                };
                const deptColor = deptColors[emp.department] || '#667eea';

                const idCell = document.createElement('td');
                idCell.textContent = emp.id;
                row.appendChild(idCell);

                const nameCell = document.createElement('td');
                nameCell.textContent = emp.name;
                row.appendChild(nameCell);

                const posCell = document.createElement('td');
                posCell.textContent = emp.position;
                row.appendChild(posCell);

                const deptCell = document.createElement('td');
                const deptSpan = document.createElement('span');
                deptSpan.textContent = emp.department;
                deptSpan.style.background = deptColor;
                deptSpan.style.color = 'white';
                deptSpan.style.padding = '3pxpx 8px';
                deptSpan.style.borderRadius = '10px';
                deptSpan.style.fontSize = '11px';
                deptCell.appendChild(deptSpan);
                row.appendChild(deptCell);

                const emailCell = document.createElement('td');
                emailCell.textContent = emp.email;
                row.appendChild(emailCell);

                employeeList.appendChild(row);
            });

            const countColor = filtered.length === 0 ? '#f44336' : '#4caf50';
            employeeCount.innerHTML = '找到 <span style="font-weight: bold; color: ' + countColor + ';">' + filtered.length + '</span> 名员工（共 ' + employees.length + ' 名）';
        }

        document.getElementById('searchInput').addEventListener('input', (e) => {
            const filterText = e.target.value.trim();
            const department = document.getElementById('departmentFilter').value;
            renderEmployees(filterText, department);
        });

        document.getElementById('departmentFilter').addEventListener('change', (e) => {
            const filterText = document.getElementById('searchInput').value.trim();
            const department = e.target.value;
            renderEmployees(filterText, department);
        });

        renderEmployees();

        // 时钟和天气
        function updateClock() {
            const now = new Date();
            const clockEl = document.getElementById('clock');
            const dateEl = document.getElementById('date');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = hours + ':' + minutes + ':' + seconds;
            const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const weekday = days[now.getDay()];
            dateEl.textContent = year + '年' + month + '月' + day + '日 ' + weekday;
        }
        const weatherData = { city: '北京', temperature: 22, condition: '晴', humidity: 45, wind: '西北风 3级' };
        function displayWeather() {
            const weatherEl = document.getElementById('weather');
            weatherEl.innerHTML = '<p style="font-size: 16px; margin-bottom: 6px;">🌤️ ' + weatherData.city + ' - ' + weatherData.condition + '</p><p style="font-size: 24px; margin: 8px 0; font-weight: bold;">' + weatherData.temperature + '°C</p><p style="font-size: 14px;">💧 湿度: ' + weatherData.humidity + '% | 🌬️ ' + weatherData.wind + '</p>';
        }
        updateClock();
        setInterval(updateClock, 1000);
        displayWeather();

        // 表白小天地
        let heartCount = 0;
        const confessions = ["我喜欢你很久了", "你是我见过的最美的风景", "每次想到你，心里都会开出一朵花", "你让我的世界变得如此美好", "我愿意陪你走过每一个春夏秋冬"];
        document.getElementById('loveBtn').addEventListener('click', () => { const loveMessage = document.getElementById('loveMessage'); const randomIndex = Math.floor(Math.random() * confessions.length); loveMessage.innerHTML = '<span style="color: #ff4081; font-size: 18px; font-weight: 500;">' + confessions[randomIndex] + '</span>'; createHeart(); heartCount++; document.getElementById('heartCount').textContent = heartCount; });
        document.getElementById('acceptBtn').addEventListener('click', () => { const response = document.getElementById('loveResponse'); response.innerHTML = '<span style="color: #ff4081; font-size: 24px; font-weight: bold;">我也喜欢你！❤️</span>'; createBurstHearts(); });
        document.getElementById('rejectBtn').addEventListener('click', () => { const response = document.getElementById('loveResponse'); response.innerHTML = '<span style="color: #666; font-size: 16px;">没关系，我依然会默默守护你...</span>'; });
        function createHeart() {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = window.innerHeight + 'px';
            heart.style.fontSize = '30px';
            heart.style.pointerEvents = 'none';
            heart.style.transition = 'all 3s ease-out';
            heart.style.zIndex = '9999';
            document.body.appendChild(heart);
            setTimeout(() => { heart.style.top = '-50px'; heart.style.opacity = '0'; }, 100);
            setTimeout(() => { heart.remove(); }, 3000);
        }
        function createBurstHearts() {
            for (let i = 0; i < 50; i++) {
                setTimeout(() => { createHeart(); }, i * 40);
            }
        }

        // 俄罗斯方块
        const COLS = 12, ROWS = 20, BLOCK_SIZE = 20;
        const SHAPES = [[[1, 1, 1, 1]], [[1, 1], [1, 1]], [[1, 1, 1], [0, 1, 0]], [[1, 1, 1], [1, 0, 0]], [[1, 1, 1], [0, 0, 1]], [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]]];
        const COLORS = ['#00d4ff', '#ffeb3b', '#9c27b0', '#ff9800', '#2196f3', '#4caf50', '#f44336'];
        const COLOR_GRADIENTS = [['#00d4ff', '#0099cc', '#00f7ff'], ['#ffeb3b', '#ffc107', '#fff176'], ['#9c27b0', '#7b1fa2', '#ba68c8'], ['#ff9800', '#f57c00', '#ffb74d'], ['#2196f3', '#1976d2', '#64b5f6'], ['#4caf50', '#388e3c', '#81c784'], ['#f44336', '#d32f2f', '#ef5350']];
        let board = [], currentPiece = null, nextPiece = null, currentPos = { x: 0, y: 0 }, score = 0, level = 1, lines = 0, gameInterval = null, isPaused = false, isGameOver = false, dropAnimation = [], animFrameId = null;
        const canvas = document.getElementById('tetrisCanvas');
        const ctx = canvas.getContext('2d');
        const nextCanvas = document.getElementById('nextCanvas');
        const nextCtx = nextCanvas.getContext('2d');
        function initBoard() { board = []; for (let r = 0; r < ROWS; r++) { board[r] = []; for (let c = 0; c < COLS; c++) { board[r][c] = 0; } } dropAnimation = []; }
        function randomPiece() { const shapeIndex = Math.floor(Math.random() * SHAPES.length); return { shape: SHAPES[shapeIndex], color: COLORS[shapeIndex], gradient: COLOR_GRADIENTS[shapeIndex] }; }
        function drawBlock(ctx, x, y, color, size = BLOCK_SIZE, isCurrent = false) {
            const px = x * size, py = y * size;
            const colorIndex = COLORS.indexOf(color);
            const gradient = COLOR_GRADIENTS[colorIndex] || [color, color, color];
            const grad = ctx.createLinearGradient(px, py, px + size, py + size);
            grad.addColorStop(0, gradient[0]);
            grad.addColorStop(0.5, gradient[1]);
            grad.addColorStop(1, gradient[2]);
            ctx.fillStyle = grad;
            ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
            ctx.strokeStyle = isCurrent ? '#fff' : 'rgba(0,0,0,0.5)';
            ctx.lineWidth = isCurrent ? 2 : 1;
            ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.moveTo(px + 1, py + size - 1);
            ctx.lineTo(px + 1, py + 1);
            ctx.lineTo(px + size - 1, py + 1);
            ctx.lineTo(px + size - 5, py + 1);
            ctx.lineTo(px + 1, py + size - 5);
            ctx.fill();
            ctx.fillStyle = gradient[2];
            ctx.beginPath();
            ctx.arc(px + size / 2, py + size / 2, size / 6, 0, Math.PI * 2);
            ctx.fill();
            if (isCurrent) {
                ctx.strokeStyle = gradient[0];
                ctx.lineWidth = 2;
                ctx.strokeRect(px, py, size, size);
            }
        }
        function draw() {
            const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            bgGrad.addColorStop(0, '#1a1a2e');
            bgGrad.addColorStop(1, '#2d2d44');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let r = 0; r < ROWS; r++) { for (let c = 0; c < COLS; c++) { if (board[r][c]) { drawBlock(ctx, c, r, board[r][c]); } } }
            if (currentPiece) {
                let ghostY = currentPos.y;
                while (!collision(currentPiece.shape, currentPos.x, ghostY + 1)) ghostY++;
                for (let r = 0; r < currentPiece.shape.length; r++) {
                    for (let c = 0; c < currentPiece.shape[r].length; c++) {
                        if (currentPiece.shape[r][c]) {
                            ctx.globalAlpha = 0.3;
                            drawBlock(ctx, currentPos.x + c, ghostY + r, currentPiece.color);
                            ctx.globalAlpha = 1;
                        }
                    }
                }
                for (let r = 0; r < currentPiece.shape.length; r++) {
                    for (let c = 0; c < currentPiece.shape[r].length; c++) {
                        if (currentPiece.shape[r][c]) { drawBlock(ctx, currentPos.x + c, currentPos.y + r, currentPiece.color, BLOCK_SIZE, true); }
                    }
                }
            }
            dropAnimation.forEach((anim, i) => {
                ctx.globalAlpha = anim.alpha;
                drawBlock(ctx, anim.x, anim.y, anim.color);
                anim.alpha -= 0.1;
                if (anim.alpha <= 0) dropAnimation.splice(i, 1);
            });
            ctx.globalAlpha = 1;
        }
        function drawNextPiece() {
            const bgGrad = nextCtx.createLinearGradient(0, 0, nextCanvas.width, nextCanvas.height);
            bgGrad.addColorStop(0, '#1a1a2e');
            bgGrad.addColorStop(1, '#2d2d44');
            nextCtx.fillStyle = bgGrad;
            nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
            if (nextPiece) {
                const offsetX = (nextCanvas.width / BLOCK_SIZE - nextPiece.shape[0].length) / 2;
                const offsetY = (nextCanvas.height / BLOCK_SIZE - nextPiece.shape.length) / 2;
                for (let r = 0; r < nextPiece.shape.length; r++) { for (let c = 0; c < nextPiece.shape[r].length; c++) { if (nextPiece.shape[r][c]) { drawBlock(nextCtx, offsetX + c, offsetY + r, nextPiece.color, BLOCK_SIZE, true); } } }
            }
        }
        function collision(shape, x, y) {
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        const newX = x + c, newY = y + r;
                        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                        if (newY >= 0 && board[newY][newX]) return true;
                    }
                }
            }
            return false;
        }
        function lockPiece() {
            for (let r = 0; r < currentPiece.shape.length; r++) {
                for (let c = 0; c < currentPiece.shape[r].length; c++) {
                    if (currentPiece.shape[r][c]) {
                        if (currentPos.y + r < 0) { gameOver(); return; }
                        board[currentPos.y + r][currentPos.x + c] = currentPiece.color;
                    }
                }
            }
            clearLines();
            spawn();
        }
        function clearLines() {
            let linesCleared = 0, newBoard = [];
            for (let r = ROWS - 1; r >= 0; r--) {
                if (board[r].every(cell => cell !== 0)) {
                    linesCleared++;
                    for (let c = 0; c < COLS; c++) { dropAnimation.push({ x: c, y: r, color: board[r][c], alpha: 1 }); }
                } else {
                    newBoard.unshift(board[r]);
                }
            }
            for (let i = 0; i < linesCleared; i++) newBoard.unshift(new Array(COLS).fill(0));
            board = newBoard;
            if (linesCleared > 0) {
                const points = [0, 100, 300, 500, 800];
                score += points[linesCleared] * level;
                lines += linesCleared;
                level = Math.floor(lines / 10) + 1;
                updateTetrisStats();
            }
        }
        function spawn() {
            currentPiece = nextPiece || randomPiece();
            nextPiece = randomPiece();
            currentPos = { x: Math.floor((COLS - currentPiece.shape[0].length) / 2), y: 0 };
            if (collision(currentPiece.shape, currentPos.x, currentPos.y)) { gameOver(); return; }
            draw();
            drawNextPiece();
        }
        function rotate(shape) {
            const rows = shape.length;
            const cols = shape[0].length;
            const rotated = [];
            for (var c = 0; c < cols; c++) {
                rotated[c] = [];
                for (var r = rows - 1; r >= 0; r--) {
                    rotated[c][rows - 1 - r] = shape[r][c];
                }
            }
            return rotated;
        }
        function moveLeft() { if (!collision(currentPiece.shape, currentPos.x - 1, currentPos.y)) { currentPos.x--; draw(); } }
        function moveRight() { if (!collision(currentPiece.shape, currentPos.x + 1, currentPos.y)) { currentPos.x++; draw(); } }
        function moveDown() { if (!collision(currentPiece.shape, currentPos.x, currentPos.y + 1)) { currentPos.y++; draw(); } else { lockPiece(); draw(); } }
        function hardDrop() { while (!collision(currentPiece.shape, currentPos.x, currentPos.y + 1)) currentPos.y++; lockPiece(); draw(); }
        function rotatePiece() { const rotated = rotate(currentPiece.shape); if (!collision(rotated, currentPos.x, currentPos.y)) { currentPiece.shape = rotated; draw(); } }
        function updateTetrisStats() { document.getElementById('tetrisScore').textContent = score; document.getElementById('tetrisLevel').textContent = level; document.getElementById('tetrisLines').textContent = lines; }
        function gameOver() { isGameOver = true; isTetrisGameActive = false; clearInterval(gameInterval); if (animFrameId) cancelAnimationFrame(animFrameId); document.getElementById('gameOver').textContent = '游戏结束! 点击重新开始'; }
        function animationLoop() {
            if (dropAnimation.length > 0) { draw(); }
            animFrameId = requestAnimationFrame(animationLoop);
        }
        function startGame() {
            if (gameInterval) clearInterval(gameInterval);
            if (animFrameId) cancelAnimationFrame(animFrameId);
            initBoard();
            score = 0; level = 1; lines = 0; isPaused = false; isGameOver = false; isTetrisGameActive = true;
            updateTetrisStats();
            document.getElementById('gameOver').textContent = '';
            nextPiece = randomPiece();
            spawn();
            gameInterval = setInterval(() => { if (!isPaused) moveDown(); }, 1000 - (level - 1) * 100);
            animationLoop();
        }
        function pauseGame() { if (isGameOver) return; isPaused = !isPaused; isTetrisGameActive = !isPaused; document.getElementById('pauseTetris').textContent = isPaused ? '继续' : '暂停'; }
        document.getElementById('startTetris').addEventListener('click', startGame);
        document.getElementById('pauseTetris').addEventListener('click', pauseGame);
        document.getElementById('resetTetris').addEventListener('click', startGame);
        document.addEventListener('keydown', (e) => {
            if (isGameOver || isPaused || !currentPiece) return;
            switch (e.key) {
                case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
                case 'ArrowRight': e.preventDefault(); moveRight(); break;
                case 'ArrowDown': e.preventDefault(); moveDown(); break;
                case 'ArrowUp': e.preventDefault(); rotatePiece(); break;
                case ' ': e.preventDefault(); hardDrop(); break;
            }
        });
        initBoard();
        draw();
        drawNextPiece();

        // 鼠标跟随光效
        const drawingBoard = document.getElementById('drawCanvas');
        function isInsideDrawingBoard(x, y) {
            if (!drawingBoard) return false;
            const drawRect = drawingBoard.closest('.widget-card').getBoundingClientRect();
            return x >= drawRect.left && x <= drawRect.right &&
                   y >= drawRect.top && y <= drawRect.bottom;
        }
        document.addEventListener('mousemove', (e) => {
            if (isInsideDrawingBoard(e.clientX, e.clientY)) {
                return;
            }
            const glow = document.createElement('div');
            glow.style.cssText = `
                position: fixed;
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                width: 8px;
                height: 8px;
                background: radial-gradient(circle, #00ffff, transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: mouseGlow 1s ease-out forwards;
            `;
            document.body.appendChild(glow);
            setTimeout(() => glow.remove(), 1000);
        });

        // 暗黑模式切换
        let isDarkMode = false;
        document.getElementById('themeToggle').addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('themeToggle').innerHTML = '🌞 亮色';
            } else {
                document.body.classList.remove('dark-mode');
                document.getElementById('themeToggle').innerHTML = '🌙️ 暗色';
            }
        });
        window.setTheme = function(mode) {
            if (mode === 'dark') {
                document.body.classList.add('dark-mode');
                document.getElementById('currentTheme').textContent = '当前: 深色模式';
            } else {
                document.body.classList.remove('dark-mode');
                document.getElementById('currentTheme').textContent = '当前: 浅色模式';
            }
        };

        // 日历组件
        let calendarDate = new Date();
        let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

        function renderCalendar() {
            const year = calendarDate.getFullYear();
            const month = calendarDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();

            document.getElementById('currentMonth').textContent = `${year}年 ${monthNames[month]}`;

            const daysContainer = document.getElementById('calendarDays');
            daysContainer.innerHTML = '';

            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.style.padding = '12px';
                daysContainer.appendChild(emptyDay);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                dayEl.textContent = day;
                dayEl.style.padding = '12px';
                dayEl.style.borderRadius = '50%';
                dayEl.style.cursor = 'pointer';
                dayEl.style.transition = 'all 0.3s ease';

                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (events[dateKey]) {
                    dayEl.style.background = '#667eea';
                    dayEl.style.color = 'white';
                }

                if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
                    dayEl.style.border = '2px solid #667eea';
                }

                dayEl.addEventListener('click', () => {
                    document.getElementById('eventDate').value = dateKey;
                    dayEl.style.transform = 'scale(1.2)';
                    setTimeout(() => dayEl.style.transform = 'scale(1)', 200);
                });

                dayEl.addEventListener('mouseover', () => {
                    if (!events[dateKey]) {
                        dayEl.style.background = '#f0f0f0';
                    }
                });
                dayEl.addEventListener('mouseout', () => {
                    if (!events[dateKey]) {
                        dayEl.style.background = 'white';
                    }
                });

                daysContainer.appendChild(dayEl);
            }

            renderEventList();
        }

        function renderEventList() {
            const eventList = document.getElementById('eventList');
            eventList.innerHTML = '';
            const sortedEvents = Object.entries(events).sort((a, b) => new Date(a[0]) - new Date(b[0]));

            sortedEvents.forEach(([date, text]) => {
                const eventEl = document.createElement('div');
                eventEl.style.display = 'flex';
                eventEl.style.justifyContent = 'space-between';
                eventEl.style.alignItems = 'center';
                eventEl.style.padding = '8px';
                eventEl.style.background = '#f9f9f9';
                eventEl.style.borderRadius = '6px';
                eventEl.style.marginBottom = '5px';
                eventEl.innerHTML = `
                    <span style="flex: 1; font-size: 13px;">${date}: ${text}</span>
                    <button onclick="deleteEvent('${date}')" style="background: #ff6b6b; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px;">删除</button>
                `;
                eventList.appendChild(eventEl);
            });
        }

        window.deleteEvent = function(date) {
            delete events[date];
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            renderCalendar();
        };

        document.getElementById('prevMonth').addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });

        document.getElementById('addEventBtn').addEventListener('click', () => {
            const date = document.getElementById('eventDate').value;
            const text = document.getElementById('eventText').value.trim();
            if (date && text) {
                events[date] = text;
                localStorage.setItem('calendarEvents', JSON.stringify(events));
                renderCalendar();
                document.getElementById('eventText').value = '';
            }
        });
        renderCalendar();

        // 待办事项管理器
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        let todoFilter = 'all';

        function renderTodos() {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = '';

            const filteredTodos = todos.filter(todo => {
                if (todoFilter === 'active') return !todo.completed;
                if (todoFilter === 'completed') return todo.completed;
                return true;
            });

            const priorityOrder = { high: 0, medium: 1, low: 2 };
            filteredTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

            filteredTodos.forEach(todo => {
                const todoEl = document.createElement('div');
                todoEl.style.display = 'flex';
                todoEl.style.alignItems = 'center';
                todoEl.style.padding = '12px';
                todoEl.style.background = 'rgba(255,255,255,0.9)';
                todoEl.style.borderRadius = '8px';
                todoEl.style.marginBottom = '8px';
                todoEl.style.gap = '10px';

                const priorityColors = { high: '#ff6b6b', medium: '#ffd93d', low: '#6bcf7f' };
                const priorityLabels = { high: '高', medium: '中', low: '低' };

                todoEl.innerHTML = `
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})" style="width: 18px; height: 18px;">
                    <span style="flex: 1; ${todo.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${todo.text}</span>
                    <span style="background: ${priorityColors[todo.priority]}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px;">${priorityLabels[todo.priority]}</span>
                    <button onclick="deleteTodo(${todo.id})" style="background: #ff6b6b; color: white; border: none; border-radius: 4px; padding: 4px 10px; font-size: 12px;">删除</button>
                `;
                todoList.appendChild(todoEl);
            });

            const completed = todos.filter(t => t.completed).length;
            document.getElementById('completedCount').textContent = completed;
            document.getElementById('totalCount').textContent = todos.length;
        }

        window.toggleTodo = function(id) {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                localStorage.setItem('todos', JSON.stringify(todos));
                renderTodos();
            }
        };

        window.deleteTodo = function(id) {
            todos = todos.filter(t => t.id !== id);
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos();
        };

        document.getElementById('addTodoBtn').addEventListener('click', () => {
            const text = document.getElementById('todoInput').value.trim();
            const priority = document.getElementById('todoPriority').value;
            if (text) {
                todos.push({
                    id: Date.now(),
                    text,
                    priority,
                    completed: false
                });
                localStorage.setItem('todos', JSON.stringify(todos));
                document.getElementById('todoInput').value = '';
                renderTodos();
            }
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'rgba(255,255,255,0.3)';
                    b.style.color = 'white';
                });
                btn.classList.add('active');
                btn.style.background = 'white';
                btn.style.color = '#333';
                todoFilter = btn.dataset.filter;
                renderTodos();
            });
        });
        renderTodos();

        // 音乐播放器
        const playlist = [
            { title: 'Peaceful Mind', artist: 'Nature Sounds', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
            { title: 'Electronic Dreams', artist: 'Synth Wave', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
            { title: 'Chill Vibes', artist: 'Lo-Fi Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
        ];
        let currentSongIndex = 0;
        let isPlaying = false;
        const audio = document.getElementById('audioPlayer');
        let audioContext, analyser, dataArray;

        function renderPlaylist() {
            const playlistList = document.getElementById('playlistList');
            playlistList.innerHTML = '';
            playlist.forEach((song, index) => {
                const item = document.createElement('div');
                item.style.padding = '4px 8px';
                item.style.cursor = 'pointer';
                item.style.borderRadius = '4px';
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.gap = '8px';
                if (index === currentSongIndex) {
                    item.style.background = 'rgba(255,255,255,0.3)';
                }
                item.innerHTML = `
                    <span>${index + 1}.</span>
                    <span style="flex: 1;">${song.title}</span>
                    <span style="font-size: 10px;">${song.artist}</span>
                `;
                item.addEventListener('click', () => {
                    currentSongIndex = index;
                    loadSong(index);
                    if (isPlaying) audio.play();
                });
                playlistList.appendChild(item);
            });
        }

        function loadSong(index) {
            const song = playlist[index];
            audio.src = song.url;
            document.getElementById('songTitle').textContent = song.title;
            document.getElementById('songArtist').textContent = song.artist;
            renderPlaylist();
        }

        // 上传本地音乐文件
        document.getElementById('musicFileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                playlist.push({
                    title: file.name.replace(/\.[^\.]+$/, ''),
                    artist: '本地文件',
                    url: url
                });
                currentSongIndex = playlist.length - 1;
                loadSong(currentSongIndex);
                document.getElementById('musicFileInput').value = '';
            }
        });

        // 加载URL音乐
        document.getElementById('loadUrlBtn').addEventListener('click', () => {
            const url = document.getElementById('musicUrlInput').value.trim();
            const title = document.getElementById('musicUrlInput').value.split('/').pop() || '自定义歌曲';
            if (url) {
                playlist.push({
                    title: title,
                    artist: '网络歌曲',
                    url: url
                });
                currentSongIndex = playlist.length - 1;
                loadSong(currentSongIndex);
                document.getElementById('musicUrlInput').value = '';
            }
        });

        function playPause() {
            if (isPlaying) {
                audio.pause();
                document.getElementById('playPauseBtn').textContent = '▶';
            } else {
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    const source = audioContext.createMediaElementSource(audio);
                    source.connect(analyser);
                    analyser.connect(audioContext.destination);
                    analyser.fftSize = 256;
                    dataArray = new Uint8Array(analyser.frequencyBinCount);
                    drawVisualizer();
                }
                audio.play();
                document.getElementById('playPauseBtn').textContent = '⏸';
            }
            isPlaying = !isPlaying;
        }

        function drawVisualizer() {
            if (!analyser || !dataArray) return;
            requestAnimationFrame(drawVisualizer);
            analyser.getByteFrequencyData(dataArray);

            const canvas = document.getElementById('audioVisualizer');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = canvas.width / dataArray.length * 2.5;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = dataArray[i] / 2;
                const hue = i * 2 + 180;
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        document.getElementById('playPauseBtn').addEventListener('click', playPause);

        document.getElementById('prevSong').addEventListener('click', () => {
            currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
            loadSong(currentSongIndex);
            if (isPlaying) audio.play();
        });

        document.getElementById('nextSong').addEventListener('click', () => {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
            loadSong(currentSongIndex);
            if (isPlaying) audio.play();
        });

        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
            document.getElementById('volumeValue').textContent = e.target.value + '%';
        });

        document.getElementById('audioProgress').addEventListener('input', (e) => {
            const seekTime = (e.target.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        });

        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            document.getElementById('audioProgress').value = progress || 0;
            document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
        });

        audio.addEventListener('loadedmetadata', () => {
            document.getElementById('duration').textContent = formatTime(audio.duration);
        });

        audio.addEventListener('ended', () => {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
            loadSong(currentSongIndex);
            audio.play();
        });

        loadSong(0);
        renderPlaylist();
        audio.volume = 0.7;

        // 聊天机器人
        const botResponses = {
            '你好': ['你好！很高兴见到你！', '嗨！今天过得怎么样？', '你好呀！有什么我可以帮你的吗？'],
            '再见': ['再见！祝你今天愉快！', '拜拜！有需要随时找我。', '再见！记得多休息哦。'],
            '谢谢': ['不客气！', '随时为你服务！', '很高兴能帮到你！'],
            '你是谁': ['我是你的AI助手，可以陪你聊天，帮你解答问题。', '我是一个智能聊天机器人，很高兴认识你！'],
            '天气': ['今天天气不错呢，适合出去走走！', '记得根据天气变化增减衣物哦。', '建议你出门前查看当地天气预报。'],
            '笑话': ['为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 = Dec 25。',
                      '一个程序员的妻子让他去超市："买一瓶奶，如果有鸡蛋，买十瓶。"程序员回家时带了十瓶奶。妻子问："为什么买这么多？"程序员回答："他们有鸡蛋。"',
                      '程序员说："我的代码没有bug！"上帝笑了。'],
            '时间': ['现在的时刻正是享受生活的好时候！', '时间过得真快，要珍惜每一刻哦。'],
            'default': ['这个话题很有趣！', '我明白了，继续说。', '嗯嗯，我理解你的意思。', '可以多跟我说说吗？', '这真是个好问题！']
        };

        function getBotResponse(userInput) {
            const input = userInput.toLowerCase();
            for (const [key, responses] of Object.entries(botResponses)) {
                if (key !== 'default' && input.includes(key)) {
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
            return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
        }

        function addMessage(text, isUser) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = isUser
                ? 'align-self: flex-end; background: #fff; color: #11998e; padding: 10px 15px; border-radius: 15px 15px 0 15px; max-width: 80%; font-size: 13px;'
                : 'align-self: flex-start; background: rgba(255,255,255,0.9); color: #333; padding: 10px 15px; border-radius: 15px 15px 15px 0; max-width: 80%; font-size: 13px;';
            messageDiv.textContent = text;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        document.getElementById('sendChat').addEventListener('click', sendMessage);
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        function sendMessage() {
            const input = document.getElementById('chatInput');
            const text = input.value.trim();
            if (text) {
                addMessage(text, true);
                input.value = '';

                setTimeout(() => {
                    const response = getBotResponse(text);
                    addMessage(response, false);
                }, 500 + Math.random() * 1000);
            }
        }

        // 番茄钟
        let tomatoTime = 25 * 60;
        let tomatoInterval = null;
        let tomatoRunning = false;
        let tomatoCompleted = 0;
        const tomatoModes = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
        let currentTomatoMode = 'work';
        function updateTomatoDisplay() {
            const minutes = Math.floor(tomatoTime / 60);
            const seconds = tomatoTime % 60;
            document.getElementById('tomatoTimer').textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        }
        window.setTomatoMode = function(mode) {
            currentTomatoMode = mode;
            tomatoTime = tomatoModes[mode];
            updateTomatoDisplay();
            document.querySelectorAll('.tomato-mode-btn').forEach(btn => btn.classList.remove('active'));
            if (mode === 'work') { document.getElementById('workModeBtn').classList.add('active'); }
            else if (mode === 'short') { document.getElementById('shortBreakModeBtn').classList.add('active'); }
            else if (mode === 'long') { document.getElementById('longBreakModeBtn').classList.add('active'); }
        };
        window.toggleTomato = function() {
            if (tomatoRunning) {
                clearInterval(tomatoInterval);
                tomatoRunning = false;
                document.getElementById('tomatoStart').textContent = '继续';
            } else {
                tomatoInterval = setInterval(() => {
                    tomatoTime--;
                    if (tomatoTime <= 0) {
                        clearInterval(tomatoInterval);
                        tomatoRunning = false;
                        tomatoCompleted++;
                        document.getElementById('tomatoCount').textContent = tomatoCompleted;
                        document.getElementById('tomatoStart').textContent = '开始';
                        alert('番茄钟结束！');
                        tomatoTime = tomatoModes[currentTomatoMode];
                        updateTomatoDisplay();
                        return;
                    }
                    updateTomatoDisplay();
                }, 1000);
                tomatoRunning = true;
                document.getElementById('tomatoStart').textContent = '暂停';
            }
        };
        window.resetTomato = function() {
            clearInterval(tomatoInterval);
            tomatoRunning = false;
            tomatoTime = tomatoModes[currentTomatoMode];
            updateTomatoDisplay();
            document.getElementById('tomatoStart').textContent = '开始';
        };

        // 密码生成器
        window.generatePassword = function() {
            const length = parseInt(document.getElementById('passwordLength').value);
            const useUpper = document.getElementById('uppercase').checked;
            const useLower = document.getElementById('lowercase').checked;
            const useNumbers = document.getElementById('numbers').checked;
            const useSymbols = document.getElementById('symbols').checked;
            let charset = '';
            if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (useNumbers) charset += '0123456789';
            if (useSymbols) charset += '!@#$%^&*()_+-=<>?/';
            if (charset === '') {
                alert('请至少选择一种字符类型！');
                return;
            }
            let password = '';
            for (let i = 0; i < length; i++) {
                password += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            const resultEl = document.getElementById('passwordResult');
            resultEl.textContent = password;
            resultEl.style.display = 'block';
        };

        // 键盘可视化
        let totalKeystrokes = 0;
        const keyMap = { 'q': 1, 'w': 2, 'e': 3, 'r': 4, 't': 5, 'y': 6, 'u': 7, 'i': 8, 'o': 9, 'p': 10, 'a': 11, 's': 12, 'd': 13, 'f': 14, 'g': 15, 'h': 16, 'j': 17, 'k': 18, 'l': 19, 'z': 21, 'x': 22, 'c': 23, 'v': 24, 'b': 25, 'n': 26, 'm': 27 };
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (keyMap[key]) {
                const keyEl = document.getElementById('key-' + keyMap[key]);
                keyEl.classList.add('show');
                keyEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                setTimeout(() => {
                    keyEl.classList.remove('show');
                    keyEl.style.background = '';
                }, 200);
                totalKeystrokes++;
                document.getElementById('totalKeystrokes').textContent = totalKeystrokes;
            }
        });
