const app = document.querySelector(".app");
const table = document.querySelector(".table");
const timer = document.querySelector(".timer");
const winningTime = document.querySelector('.winning-time');
const loseTime = document.querySelector('.lose-time');
const banner = document.querySelector('.banner');
const startBoard = document.querySelector(".start-board");
const winningBoard = document.querySelector(".winning-board");
const loseBoard = document.querySelector('.lose-board');
const btns = document.querySelectorAll('.btn');
const bombBox = document.querySelector(".bomb-box");

//table設定
const tableCellCount = 100;
const rows = 10;
const columns = 10;
const bombs = 20;
let bombPosition = [];
let checkedCounter = 0;

//遊戲狀態
const GAME_STATE = {
  'start': 'start',
  'playing': 'playing',
  'winning': 'winning',
  'over': 'over'
}
let currentState = GAME_STATE['start'];

//處理畫面
const view = {
  renderGameBoard(){
    const arr = this.shuffleBoard();
    let rawHTML = ``;
    arr.forEach((item, i)=> {
      rawHTML += `
        <div class='cell' id=${i} data-symbol='${item}'></div>
        `
    })
    table.innerHTML = rawHTML
  },
  bombCount(){
    for(let i = 0; i < 100; i++){
      let total = 0;
      //定義左、右兩側
      const isLeftSide = (i % rows === 0);
      const isRightSide = (i % rows === 9);

      //左 不為第一個、不在最左邊、左邊的位置含地雷
      if(i > 0 && !isLeftSide && document.querySelectorAll('.cell')[i - 1].dataset.symbol === 'bomb') total++

      //右
      if(i < 99 && !isRightSide && document.querySelectorAll('.cell')[i + 1].dataset.symbol === 'bomb') total++

      //上
      if(i > 9 && document.querySelectorAll('.cell')[i - 10].dataset.symbol === 'bomb') total++

      //下
      if(i < 90 && document.querySelectorAll('.cell')[i + 10].dataset.symbol === 'bomb') total++

      //右上
      if(i > 9 && !isRightSide && document.querySelectorAll('.cell')[i - 9].dataset.symbol === 'bomb') total++

      //右下
      if(i < 89 && !isRightSide && document.querySelectorAll('.cell')[i + 11].dataset.symbol === 'bomb') total++

      //左上
      if(i > 10 && !isLeftSide && document.querySelectorAll('.cell')[i - 11].dataset.symbol === 'bomb') total++

      //左下
      if(i < 89 && !isLeftSide && document.querySelectorAll('.cell')[i + 9].dataset.symbol === 'bomb') total++

      document.querySelectorAll('.cell')[i].setAttribute('bombs', total)
    }
  },
  shuffleBoard(){
    const validArray = Array(tableCellCount - bombs).fill('valid');
    const bombsArray = Array(bombs).fill('bomb');
    const shuffleArray = validArray.concat(bombsArray);
    
    for(let i = shuffleArray.length - 1; i > 0; i--){
      let j = Math.floor(Math.random() * (i + 1));
      [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
    }
    return shuffleArray
  },
  showTitleBomb(){
    bombBox.innerText=`${bombs}`
  },
  showBanner(state){
    switch(state){
      case 'start':
        startBoard.classList.remove('d-none');
        break;
      case 'over':
        loseBoard.classList.remove('d-none')
        break;
      case 'winning': 
        winningBoard.classList.remove('d-none')
        break;
    }
  }
}

//控制狀態
const controller = {
  isPlayerWin(target){
    // 1.地雷全數被正確標記
    if(target.dataset.symbol === 'bomb' && target.classList.contains('tagged')){
      const bombIndex = bombPosition.indexOf(target.id);
        if(bombIndex >= 0){
          bombPosition.splice(bombIndex, 1);
        }
    } else if (target.dataset.symbol === 'bomb'){
        bombPosition.push(target.id)
    }
     
    // 2.是否全數都踩過且地雷數量為0
    if(bombPosition.length === 0 && checkedCounter === 80) {
      console.log(currentState)
      setTimeout(()=>{
        currentState = 'winning';
        winningTime.innerText = setTimer.counter;
        view.showBanner('winning');
        controller.resetGame();
      }, 500);
    }
  },
  dispatchGameState(state){
    view.renderGameBoard();
    view.bombCount();
    utility.getBombPosition();
    view.showTitleBomb();
    view.showBanner(state);

    btns.forEach(btn => {
      btn.addEventListener('click', e=> {
        e.target.closest('.board').classList.add('d-none');
        setTimer.startTimer();
      })
    })

    if(state !== 'playing'){
      currentState = GAME_STATE['playing']
    }
  },
  resetGame(){
    //重設初始狀態
    currentState = GAME_STATE['start'];
    bombPosition = [];
    checkedCounter = 0;    
    timer.innerText = 0;
    setTimer.counter = 0;    

    btns.forEach(btn => {
      btn.addEventListener('click', e=> {
        e.target.closest('.board').classList.add('d-none');
      })
    })

    view.renderGameBoard();
    view.bombCount();
    utility.getBombPosition();
    view.showTitleBomb();
  }
}

//功能
const utility = {
  getBombPosition(){
    document.querySelectorAll('.cell').forEach(cell => {
      if(cell.dataset.symbol === 'bomb'){
        bombPosition.push(cell.id);
      } 
    })
  },
  handleClick(target, action){
    
    //點擊滑鼠右鍵
    if(action === 0){
      //避免重複點擊
      if(target.classList.contains('checked') || target.classList.contains('tagged') || target.classList.contains('bomb')) return
      
      //判斷是否踩到地雷
      if(target.dataset.symbol === 'valid'){
        target.classList.add('checked')
        checkedCounter++;

        if(target.getAttribute('bombs') !== '0'){
          target.innerText=`${target.getAttribute('bombs')}`;
        }
        this.isBombsAround(target)

      } else if (target.dataset.symbol === 'bomb'){
        target.classList.add('bomb')
        target.innerHTML += `💣`

        setTimeout(()=>{
          currentState = 'over';
          loseTime.innerText = setTimer.counter;
          setTimer.stopTimer();
          view.showBanner('over');
          controller.resetGame();
        }, 500)
      }
      //點擊滑鼠左鍵
    } else if(action === 2){
      if(target.classList.contains('checked') || target.classList.contains('bomb')) return
      
      //判斷是否已經被標記，若已標記取消標記
      if(target.classList.contains('tagged')){
        target.classList.toggle('tagged')
        target.innerHTML = ``;
        bombBox.innerText ++;
      } else {
        target.classList.toggle('tagged')
        target.innerText += `🚩`

        //數量最少為0
        if(bombBox.innerText <= 0){
          bombBox.innerText = 0;
        }else {
          bombBox.innerText -= 1;
        }
      }
    }
    controller.isPlayerWin(target)
  },
  isBombsAround(target){
    //若地雷數不為0不繼續展開
    if(target.getAttribute('bombs') !== '0') return
    
    //定義最左側與最右側
    const isLeftSide = (Number(target.id) % rows === 0);
    const isRightSide = (Number(target.id) % rows === 9);

    //左
    if(Number(target.id) > 0 && !isLeftSide){
      this.handleClick(document.querySelectorAll('.cell')[Number(target.id) - 1], 0) 
    }

    //右
    if(Number(target.id) < 99 && !isRightSide){
      this.handleClick(document.querySelectorAll('.cell')[Number(target.id) + 1], 0) 
    }

    //上
    if(Number(target.id) > 9 ) {
      this.handleClick(document.querySelectorAll('.cell')[Number(target.id) - 10], 0)
    }

    //下
    if(Number(target.id) < 90 ) {
      this.handleClick(document.querySelectorAll('.cell')[Number(target.id) + 10], 0)
    }

    //左下
    if(Number(target.id) < 89 && !isLeftSide) {
      this.handleClick(document.querySelectorAll('.cell')[Number(target.id) + 9], 0)
    }

    //左上
    if(Number(target.id) > 10 && !isLeftSide) {
      this.handleClick(document.querySelectorAll('.cell')[Number(target.id) - 11], 0)
    }

    //右下
    if(Number(target.id) < 89 && !isRightSide){
      this.handleClick(document.querySelectorAll('.cell')[Number(target.id) + 11], 0)
    }

    //右上
    if(Number(target.id) > 9 && !isRightSide){
      this.handleClick(document.querySelectorAll('.cell')[Number(target.id) - 9], 0)
    }
  },
}

//計時器
const setTimer = {
  counter: 0,
  setTimerID: "",
  startTimer() {
    this.setTimerID = setInterval(() => {
      this.counter += 1;
      timer.innerText = this.counter;
    }, 1000);
  },
  stopTimer() {
    clearInterval(this.setTimerID);
  }
}

controller.dispatchGameState(currentState);

app.addEventListener("contextmenu", (e) => e.preventDefault());
document.querySelectorAll('.table').forEach(item => {
  item.addEventListener('mouseup', e => {
    const target = e.target;
    const action = e.button;
    utility.handleClick(target, action)
  })
})

