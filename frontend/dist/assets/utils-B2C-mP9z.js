var e={get(e){try{let t=sessionStorage.getItem(e);if(t||=localStorage.getItem(e),!t)return null;try{return JSON.parse(t)}catch{return t}}catch(e){return console.error(`Error reading from storage:`,e),null}},set(e,t){try{let n=JSON.stringify(t);return sessionStorage.setItem(e,n),localStorage.setItem(e,n),!0}catch(e){return console.error(`Error writing to storage:`,e),!1}},remove(e){sessionStorage.removeItem(e),localStorage.removeItem(e)},clear(){sessionStorage.clear(),localStorage.clear()}};function t(e){return new Date(e).toLocaleDateString(`en-IN`,{year:`numeric`,month:`short`,day:`numeric`})}function n(e){let n=new Date-new Date(e),r=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return r<1?`Just now`:r<60?`${r} min${r>1?`s`:``} ago`:i<24?`${i} hour${i>1?`s`:``} ago`:a<7?`${a} day${a>1?`s`:``} ago`:t(e)}function r(e=`Loading...`){let t=document.createElement(`div`);t.id=`loadingOverlay`,t.innerHTML=`
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    ">
      <div style="
        background: var(--bg-elevated);
        padding: 2rem;
        border-radius: var(--radius-xl);
        text-align: center;
      ">
        <div class="spinner" style="margin: 0 auto 1rem;"></div>
        <p style="color: var(--text-primary);">${e}</p>
      </div>
    </div>
  `,document.body.appendChild(t)}function i(){let e=document.getElementById(`loadingOverlay`);e&&e.remove()}function a(e,t=`info`){let n={success:`var(--success)`,error:`var(--error)`,warning:`var(--warning)`,info:`var(--info)`},r=document.createElement(`div`);r.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: var(--bg-elevated);
    border-left: 4px solid ${n[t]||n.info};
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 10000;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
    color: var(--text-primary);
  `,r.textContent=e,document.body.appendChild(r),setTimeout(()=>{r.style.animation=`slideOutRight 0.3s ease-out`,setTimeout(()=>r.remove(),300)},3e3)}var o=document.createElement(`style`);o.textContent=`
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`,document.head.appendChild(o);export{r as a,i,t as n,a as o,n as r,e as t};