<script setup lang="ts">
import {reactive, ref} from "vue";
import {ElMessage} from "element-plus";

const calcVariable = reactive({
  money : 0,
  playCnt : 10000,
})

const gemInformation = reactive({
  gem : [0,0,0,0,0],
})

let gemJson = "";
const craft_need = [3,3,2,2]
const craft_p = [0.5,0.4,0.3,0.25]
let successCnt = [0, 0, 0, 0];
let calculating = ref<boolean>(false);
let showResult = ref<boolean>(false);
let successRate = reactive([0,0,0,0]);
let config = {
  money : 0,
  playCnt : 10000,
  gem : [0,0,0,0,0],
}

interface Situation{
  level5: number,
  level4: number,
  level3: number,
  level2: number,
  level1: number,
  viewLevel1: string,
  cnt: number
  p: string
}

let situation:Situation[] = new Array(37)

const zip = (gem_list:number[]) => {
  return gem_list[0] + gem_list[1]*3 + gem_list[2]*3*3 + gem_list[3]*3*3*2 + gem_list[4]*3*3*2*2
}

const initialization = () => {
  successCnt = [0, 0, 0, 0]
  // Level 1 Craft
  const gem = [
    Math.floor(calcVariable.money / 5000) + gemInformation.gem[0],
    gemInformation.gem[1],
    gemInformation.gem[2],
    gemInformation.gem[3],
    0
  ];
  gemJson = JSON.stringify(gem)
  for(let level4=0;level4<2;level4++){
    for(let level3=0;level3<2;level3++){
      for(let level2=0;level2<3;level2++){
        for(let level1=0;level1<3;level1++){
          let key = zip([level1,level2,level3,level4,0])
          situation[key] = {
            p: "",
            cnt: 0,
            viewLevel1: level1.toString(),
            level1: level1,
            level2: level2,
            level3: level3,
            level4: level4,
            level5: 0
          }
        }
      }
    }
  }
  situation[zip([0,0,0,0,1])] = {
    p: "",
    cnt: 0,
    viewLevel1: "5级宝石合成成功",
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 1
  }
  config = {
    money: calcVariable.money,
    playCnt: calcVariable.playCnt,
    gem: [gemInformation.gem[0],gemInformation.gem[1],gemInformation.gem[2],gemInformation.gem[3],0]
  }
}

const craft = (possibility : number) => {
  return Math.random() < possibility ? 1 : 0;
}

const playOnce = () => {
  let craft_gem = JSON.parse(gemJson)
  for(let i=0;i<4;i++){
    while(craft_gem[i] >= craft_need[i]){
      craft_gem[i] -= craft_need[i]
      craft_gem[i+1] += craft(craft_p[i])
      if(craft_gem[4] !== 0){ //合成成功，立即终止
        break
      }
    }
    if(craft_gem[i+1] >= 0.5){
      successCnt[i] = successCnt[i] + 1
    }
  }
  if(craft_gem[4] === 0){
    situation[zip(craft_gem)].cnt++
  }else{
    situation[zip([0,0,0,0,1])].cnt++
  }
}

const calculate = () => {
  showResult.value = false
  calculating.value = true
  new Promise(resolve => {
    setTimeout(() => {
      resolve(null)
    }, 50)
  }).then(()=>{
    new Promise((resolve) => {
      initialization()
      for(let i=0; i<config.playCnt; i++){
        playOnce()
      }
      // 后处理
      for(let i=0;i<4;i++){
        successRate[i] = successCnt[i] / config.playCnt * 100;
      }
      for(let i=0;i<situation.length;i++){
        situation[i].p = (situation[i].cnt / config.playCnt * 100).toFixed(2) + "%"
      }
      situation.sort((a,b)=>{
        return -(a.cnt - b.cnt)
      })
      for(let i=0;i<situation.length;i++){
        if(situation[i].cnt === 0){
          situation = situation.slice(0,i)
          break
        }
      }
      console.log("Finished")
      resolve(null)
    }).then(() => {
      calculating.value = false
      showResult.value = true
      ElMessage({
        message: "计算完成",
        type: "success"
      })
    }).catch((error) => {
      calculating.value = false
      showResult.value = false
      ElMessage({
        message: "出现错误，请反馈：" + error,
        type: "error"
      })
    })
  })
}

