document.addEventListener('DOMContentLoaded', () => {
    // 治愈系旅行颜色库 (纯净文字版，彻底解决跨界问题)
    const colorStops = [
        { name: '落樱粉', color: '#FF8BA7', desc: '去偶遇一片粉红晚霞或绽放的花朵吧 (❁´◡`❁)' },
        { name: '日落橘', color: '#FFB347', desc: '寻找黄昏时分那一抹温暖的落日 🌅' },
        { name: '新叶绿', color: '#8AC926', desc: '走进大自然，找寻最生机勃勃的绿叶 🍃' },
        { name: '晴空蓝', color: '#4CC9F0', desc: '抬头看看那片最澄澈明朗的天空吧 ☁️' },
        { name: '薰衣紫', color: '#9D8DF1', desc: '或许会路过一家浪漫的紫色花店 🔮' },
        { name: '向日黄', color: '#FFCA3A', desc: '去捕捉旅途中那些充满活力的鲜亮度 ✧(≖ ◡ ≖✿)' }
    ];

    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const resultModal = document.getElementById('result-modal');
    const closeBtn = document.getElementById('close-btn');
    const resultColor = document.getElementById('result-color');
    const colorName = document.getElementById('color-name');
    const greetingText = document.querySelector('.greeting-text');
    const sparklesContainer = document.getElementById('sparkles');

    let isSpinning = false;
    let currentRotation = 0; // 累计旋转角度

    // 初始化轮盘扇区和文字
    function initWheel() {
        const numSlices = colorStops.length;
        const sliceAngle = 360 / numSlices;
        
        let gradientStyle = 'conic-gradient(';
        colorStops.forEach((stop, index) => {
            // 设置扇区背景
            const startAngle = index * sliceAngle;
            const endAngle = (index + 1) * sliceAngle;
            gradientStyle += `${stop.color} ${startAngle}deg ${endAngle}deg${index < numSlices - 1 ? ', ' : ')'}`;
            
            // 采用 100% 容器布局：每个 itemDiv 都是覆盖全圆的
            const itemDiv = document.createElement('div');
            itemDiv.className = 'wheel-item';
            
            // 背景 conic-gradient 0度是在12点钟方向
            // 我们将全屏容器也转到该扇区的中心角度 (textAngle)
            // 此时该容器的顶部（12点）正中心就刚好在色块的中间
            const textAngle = startAngle + sliceAngle / 2;
            itemDiv.style.transform = `rotate(${textAngle}deg)`;
            
            // 里面只需要放一个正着的 span，CSS 会自动把它推到顶部居中
            itemDiv.innerHTML = `<span>${stop.name}</span>`;
            wheel.appendChild(itemDiv);
        });
        
        // 应用背景渐变
        wheel.style.background = gradientStyle;
    }

    initWheel();

    // 抽奖逻辑
    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.textContent = '抽取中...';

        // 基础圈数 (最少转4圈) + 随机额外角度
        const spins = 4;
        const randomExtraAngle = Math.floor(Math.random() * 360);
        
        // 计算最终的目标角度（累加保证顺着转）
        currentRotation += (spins * 360) + randomExtraAngle;

        // 执行 CSS 动画 (transition 已在 stylesheet 中定义)
        wheel.style.transform = `rotate(${currentRotation}deg)`;

        // 增加一点点击粒子特效
        createSparkles();

        // 动画结束(css设为了4s)，提取结果
        setTimeout(() => {
            // 计算中奖索引 
            // 轮盘顺时针旋转，而扇区是顺时针排列(0->360)，但顶部的指针在 0度/360度(正上)
            // 所以指针指向的角度 = 360 - (最终角度 % 360) （如果考虑顶部是0度的话）
            const numSlices = colorStops.length;
            const sliceAngle = 360 / numSlices;
            
            // 旋转时整个转盘实际上带着扇区顺时针走了。
            // 转盘旋转角度 R。顶部指针没动。相当于原来停在顶部的扇区转走了。
            // 停在顶部的扇区，它的初始角度的“中间值”应该经过偏移抵消
            // 具体公式：(360 - (currentRotation % 360)) / sliceAngle -> 向下取整
            let normalizedAngle = currentRotation % 360;
            let pointerAngle = (360 - normalizedAngle) % 360; 
            
            let winningIndex = Math.floor(pointerAngle / sliceAngle);
            if (winningIndex === numSlices) winningIndex = 0;

            const winningColor = colorStops[winningIndex];
            showResult(winningColor);

            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.textContent = '抽取我的颜色';
        }, 4000); // 与 CSS 中的 transition duration 匹配
    });

    // 展示结果页面
    function showResult(colorInfo) {
        resultColor.style.backgroundColor = colorInfo.color;
        colorName.textContent = colorInfo.name;
        colorName.style.color = '#fff';
        colorName.style.textShadow = '0 2px 4px rgba(0,0,0,0.2)'; // 给文字加点阴影增强可读性
        
        // 由于背景色变深，背景元素不用减低亮度，让它自身发散
        resultColor.style.boxShadow = `0 10px 25px ${colorInfo.color}80`; // 散发同色光晕
        greetingText.textContent = colorInfo.desc;
        
        // 浮现模态框
        resultModal.classList.remove('hidden');
    }

    // 关闭/再抽一次
    closeBtn.addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });

    // 简单的星星微交互
    function createSparkles() {
        for(let i=0; i<10; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'absolute';
            sparkle.style.width = '10px';
            sparkle.style.height = '10px';
            sparkle.style.backgroundColor = document.documentElement.style.getPropertyValue('--btn-color') || '#FF8BA7';
            sparkle.style.borderRadius = '50%';
            
            // 随机坐标在屏幕中下部
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
            const y = window.innerHeight / 2 + 100 + (Math.random() - 0.5) * 50;
            
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            
            // 简易动画
            sparkle.animate([
                { transform: 'translateY(0) scale(1)', opacity: 1 },
                { transform: `translateY(-${Math.random() * 100 + 50}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            });
            
            sparklesContainer.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1200);
        }
    }
});
