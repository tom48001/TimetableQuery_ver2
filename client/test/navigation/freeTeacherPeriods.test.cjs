const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
function component(name){let code=fs.readFileSync(path.join(__dirname,'../../src/pages/SubMenu1/',name+'.vue'),'utf8').split('<script>')[1].split('</script>')[0].replace(/^import .*$/gm,'').replace('export default','module.exports =');const ctx={module:{exports:{}}};vm.runInNewContext(code,ctx);return ctx.module.exports;}
test('free teacher periods merge 11 into 9 and 12 into 10 without hiding busy lessons',()=>{
 const c=component('FreeTeacherResult');const ctx={tr:(en)=>en};const lookup=c.methods.classAt.bind(ctx);
 assert.equal(lookup({lessons:[{period_id:11,class_name:'4M'}]},9),'4M');
 assert.equal(lookup({lessons:[{period_id:12,class_name:'5M'}]},10),'5M');
 assert.equal(lookup({lessons:[{period_id:11,class_name:'4M'}]},10),'');
 assert.equal(lookup({lessons:[{period_id:9,class_name:'1M'},{period_id:11,class_name:'4M'}]},9),'1M / 4M');
 assert.equal(lookup({lessons:[{period_id:11,class_name:null}]},9),'Busy');
 assert.equal(c.data().periodNumbers.length,10);
 assert.equal(component('FreeTeacher').data().periodNumbers.length,10);
});