const showPossibility = (index :number) => {
  for(let i=3; i>=index; i--){
      if(config.gem[i] !== 0){
        return false
      }
  }
  return true
}
const tagText = (value:number) => {
  if(value < 20) {
    return "概率极低"
  }else if(value < 50){
    return "概率较低"
  }else if (value < 80){
    return "概率适中"
  }else{
    return "概率较高"
  }
}

const tagColor = (value:number) => {
  if(value < 20) {
    return "danger"
  }else if(value < 50){
    return "warning"
  }else if (value < 80){
    return "success"
  }else{
    return ""
  }
}

interface SpanMethodProps {
  row: Situation,
  columnIndex: number,
}
const arraySpanMethod = ({
                           row,
                           columnIndex,
                         }: SpanMethodProps) => {
  if (row.level5 === 1) {
    if (columnIndex === 0) {
      return [1, 4]
    } else if (columnIndex >= 1 && columnIndex < 4) {
      return [0, 0]
    }
  }
}
</script>

<template>
  <el-divider> 计算参数 </el-divider>

  <el-form :inline="true" :model="calcVariable"  class="demo-form-inline" label-position="right" label-width="70px" @change="showResult = false">
    <el-form-item label="测试次数">
      <el-input-number v-model="calcVariable.playCnt" :min="0" :controls="false"/>
    </el-form-item>

    <el-form-item label="桃源币">
      <el-input-number v-model="calcVariable.money" :min="0" :controls="false"/>
    </el-form-item>
  </el-form>

  <el-divider> 宝石拥有数量 </el-divider>

  <el-form :inline="true" :model="gemInformation" class="demo-form-inline" label-position="right" label-width="70px" @change="showResult = false">
    <el-form-item v-for="i in 4" :label="i.toString() + '级宝石' ">
      <el-input-number v-model="gemInformation.gem[i-1]" :min="0" :controls="false" style="width: 100%"/>
    </el-form-item>
  </el-form>

  <el-button type="primary" style="width: 100%" @click="calculate" :loading="calculating"> 计算 </el-button>

  <el-divider v-if="showResult">解锁图鉴概率</el-divider>

  <el-row justify="center" v-if="showResult">
    <el-col :span="6" v-for="i of 4" v-show="showPossibility(i)">
      <el-statistic :value="successRate[i-1]" :precision="1" :title="(i+1).toString() +'级宝石'" suffix="%"/>
      <el-tag :type="tagColor(successRate[i-1])">{{ tagText(successRate[i-1]) }}</el-tag>
    </el-col>
  </el-row>

  <el-divider v-if="showResult">剩余宝石情况</el-divider>

  <p class="el-text" style="text-align: start" v-if="showResult">*手机端可左右拖动</p>

  <el-table v-if="showResult" :data="situation" style="width: 100%;max-width: 500px;margin:auto" :stripe="true" :border="true" :span-method="arraySpanMethod">
    <el-table-column prop="viewLevel1" label="1级" align="center"/>
    <el-table-column prop="level2" label="2级" align="center"/>
    <el-table-column prop="level3" label="3级" align="center"/>
    <el-table-column prop="level4" label="4级" align="center"/>
    <el-table-column prop="p" label="概率" width="100" align="center"/>
  </el-table>


  <el-divider>计算策略</el-divider>
  <p class="el-text">首先，舰长会将所有桃源币尽可能多的购买1级宝石。</p>
  <p class="el-text">在每级合成的过程中，舰长会从低级到高级，尽可能的消耗低级宝石合成高级宝石，直到低级宝石消耗到无法继续合成为止。</p>
  <p class="el-text">例如，舰长会先将手中1级宝石全部合成为2级宝石（直到不能合成），再将2级宝石全部合成为3级宝石。</p>
  <p class="el-text">当无法继续合成或者成功合成出5级宝石后，本次实验终止。</p>
  <p class="el-text">注意：算法复杂度O(n^2)，前端运行，不要输太大数据避免网页卡顿。</p>

  <el-divider>信息</el-divider>
  <p class="el-text">5000x 桃源币 => 1x 1级宝石</p>
  <p class="el-text">3x 1级宝石 => 1x 2级宝石（50%成功）</p>
  <p class="el-text">3x 2级宝石 => 1x 3级宝石（40%成功）</p>
  <p class="el-text">2x 3级宝石 => 1x 4级宝石（30%成功）</p>
  <p class="el-text">2x 4级宝石 => 1x 5级宝石（25%成功）</p>

</template>

<style>
.demo-form-inline .el-input-number{
    width: 100%;
}
.demo-form-inline .el-form-item{
  width: 200px;
}
</style>