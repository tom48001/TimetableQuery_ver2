const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const Vue = require('vue');
const Router = require('vue-router');
function store() { const values=new Map(); return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)}; }
function browser(url='http://localhost:8080/', user={id:1,role:'manager'}) {
  const b={location:new URL(url),sessionStorage:store(),localStorage:store()};
  if(user) b.localStorage.setItem('user',JSON.stringify(user));
  b.listeners=[]; b.addEventListener=(type,fn)=>{if(type==='popstate') b.listeners.push(fn);};
  const entries=[null];let index=0;
  b.history={state:null,
    replaceState(state,title,url){this.state=state;entries[index]=state;b.location=new URL(url,b.location);},
    pushState(state,title,url){entries.splice(index+1);entries.push(state);index++;this.state=state;b.location=new URL(url,b.location);},
    go(delta){const next=index+delta;if(next<0||next>=entries.length)return;index=next;this.state=entries[index];b.listeners.forEach(fn=>fn({state:this.state}));}
  };
  return b;
}
function boot(b) {
  b.listeners=[];
  const root=path.join(__dirname,'../../src/router');
  const helper=fs.readFileSync(path.join(root,'rootNavigation.js'),'utf8').replace('export function','function');
  let source=fs.readFileSync(path.join(root,'index.js'),'utf8');
  source=source.replace(/^import (\w+) from .+$/gm,(_,name)=>['Vue','Router'].includes(name)?'':`const ${name} = {};`)
    .replace(/^import \{ initializeRootNavigation \}.*$/gm,'').replace('export default router','module.exports=router');
  const context={Vue,Router,window:b,localStorage:b.localStorage,module:{exports:{}},console};
  vm.runInNewContext(helper+'\n'+source,context);
  return context.module.exports;
}
const push=(r,to)=>new Promise((resolve,reject)=>r.push(to,resolve,reject));
test('real router navigates all registered pages at root and restores query state on refresh',async()=>{
  const b=browser(); const r=boot(b);
  assert.equal(r.currentRoute.name,'home');
  for(const route of r.options.routes.filter(r=>r.name&&!['GoogleRedirect','home'].includes(r.name))) {
    await push(r,{name:route.name}); assert.equal(r.currentRoute.name,route.name);assert.equal(b.location.href,'http://localhost:8080/');
  }
  await push(r,{name:'TeacherTimetableResult',query:{teacherId:'73',teacherName:'Example'}});
  const refreshed=boot(b);assert.equal(refreshed.currentRoute.query.teacherId,'73');assert.equal(refreshed.currentRoute.name,'TeacherTimetableResult');
  await push(refreshed,'/home');await push(refreshed,'/editTeacher');refreshed.back();assert.equal(refreshed.currentRoute.name,'home');
});
test('legacy routes open their intended page and guards still deny unauthorized users',()=>{
  const b=browser('http://localhost:8080/editTeacher');assert.equal(boot(b).currentRoute.name,'editTeacher');assert.equal(b.location.pathname,'/');
  const denied=browser('http://localhost:8080/editTeacher',{id:2,role:'teacher',permissions:{timetable:true}});assert.equal(boot(denied).currentRoute.name,'Forbidden');assert.equal(denied.location.pathname,'/');
  const guest=browser('http://localhost:8080/home',null);assert.equal(boot(guest).currentRoute.name,'login');
});
test('Google callback is kept in memory, never persisted; login errors and storage failure survive',()=>{
  const b=browser('http://localhost:8080/google-redirect?token=TEST_ONLY',null);const r=boot(b);
  assert.equal(r.currentRoute.query.token,'TEST_ONLY');assert.equal(b.location.href,'http://localhost:8080/');assert.equal(b.sessionStorage.getItem('timetable.navigation.v1'),null);
  const err=browser('http://localhost:8080/login?error=google',null);assert.equal(boot(err).currentRoute.query.error,'google');
  const blocked=browser();Object.defineProperty(blocked,'sessionStorage',{get(){throw Error('blocked');}});assert.equal(boot(blocked).currentRoute.name,'home');
});
