document.addEventListener('DOMContentLoaded', () => {
    // --- عناصر الـ DOM ---
    const splashScreen = document.getElementById('splash-screen');
    const mainMenu = document.getElementById('main-menu');
    const modeSelection = document.getElementById('mode-selection');
    
    // شاشات
    const rpsScreen = document.getElementById('rps-screen');
    const coinTossScreen = document.getElementById('coin-toss-screen');
    const classicBoard = document.getElementById('classic-board');
    
    // أزرار القوائم
    const btnIPlay = document.getElementById('btn-i-play');
    const btnPlayFriends = document.getElementById('btn-play-friends');
    const btnNormal = document.getElementById('btn-normal');
    const btnPyramid = document.getElementById('btn-pyramid');
    const btnBack = document.getElementById('btn-back');
    
    // عناصر RPS
    const rpsChoices = document.querySelectorAll('.rps-icon');
    const aiChoiceBox = document.getElementById('ai-choice-box');
    const rpsResult = document.getElementById('rps-result');

    // عناصر Coin Toss
    const coin = document.getElementById('coin');
    const btnFlipCoin = document.getElementById('btn-flip-coin');
    const coinResult = document.getElementById('coin-result');
    
    // عناصر شبكة اللعب
    const cells = document.querySelectorAll('.cell');
    const gameStatus = document.getElementById('game-status');
    const btnRestart = document.getElementById('btn-restart');
    const btnBoardMenu = document.getElementById('btn-board-menu');
const bgMusic = new Audio('music.mp3');
bgMusic.volume = 0.8; // ضبط مستوى الصوت
bgMusic.loop = true;  // تكرار الموسيقى تلقائياً

    // --- متغيرات حالة اللعبة ---
    let opponentType = ''; // 'ai' أو 'friend'
    let currentMark = '';  // 'O' أو 'X' (المتغير الذي يحدد دور من الآن)
    let isRpsProcessing = false; 
    let isFlipping = false;
    
    let board = ['', '', '', '', '', '', '', '', ''];
    let isGameActive = false;
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]            
    ];
    // --- متغيرات وضع الهرم ---
    let gameMode = 'classic'; // 'classic' أو 'pyramid'
    const diamondMatrix = [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0]
    ];
    let pyramidEdges = {}; 
    let pyramidBoxes = []; 
    let pyramidScores = { O: 0, X: 0 };
    const pyramidBoard = document.getElementById('pyramid-board');

    // --- 1. القوائم ---
    splashScreen.addEventListener('click', () => {
    // أمر تشغيل الموسيقى
    bgMusic.play().catch(e => console.warn("لم يتم تشغيل الصوت:", e));

    enterFullscreen(); lockPortrait(); 
    splashScreen.style.opacity = '0';
    document.body.classList.add('neon-bg');
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    }, 500);
});


    btnIPlay.addEventListener('click', () => { opponentType = 'ai'; showModes(); });
    btnPlayFriends.addEventListener('click', () => { opponentType = 'friend'; showModes(); });
    btnBack.addEventListener('click', () => { modeSelection.classList.add('hidden'); mainMenu.classList.remove('hidden'); });

        btnNormal.addEventListener('click', () => {
        gameMode = 'classic';
        modeSelection.classList.add('hidden');
        if(opponentType === 'ai') startRPS(); else startCoinToss();
    });

    btnPyramid.addEventListener('click', () => {
        gameMode = 'pyramid';
        modeSelection.classList.add('hidden');
        if(opponentType === 'ai') startRPS(); else startCoinToss();
    });


    // --- 2. حجرة ورقة مقص (AI Mode) ---
    function startRPS() {
        rpsScreen.classList.remove('hidden');
        aiChoiceBox.innerHTML = "?";
        aiChoiceBox.style.border = "2px dashed crimson";
        aiChoiceBox.style.boxShadow = "inset 0 0 10px rgba(220, 20, 60, 0.5)";
        rpsResult.classList.add('hidden');
    }

    rpsChoices.forEach(choice => {
        choice.addEventListener('click', (e) => {
            if(isRpsProcessing) return;
            isRpsProcessing = true;
            const playerChoice = e.target.getAttribute('data-choice');
            const aiOptions = ['h', 'w', 'm'];
            const aiChoice = aiOptions[Math.floor(Math.random() * aiOptions.length)];

            aiChoiceBox.innerHTML = `<div class="ai-rps-icon" style="-webkit-mask-image: url('${aiChoice}.png'); mask-image: url('${aiChoice}.png');"></div>`;
            aiChoiceBox.style.border = "none";
            aiChoiceBox.style.boxShadow = "none";

            determineRpsWinner(playerChoice, aiChoice);
        });
    });

    function determineRpsWinner(player, ai) {
        rpsResult.classList.remove('hidden');
        if (player === ai) {
            rpsResult.innerText = "DRAW! TRY AGAIN";
            rpsResult.style.color = "#fff";
            rpsResult.style.textShadow = "0 0 10px #fff";
            setTimeout(() => { startRPS(); isRpsProcessing = false; }, 1500);
            return;
        }

        let playerWins = ((player === 'h' && ai === 'm') || (player === 'm' && ai === 'w') || (player === 'w' && ai === 'h'));
        
        if (playerWins) {
            rpsResult.innerText = "YOU START!";
            rpsResult.style.color = "#00e5ff";
            rpsResult.style.textShadow = "0 0 10px #00e5ff";
            currentMark = 'O'; // اللاعب دائماً O
        } else {
            rpsResult.innerText = "A.I STARTS!";
            rpsResult.style.color = "crimson";
            rpsResult.style.textShadow = "0 0 10px crimson";
            currentMark = 'X'; // الذكاء دائماً X
        }

        setTimeout(() => {
            rpsScreen.classList.add('hidden');
                if (gameMode === 'classic') {
        initClassicGame();
    } else {
        initPyramidGame();
    }

        }, 2000);
    }

    // --- 3. رمي العملة (Friends Mode) ---
    function startCoinToss() {
        coinTossScreen.classList.remove('hidden');
        coinResult.classList.add('hidden');
        // تصفير دوران العملة بدون أنميشن
        coin.style.transition = 'none';
        coin.style.transform = 'rotateY(0deg)';
        setTimeout(() => {
            coin.style.transition = 'transform 3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }, 50);
        btnFlipCoin.disabled = false;
        isFlipping = false;
    }

    btnFlipCoin.addEventListener('click', () => {
        if(isFlipping) return;
        isFlipping = true;
        btnFlipCoin.disabled = true;
        coinResult.classList.add('hidden');

        // تحديد النتيجة (صحيح = O ، خطأ = X)
        const isO = Math.random() < 0.5;
        const spins = Math.floor(Math.random() * 5) + 5; // من 5 إلى 9 لفات كاملة
        const degrees = spins * 360 + (isO ? 0 : 180); // 0 لوجه O, 180 لوجه X
        
        coin.style.transform = `rotateY(${degrees}deg)`;
        
        setTimeout(() => {
            currentMark = isO ? 'O' : 'X';
            coinResult.innerText = `${currentMark} STARTS!`;
            coinResult.style.color = isO ? "#00e5ff" : "crimson";
            coinResult.style.textShadow = `0 0 10px ${isO ? "#00e5ff" : "crimson"}`;
            coinResult.classList.remove('hidden');
            
            setTimeout(() => {
                coinTossScreen.classList.add('hidden');
                    if (gameMode === 'classic') {
        initClassicGame();
    } else {
        initPyramidGame();
    }

            }, 2000);
        }, 3000); // ننتظر 3 ثواني حتى ينتهي أنميشن الدوران
    });


    // --- 4. لعبة X O الكلاسيكية الموحدة ---
    function initClassicGame() {
        classicBoard.classList.remove('hidden');
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        
        cells.forEach(cell => {
            cell.innerText = '';
            cell.classList.remove('o-mark', 'x-mark');
        });

        updateStatusText();

        // إذا كان خصمك الذكاء الاصطناعي ودوره يبدأ
        if (opponentType === 'ai' && currentMark === 'X') {
            setTimeout(aiMove, 800);
        }
    }

        function updateStatusText() {
        if (!isGameActive) return;
        const targetStatus = gameMode === 'classic' ? gameStatus : document.getElementById('pyramid-status');
        
        if (opponentType === 'ai') {
            if (currentMark === 'O') {
                targetStatus.innerText = "YOUR TURN ( O )";
                targetStatus.style.color = "#00e5ff";
                targetStatus.style.textShadow = "0 0 10px #00e5ff";
            } else {
                targetStatus.innerText = "A.I IS THINKING...";
                targetStatus.style.color = "crimson";
                targetStatus.style.textShadow = "0 0 10px crimson";
            }
        } else {
            if (currentMark === 'O') {
                targetStatus.innerText = "PLAYER 1 ( O )";
                targetStatus.style.color = "#00e5ff";
                targetStatus.style.textShadow = "0 0 10px #00e5ff";
            } else {
                targetStatus.innerText = "PLAYER 2 ( X )";
                targetStatus.style.color = "crimson";
                targetStatus.style.textShadow = "0 0 10px crimson";
            }
        }
    }


    // حركة النقر على الشبكة (تخدم الوضعين معاً)
    cells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            
            // منع النقر إذا اللعبة منتهية أو المربع ممتلئ
            if (board[index] !== '' || !isGameActive) return;
            // منع اللاعب من النقر في دور الذكاء الاصطناعي
            if (opponentType === 'ai' && currentMark === 'X') return;

            // تطبيق الحركة (O أو X بناءً على دور من)
            board[index] = currentMark;
            e.target.innerText = currentMark;
            e.target.classList.add(currentMark === 'O' ? 'o-mark' : 'x-mark');
            
            checkResult();
            
            if (isGameActive) {
                if (opponentType === 'ai') {
                    // تسليم الدور للذكاء الاصطناعي
                    currentMark = 'X';
                    updateStatusText();
                    setTimeout(aiMove, Math.random() * 500 + 500); 
                } else {
                    // تبديل الدور بين الأصدقاء
                    currentMark = (currentMark === 'O') ? 'X' : 'O';
                    updateStatusText();
                }
            }
        });
    });

    // --- خوارزمية الذكاء الاصطناعي ---
    function aiMove() {
        if (!isGameActive) return;

        let emptyCells = [];
        board.forEach((val, idx) => { if (val === '') emptyCells.push(idx); });
        if (emptyCells.length === 0) return;

        let bestMove = -1;
        bestMove = findWinningMove('X');
        if (bestMove === -1) bestMove = findWinningMove('O');
        if (bestMove === -1 && board[4] === '') bestMove = 4;
        if (bestMove === -1) {
            const corners = [0, 2, 6, 8].filter(idx => board[idx] === '');
            if (corners.length > 0) bestMove = corners[Math.floor(Math.random() * corners.length)];
        }
        if (bestMove === -1) bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        board[bestMove] = 'X';
        let cell = document.querySelector(`.cell[data-index="${bestMove}"]`);
        cell.innerText = 'X';
        cell.classList.add('x-mark');

        checkResult();
        
        if (isGameActive) {
            currentMark = 'O';
            updateStatusText();
        }
    }

    function findWinningMove(mark) {
        for (let i = 0; i < winConditions.length; i++) {
            const [a, b, c] = winConditions[i];
            let values = [board[a], board[b], board[c]];
            if (values.filter(v => v === mark).length === 2 && values.includes('')) {
                if (board[a] === '') return a;
                if (board[b] === '') return b;
                if (board[c] === '') return c;
            }
        }
        return -1;
    }

    // --- التحقق من الفوز أو التعادل ---
    function checkResult() {
        let roundWon = false;
        let winnerMark = '';

        for (let i = 0; i < winConditions.length; i++) {
            const [a, b, c] = winConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                winnerMark = board[a];
                break;
            }
        }

        if (roundWon) {
            isGameActive = false;
            if (winnerMark === 'O') {
                gameStatus.innerText = (opponentType === 'ai') ? "YOU WIN! 🏆" : "PLAYER 1 WINS! 🏆";
                gameStatus.style.color = "#00e5ff";
                gameStatus.style.textShadow = "0 0 20px #00e5ff";
            } else {
                gameStatus.innerText = (opponentType === 'ai') ? "A.I WINS! 💀" : "PLAYER 2 WINS! 🏆";
                gameStatus.style.color = "crimson";
                gameStatus.style.textShadow = "0 0 20px crimson";
            }
            return;
        }

        if (!board.includes('')) {
            isGameActive = false;
            gameStatus.innerText = "DRAW! 🤝";
            gameStatus.style.color = "#fff";
            gameStatus.style.textShadow = "0 0 10px #fff";
        }
    }

    // أزرار التحكم
    btnRestart.addEventListener('click', () => {
        classicBoard.classList.add('hidden');
        if(opponentType === 'ai') {
            isRpsProcessing = false;
            startRPS();
        } else {
            startCoinToss();
        }
    });

    btnBoardMenu.addEventListener('click', () => {
        classicBoard.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });

        // --- 5. منطق وضع الهرم (Pyramid Dots & Boxes) ---
        function initPyramidGame() {
        pyramidBoard.classList.remove('hidden');
        isGameActive = true;
        pyramidEdges = {};
        pyramidBoxes = [];
        pyramidScores = { O: 0, X: 0 };
        updatePyramidScores();
        
        let edgeCounts = {}; // لحساب عدد المربعات التي تشترك في نفس الضلع
        
        const svg = document.getElementById('pyramid-svg');
        svg.innerHTML = '';
        
        // بناء المكعبات وحساب عدد مرات تكرار كل ضلع
        for(let r = 0; r < 7; r++) {
            for(let c = 0; c < 7; c++) {
                if(diamondMatrix[r][c] === 1) {
                    const top = `H_${r}_${c}`, bottom = `H_${r+1}_${c}`;
                    const left = `V_${r}_${c}`, right = `V_${r}_${c+1}`;
                    
                    pyramidBoxes.push({r, c, edges: [top, bottom, left, right], owner: null});
                    
                    [top, bottom, left, right].forEach(edge => {
                        if(!(edge in pyramidEdges)) {
                            pyramidEdges[edge] = null;
                            edgeCounts[edge] = 0;
                        }
                        edgeCounts[edge]++;
                    });
                }
            }
        }
        
        // الأضلاع الخارجية هي التي يمتلكها مربع واحد فقط (edgeCounts == 1)
        for(let edge in edgeCounts) {
            if(edgeCounts[edge] === 1) {
                pyramidEdges[edge] = 'border'; // نعتبره ضلعاً مبنياً مسبقاً
            }
        }
        
        // رسم الأضلاع
        for(let edge in pyramidEdges) {
            let type = edge[0];
            let parts = edge.split('_');
            let er = parseInt(parts[1]), ec = parseInt(parts[2]);
            
            let x1, y1, x2, y2;
            const size = 45, pad = 10;
            
            if(type === 'H') {
                x1 = pad + ec * size; y1 = pad + er * size;
                x2 = pad + (ec + 1) * size; y2 = pad + er * size;
            } else {
                x1 = pad + ec * size; y1 = pad + er * size;
                x2 = pad + ec * size; y2 = pad + (er + 1) * size;
            }
            
            const isBorder = pyramidEdges[edge] === 'border';
            
            // الخط المرئي
            const visLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            visLine.setAttribute('x1', x1); visLine.setAttribute('y1', y1);
            visLine.setAttribute('x2', x2); visLine.setAttribute('y2', y2);
            visLine.setAttribute('stroke-linecap', 'round');
            visLine.setAttribute('id', `vis-${edge}`);

            if (isBorder) {
                // رسم الحافة الخارجية بالأبيض وبدون خط النقر
                visLine.setAttribute('stroke', '#fff');
                visLine.setAttribute('stroke-width', '4');
                visLine.setAttribute('filter', 'drop-shadow(0 0 5px rgba(255,255,255,0.4))');
                svg.appendChild(visLine);
            } else {
                // رسم الحافة الداخلية وإضافة ميزة النقر
                visLine.setAttribute('stroke', '#333');
                visLine.setAttribute('stroke-width', '4');
                
                const clickLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                clickLine.setAttribute('x1', x1); clickLine.setAttribute('y1', y1);
                clickLine.setAttribute('x2', x2); clickLine.setAttribute('y2', y2);
                clickLine.setAttribute('stroke', 'transparent');
                clickLine.setAttribute('stroke-width', '20');
                clickLine.setAttribute('class', 'edge-click');
                clickLine.style.cursor = 'pointer';
                
                svg.appendChild(visLine);
                svg.appendChild(clickLine);
                
                clickLine.addEventListener('click', () => handleEdgeClick(edge));
            }
        }
        
        // إضافة نصوص X و O للمكعبات (مخفية في البداية)
        pyramidBoxes.forEach((box, i) => {
            const cx = 10 + box.c * 45 + 22.5;
            const cy = 10 + box.r * 45 + 32; 
            
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('x', cx);
            text.setAttribute('y', cy);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('id', `box-${i}`);
            text.setAttribute('style', 'display: none; font-size: 30px; font-weight: 900;');
            svg.appendChild(text);
        });

        updateStatusText();

        if (opponentType === 'ai' && currentMark === 'X') {
            setTimeout(aiPyramidMove, 800);
        }
    }

                function applyPyramidEdge(edgeId, mark) {
        pyramidEdges[edgeId] = mark;
        const visLine = document.getElementById(`vis-${edgeId}`);
        visLine.setAttribute('stroke', mark === 'O' ? '#00e5ff' : 'crimson');
        visLine.setAttribute('filter', mark === 'O' ? 'drop-shadow(0 0 5px #00e5ff)' : 'drop-shadow(0 0 5px crimson)');
        
        let closedBoxes = 0;
        
        pyramidBoxes.forEach((box, i) => {
            if (box.owner === null) {
                let filled = box.edges.filter(e => pyramidEdges[e] !== null).length;
                if (filled === 4) {
                    box.owner = mark;
                    closedBoxes++;
                    pyramidScores[mark]++;
                    const text = document.getElementById(`box-${i}`);
                    text.textContent = mark;
                    text.style.display = 'block';
                    text.setAttribute('fill', mark === 'O' ? '#00e5ff' : 'crimson');
                    text.style.textShadow = mark === 'O' ? '0 0 10px #00e5ff' : '0 0 10px crimson';
                }
            }
        });
        
        updatePyramidScores();
        
        // التحقق من نهاية اللعبة
        if (pyramidBoxes.every(b => b.owner !== null)) {
            isGameActive = false;
            endPyramidGame();
            return;
        }
        
        // التعديل هنا: انتقال الدور دائمًا للخصم بعد كل حركة
        currentMark = currentMark === 'O' ? 'X' : 'O';
        
        updateStatusText();

        // دور الذكاء الاصطناعي إذا كان دوره
        if (isGameActive && opponentType === 'ai' && currentMark === 'X') {
            setTimeout(aiPyramidMove, 800);
        }
    }

            

    function handleEdgeClick(edgeId) {
        if (!isGameActive || pyramidEdges[edgeId] !== null) return;
        if (opponentType === 'ai' && currentMark === 'X') return; 
        
        applyPyramidEdge(edgeId, currentMark);
    }

 
        

    function aiPyramidMove() {
        if(!isGameActive) return;
        
        let availableEdges = Object.keys(pyramidEdges).filter(e => pyramidEdges[e] === null);
        if (availableEdges.length === 0) return;
        
        let chosenEdge = null;
        
        // 1. محاولة إغلاق مربع متاح
        for (let i = 0; i < pyramidBoxes.length; i++) {
            let box = pyramidBoxes[i];
            if (box.owner === null) {
                let emptyEdges = box.edges.filter(e => pyramidEdges[e] === null);
                if (emptyEdges.length === 1) {
                    chosenEdge = emptyEdges[0];
                    break;
                }
            }
        }
        
        // 2. إذا لم يجد، يختار ضلعاً لا يعطي الخصم فرصة إغلاق مربع
        if (!chosenEdge) {
            let safeEdges = availableEdges.filter(e => {
                return !pyramidBoxes.some(box => {
                    if (box.owner !== null) return false;
                    if (box.edges.includes(e)) {
                        let emptyCount = box.edges.filter(be => pyramidEdges[be] === null).length;
                        return emptyCount === 2; // تجنب تحويل المربع إلى مربع بضلع واحد متبقي
                    }
                    return false;
                });
            });
            
            if (safeEdges.length > 0) {
                chosenEdge = safeEdges[Math.floor(Math.random() * safeEdges.length)];
            } else {
                chosenEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
            }
        }
        
        applyPyramidEdge(chosenEdge, 'X');
    }

    function updatePyramidScores() {
        document.getElementById('score-o').innerText = `O: ${pyramidScores.O}`;
        document.getElementById('score-x').innerText = `X: ${pyramidScores.X}`;
    }

    function endPyramidGame() {
        const targetStatus = document.getElementById('pyramid-status');
        if (pyramidScores.O > pyramidScores.X) {
            targetStatus.innerText = (opponentType === 'ai') ? "YOU WIN! 🏆" : "PLAYER 1 WINS! 🏆";
            targetStatus.style.color = "#00e5ff";
            targetStatus.style.textShadow = "0 0 20px #00e5ff";
        } else if (pyramidScores.X > pyramidScores.O) {
            targetStatus.innerText = (opponentType === 'ai') ? "A.I WINS! 💀" : "PLAYER 2 WINS! 🏆";
            targetStatus.style.color = "crimson";
            targetStatus.style.textShadow = "0 0 20px crimson";
        } else {
            targetStatus.innerText = "DRAW! 🤝";
            targetStatus.style.color = "#fff";
            targetStatus.style.textShadow = "0 0 10px #fff";
        }
    }

    // أزرار قائمة الهرم
    document.getElementById('btn-restart-pyramid').addEventListener('click', () => {
        pyramidBoard.classList.add('hidden');
        if(opponentType === 'ai') { isRpsProcessing = false; startRPS(); } else { startCoinToss(); }
    });

    document.getElementById('btn-board-menu-pyramid').addEventListener('click', () => {
        pyramidBoard.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });

    // Helpers
    function showModes() { mainMenu.classList.add('hidden'); modeSelection.classList.remove('hidden'); }
    function enterFullscreen() { const elem = document.documentElement; if (elem.requestFullscreen) elem.requestFullscreen().catch(e=>console.warn(e)); }
    function lockPortrait() { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait').catch(e=>console.warn(e)); }
});
