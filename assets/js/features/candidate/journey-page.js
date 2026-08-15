const modal = document.querySelector('#detail-modal');
const toast = document.querySelector('#toast');

function openModal(){ modal.hidden = false; }
function showToast(message){ toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }

document.querySelector('#focus-task').addEventListener('click', openModal);
document.querySelector('#open-prep').addEventListener('click', openModal);
document.querySelector('.task-action').addEventListener('click', openModal);
document.querySelector('.modal .close').addEventListener('click', () => modal.hidden = true);
modal.addEventListener('click', event => { if(event.target === modal) modal.hidden = true; });

document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filters button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.opportunity').forEach(item => {
    item.hidden = button.dataset.filter === 'active' && item.dataset.status !== 'active';
  });
}));

document.querySelectorAll('.opportunity').forEach(item => item.addEventListener('click', () => showToast(`已打开 ${item.querySelector('.job strong').textContent} 的机会详情`)));
document.querySelector('#add-application').addEventListener('click', () => showToast('已进入添加求职机会流程'));
document.querySelectorAll('.task-action.light, .panel>header>button').forEach(button => button.addEventListener('click', () => showToast('已打开对应安排')));
