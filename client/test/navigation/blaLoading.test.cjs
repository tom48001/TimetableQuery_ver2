const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function harness(fail) {
 const source = fs.readFileSync(path.join(__dirname,'../../src/pages/SubMenu2/BLA.vue'),'utf8').split('<script>')[1].split('</script>')[0].replace(/^import .*$/gm,'').replace('export default','module.exports =');
 const ctx = {module:{exports:{}},console:{error(){}},localStorage:{getItem:()=>null},axios:{get:async url=>{
 if(fail && url.endsWith('class-counts')) throw {response:{status:500}};
 return {data:[]};
 }}};
 vm.runInNewContext(source,ctx);
 const c=ctx.module.exports, state={...c.data(),$lang:{locale:'zh'}};
 for(const [key,method] of Object.entries(c.methods)) state[key]=method.bind(state);
 return state;
}
test('BLA API errors are visible and loading always completes',async()=>{
 const state=harness(true); await state.loadData();
 assert.match(state.loadError,/HTTP 500/); assert.equal(state.loading,false);
 assert.equal(state.subjects.length,0);
});
test('empty eligibility is distinct from an API failure',async()=>{
 const state=harness(false); await state.loadData();
 assert.equal(state.loadError,''); assert.equal(state.loading,false);
 assert.equal(Object.keys(state.counts).length,0);
});
