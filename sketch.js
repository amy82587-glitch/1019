// p5.js 選擇題測驗系統 - 絕對不卡 Loading 版 (sketch.js)

// 內建完整 15 題，確保任何情況下都絕對有題目可以玩，秒開不延遲
let allQuestions = [
  { question: "請問在 p5.js 中，用來設定畫布大小的指令是？", options: ["createCanvas()", "background()", "sizeCanvas()", "windowSize()"], answer: 0 },
  { question: "要在畫布背景填入顏色，應使用下列哪個指令？", options: ["color()", "background()", "fill()", "stroke()"], answer: 1 },
  { question: "下列哪個指令用來設定圖形內部的填滿顏色？", options: ["color()", "stroke()", "fill()", "rect()"], answer: 2 },
  { question: "要在畫布上繪製一個長方形，應使用哪個指令？", options: ["circle()", "ellipse()", "rect()", "line()"], answer: 2 },
  { question: "p5.js 中會不斷重複執行（繪製動畫）的函式名稱是？", options: ["setup()", "draw()", "loop()", "init()"], answer: 1 },
  { question: "請問用來在畫布上畫一個圓形的指令是？", options: ["circle()", "rect()", "line()", "point()"], answer: 0 },
  { question: "下列何者不是 p5.js 的滑鼠互動變數？", options: ["mouseX", "mouseY", "mouseIsPressed", "mouseClickedSpeed"], answer: 3 },
  { question: "請問用來設定圖形邊框外框顏色的指令是？", options: ["stroke()", "fill()", "color()", "background()"], answer: 0 },
  { question: "如果要設定圖形外框的粗細，應使用下列哪個指令？", options: ["weight()", "strokeWeight()", "lineWidth()", "borderSize()"], answer: 1 },
  { question: "請問下列哪個指令可以讓畫布不隨便重複執行 draw() 迴圈？", options: ["stop()", "halt()", "noLoop()", "pause()"], answer: 2 },
  { question: "當滑鼠被按下時，p5.js 會自動觸發下列哪一個事件函式？", options: ["mousePressed()", "mouseClick()", "onMousePress()", "clickMouse()"], answer: 0 },
  { question: "請問在 p5.js 中，用來繪製一條線段的指令是？", options: ["line()", "stroke()", "draw()", "segment()"], answer: 0 },
  { question: "下列哪一個函式只會在程式執行一開始時執行一次？", options: ["draw()", "setup()", "init()", "begin()"], answer: 1 },
  { question: "請問用來在畫布上顯示文字的指令是？", options: ["print()", "drawText()", "text()", "show()"], answer: 2 },
  { question: "如果要關閉圖形的外框線，應使用哪個指令？", options: ["noStroke()", "borderOff()", "strokeNone()", "disableStroke()"], answer: 0 }
];

let questions = [];    // 每次隨機抽出的 5 題
let currentQuestion = 0; 
let score = 0;           
let answered = false;    
let selectedOption = -1; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('Chiron Sung HK, Bitcount Ink, sans-serif');
  
  // 嘗試在背景非同步載入您的 Google 試算表（如果成功會自動覆蓋成最新雲端題庫）
  let googleUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTEGJgRzOxdvVieMd7yxOAUWeGoeOogDrvMeBPLlcluDEjIBZP3RwwkO7aNNzcl8pc3rwJnsj0KDp1C/pub?gid=1867688297&single=true&output=csv';
  
  loadTable(googleUrl, 'csv', 'header', 
    (table) => {
      let cloudQuestions = [];
      for (let i = 0; i < table.getRowCount(); i++) {
        let q = table.getString(i, 'question');
        let o1 = table.getString(i, 'opt1');
        let o2 = table.getString(i, 'opt2');
        let o3 = table.getString(i, 'opt3');
        let o4 = table.getString(i, 'opt4');
        let ans = int(table.getString(i, 'answer'));
        if (q && q.trim() !== "") {
          cloudQuestions.push({ question: q, options: [o1, o2, o3, o4], answer: ans });
        }
      }
      if (cloudQuestions.length > 0) {
        allQuestions = cloudQuestions;
        startNewQuiz();
        console.log("成功切換為雲端試算表題庫！");
      }
    },
    (err) => {
      console.log("使用內建/本機備用題庫");
    }
  );

  // 馬上初始化，確保畫面秒開不等待
  startNewQuiz();
}

function startNewQuiz() {
  let shuffled = shuffle([...allQuestions]);
  questions = shuffled.slice(0, 5);
  
  currentQuestion = 0;
  score = 0;
  answered = false;
  selectedOption = -1;
}

