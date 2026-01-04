```javascript
// Basic interactive behavior for starter project


document.addEventListener('DOMContentLoaded', function(){
// Preloader percentage demo
let percentEl = document.getElementById('preloader-percent');
let preloader = document.getElementById('preloader');
let p = 0;
let int = setInterval(()=>{
p += Math.floor(Math.random()*6)+2;
if(p>100) p = 100;
percentEl.textContent = p + '%';
if(p>=100){
clearInterval(int);
preloader.classList.add('hidden');
setTimeout(()=>preloader.style.display='none',300);
}
},80);


// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();


// Header shadow on scroll
const header = document.getElementById('site-header');
window.addEventListener('scroll', ()=>{
if(window.scrollY>20) header.classList.add('header-shadow'); else header.classList.remove('header-shadow');
});


// Back to top (desktop only)
const backBtn = document.getElementById('back-to-top');
function toggleBack(){
if(window.innerWidth>768 && window.scrollY>400) backBtn.style.display='block'; else backBtn.style.display='none';
}
window.addEventListener('scroll', toggleBack);
window.addEventListener('resize', toggleBack);
backBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));


// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
a.addEventListener('click', function(e){
e.preventDefault();
const target = document.querySelector(this.getAttribute('href'));
if(target) target.scrollIntoView({behavior:'smooth'});
});
});


// Simple exit-intent: show alert once
let exitShown = false;
document.addEventListener('mouseleave', function(e){
if(e.clientY < 10 && !exitShown){
exitShown = true;
alert('Wait! Before you go — subscribe to our newsletter for a free consultation.');
}
});


// Newsletter pop-up after few seconds
setTimeout(()=>{
if(!localStorage.getItem('newsletterShown')){
if(confirm('Subscribe to our newsletter?')){
localStorage.setItem('newsletterShown','1');
} else {
localStorage.setItem('newsletterShown','1');
}
}
},4200);
});
```


---