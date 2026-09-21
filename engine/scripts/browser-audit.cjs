// Optional visual/click-through audit; install Playwright + Chromium separately.
// Run from engine with npm run play in another terminal and a fresh temporary save.
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8787');await page.getByRole('button',{name:'Rozhlédnout se',exact:true}).click();
 await page.getByRole('button',{name:'Chimney-Hopper Rooftops · 30 min',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#location').textContent==='Chimney-Hopper Rooftops');
 await page.getByRole('button',{name:'Play encounter',exact:true}).last().click();
 await page.waitForFunction(()=>document.querySelector('#combat').textContent.includes('Kolo'));
 await page.screenshot({path:'audit-desktop.png',fullPage:true});await page.reload();
 await page.waitForFunction(()=>document.querySelector('#combat').textContent.includes('Kolo'));
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'audit-mobile.png',fullPage:true});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 console.log({errors,overflow});await browser.close();if(errors.length||overflow)process.exitCode=1;
})();
