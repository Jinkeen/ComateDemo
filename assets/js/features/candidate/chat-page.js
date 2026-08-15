const home = document.querySelector('#chat-home');
const scene = document.querySelector('#call-scene');
const result = document.querySelector('#result-layer');
const question = document.querySelector('#ai-question');
const transcript = document.querySelector('#transcript');
const timer = document.querySelector('#timer');
const toast = document.querySelector('#toast');

const questions = [
  ['先从刚刚那场面试开始吧。哪个瞬间让你觉得自己没有表达好？', '我讲到项目失误时有点乱，好像一直在补充细节。'],
  ['如果重来一次，你最希望对方听懂哪一件事？', '我其实很快找到了问题，还协调团队改了方案。'],
  ['你当时是怎么让团队重新达成一致的？', '我先把分歧拆成目标、资源和时间，再让大家逐项确认。']
];
let index = 0;
let seconds = 0;
let timerId;

document.querySelectorAll('.topic-card').forEach(card => card.addEventListener('click', () => {
  document.querySelectorAll('.topic-card').forEach(item => item.classList.remove('selected'));
  card.classList.add('selected');
}));

function startCall(){
  home.hidden = true;
  scene.hidden = false;
  index = 0;
  seconds = 0;
  question.textContent = questions[0][0];
  transcript.textContent = '你可以像和朋友聊天一样，慢慢说。';
  timer.textContent = '00:00';
  clearInterval(timerId);
  timerId = setInterval(() => {
    seconds += 1;
    timer.textContent = `00:${String(seconds).padStart(2,'0')}`;
  }, 1000);
}

function finishCall(){
  clearInterval(timerId);
  scene.hidden = true;
  result.hidden = false;
}

document.querySelector('#start-call').addEventListener('click', startCall);
document.querySelector('#next-question').addEventListener('click', () => {
  transcript.textContent = `“${questions[index][1]}”`;
  if(index < questions.length - 1){
    index += 1;
    setTimeout(() => { question.textContent = questions[index][0]; transcript.textContent = '我在听，你可以继续。'; }, 520);
  } else {
    setTimeout(finishCall, 650);
  }
});
document.querySelector('#finish-call').addEventListener('click', finishCall);
document.querySelector('#back-home').addEventListener('click', () => { clearInterval(timerId); scene.hidden = true; home.hidden = false; });
document.querySelector('#toggle-mic').addEventListener('click', event => event.currentTarget.classList.toggle('muted'));
document.querySelector('#discard-result').addEventListener('click', () => { result.hidden = true; home.hidden = false; });
document.querySelector('#confirm-result').addEventListener('click', () => {
  result.hidden = true;
  home.hidden = false;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
});