function draw() {
  background(245, 247, 250);
  
  if (questions.length === 0) return;
  
  if (currentQuestion >= questions.length) {
    drawResultScreen();
    return;
  }
  
  let isMobile = width < 768;
  
  // 1. 頂部進度標題（絕對置中）
  push();
  fill(60);
  textSize(isMobile ? 16 : 20);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(`p5.js 簡易指令測驗 (第 ${currentQuestion + 1} 題 / 共 5 題)`, width / 2, height * 0.08);
  pop();
  
  // 2. 題目文字（絕對置中）
  push();
  fill(30);
  textSize(isMobile ? 18 : 23);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(questions[currentQuestion].question, width / 2, height * 0.17);
  pop();
  
  // 3. 選項按鈕動態響應式排版（完美置中）
  let boxWidth = constrain(width * 0.82, 280, 600);
  let boxHeight = isMobile ? 46 : 56;
  let startY = height * 0.32; 
  let spacing = boxHeight + (isMobile ? 18 : 14); 
  
  let opts = questions[currentQuestion].options;
  let correctIdx = questions[currentQuestion].answer;
  
  for (let i = 0; i < opts.length; i++) {
    let bx = width / 2 - boxWidth / 2; 
    let by = startY + i * spacing;
    
    let fillColor = color(255);
    let strokeColor = color(200);
    let textColor = color(40);
    
    if (answered) {
      if (i === correctIdx) {
        fillColor = color("#e0f3ff"); 
        strokeColor = color(0, 130, 200);
        textColor = color(0, 90, 140);
        
        let bounce = sin(frameCount * 0.15) * 4;
        by += bounce;
      }
      
      if (i === selectedOption && i !== correctIdx) {
        strokeColor = color(220, 50, 50);
        fillColor = color(255, 230, 230);
      }
    }
    
    push();
    stroke(strokeColor);
    strokeWeight(2);
    fill(fillColor);
    rect(bx, by, boxWidth, boxHeight, 10);
    
    noStroke();
    fill(textColor);
    textSize(isMobile ? 16 : 20);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(`${i + 1}. ${opts[i]}`, width / 2, by + boxHeight / 2);
    pop();
  }
  
  // 4. 作答後的提示文字與「下一題」按鈕
  if (answered) {
    let lastOptionBottom = startY + (opts.length - 1) * spacing + boxHeight;
    let feedbackY = lastOptionBottom + (isMobile ? 24 : 20);
    
    push();
    textSize(isMobile ? 16 : 20);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    fill(selectedOption === correctIdx ? color(0, 140, 0) : color(210, 40, 40));
    text(
      selectedOption === correctIdx ? "答對了！太棒了！點擊下方繼續" : "答錯了！正確答案已用藍色標示。",
      width / 2,
      feedbackY
    );
    pop();
    
    drawCenteredActionButton("下一題", feedbackY + (isMobile ? 32 : 25), isMobile);
  }
}

// 滑鼠點擊事件
function mousePressed() {
  let isMobile = width < 768;
  
  if (currentQuestion >= questions.length) {
    let btnW = isMobile ? width * 0.55 : 220;
    let btnH = isMobile ? 46 : 54;
    let btnX = width / 2 - btnW / 2;
    let btnY = height * 0.65;
    
    if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
      startNewQuiz();
    }
    return;
  }
  
  if (answered) {
    let boxHeight = isMobile ? 46 : 56;
    let startY = height * 0.32;
    let spacing = boxHeight + (isMobile ? 18 : 14);
    let lastOptionBottom = startY + 3 * spacing + boxHeight;
    let feedbackY = lastOptionBottom + (isMobile ? 24 : 20);
    
    let btnW = isMobile ? width * 0.55 : 200;
    let btnH = isMobile ? 46 : 54;
    let btnX = width / 2 - btnW / 2;
    let btnY = feedbackY + (isMobile ? 32 : 25);
    
    if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
      currentQuestion++;
      answered = false;
      selectedOption = -1;
    }
    return;
  }
  
  let boxWidth = constrain(width * 0.82, 280, 600);
  let boxHeight = isMobile ? 46 : 56;
  let startY = height * 0.32;
  let spacing = boxHeight + (isMobile ? 18 : 14);
  
  let opts = questions[currentQuestion].options;
  
  for (let i = 0; i < opts.length; i++) {
    let bx = width / 2 - boxWidth / 2;
    let by = startY + i * spacing;
    
    if (
      mouseX >= bx &&
      mouseX <= bx + boxWidth &&
      mouseY >= by &&
      mouseY <= by + boxHeight
    ) {
      selectedOption = i;
      answered = true;
      if (selectedOption === questions[currentQuestion].answer) {
        score++;
      }
      break;
    }
  }
}

// 繪製置中按鈕
function drawCenteredActionButton(label, yPos, isMobile) {
  let btnW = isMobile ? width * 0.55 : 200;
  let btnH = isMobile ? 46 : 54;
  let btnX = width / 2 - btnW / 2;
  
  push();
  fill(76, 175, 80);
  noStroke();
  rect(btnX, yPos, btnW, btnH, 10);
  
  fill(255);
  textSize(isMobile ? 17 : 20);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, width / 2, yPos + btnH / 2);
  pop();
}

// 繪製結算畫面
function drawResultScreen() {
  let isMobile = width < 768;
  
  push();
  fill(40);
  textSize(isMobile ? 24 : 34);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("測驗結束！", width / 2, height * 0.28);
  
  textSize(isMobile ? 18 : 24);
  fill(80);
  text(`您總共答對了 ${score} 題（滿分 5 題）`, width / 2, height * 0.40);
  
  textSize(isMobile ? 16 : 20);
  if (score === 5) {
    fill(0, 140, 0);
    text("太強了！您對 p5.js 相當熟悉！", width / 2, height * 0.50);
  } else if (score >= 3) {
    fill(0, 90, 180);
    text("表現不錯！再多練習一下就更完美囉！", width / 2, height * 0.50);
  } else {
    fill(200, 90, 0);
    text("加油！建議多複習 p5.js 的基本指令喔！", width / 2, height * 0.50);
  }
  pop();
  
  drawCenteredActionButton("重新測驗", height * 0.65, isMobile);
}

// 視窗大小改變時自動縮放
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}